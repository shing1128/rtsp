const ffmpeg = require('fluent-ffmpeg');
const config = require('../config');
const logger = require('../utils/logger');

class FFmpegService {
  constructor(camera) {
    this.camera = camera;
    this.command = null;
    this.process = null;
    this.isRunning = false;
    this.reconnectAttempts = 0;
    this.startTime = null;
    this.outputBuffer = Buffer.alloc(0);
    this.onDataCallback = null;
    this.onErrorCallback = null;
    this.onStatusCallback = null;
  }

  // 设置回调函数
  onData(callback) {
    this.onDataCallback = callback;
    return this;
  }

  onError(callback) {
    this.onErrorCallback = callback;
    return this;
  }

  onStatus(callback) {
    this.onStatusCallback = callback;
    return this;
  }

  // 启动 FFmpeg 流
  start() {
    if (this.isRunning) {
      logger.warn(`FFmpeg stream for ${this.camera.id} is already running`);
      return false;
    }

    logger.info(`Starting FFmpeg stream for camera: ${this.camera.name} (${this.camera.id})`);
    this.reconnectAttempts = 0;

    try {
      this.command = this.createFFmpegCommand();
      this.setupEventHandlers();
      this.command.run();
      this.isRunning = true;
      this.startTime = Date.now();
      this.emitStatus('starting');
      return true;
    } catch (error) {
      logger.error(`Failed to start FFmpeg for ${this.camera.id}:`, error);
      this.handleError(error);
      return false;
    }
  }

  // 停止 FFmpeg 流
  stop() {
    if (!this.isRunning || !this.command) {
      return false;
    }

    logger.info(`Stopping FFmpeg stream: ${this.camera.id}`);
    this.isRunning = false;
    this.emitStatus('stopping');

    try {
      // 先尝试优雅关闭
      this.command.kill('SIGTERM');
      
      // 3秒后强制关闭
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          logger.warn(`Force killing FFmpeg process for ${this.camera.id}`);
          this.command.kill('SIGKILL');
        }
      }, 3000);

      return true;
    } catch (error) {
      logger.error(`Error stopping FFmpeg for ${this.camera.id}:`, error);
      return false;
    }
  }

  // 创建 FFmpeg 命令
  createFFmpegCommand() {
    const { stream, ffmpeg } = config;
    const cmd = ffmpeg(this.camera.rtspUrl);

    // 输入选项
    cmd.inputOptions([
      `-rtsp_transport ${this.camera.protocol || 'tcp'}`,
      `-analyzeduration ${ffmpeg.analyzeDuration}`,
      `-probesize ${ffmpeg.probeSize}`,
      `-stimeout ${ffmpeg.inputTimeout}`,
      '-re', // 按输入帧率读取
      '-fflags nobuffer',
      '-flags low_delay'
    ]);

    // 视频编码选项
    cmd.videoCodec(stream.codec)
      .size(`${stream.width}x${stream.height}`)
      .fps(stream.fps)
      .videoBitrate(stream.bitrate)
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-tune zerolatency',
        `-g ${stream.fps * 2}`, // GOP 大小为 2 秒
        '-keyint_min 25',
        '-sc_threshold 0',
        '-profile:v baseline',
        '-level 3.0'
      ]);

    // 禁用音频（如果需要音频可以取消注释并配置）
    cmd.noAudio();

    // 输出格式
    switch (stream.format) {
      case 'flv':
        cmd.format('flv');
        cmd.outputOptions(['-flvflags no_duration_filesize']);
        break;
      case 'hls':
        this.setupHLSOutput(cmd);
        break;
      case 'mpegts':
        cmd.format('mpegts');
        break;
      default:
        cmd.format('flv');
    }

    // 输出到管道
    cmd.pipe();

    return cmd;
  }

  // 设置 HLS 输出
  setupHLSOutput(cmd) {
    const { stream } = config;
    const outputPath = `./streams/${this.camera.id}`;
    
    // 确保输出目录存在
    const fs = require('fs');
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    cmd.outputOptions([
      '-f hls',
      `-hls_time ${stream.hlsTime}`,
      `-hls_list_size ${stream.hlsListSize}`,
      '-hls_flags delete_segments+omit_endlist',
      '-hls_segment_filename', `${outputPath}/segment_%03d.ts`,
      `${outputPath}/index.m3u8`
    ]);

    // HLS 模式下不使用 pipe
    cmd.save(`${outputPath}/index.m3u8`);
  }

  // 设置事件处理器
  setupEventHandlers() {
    this.command
      .on('start', (commandLine) => {
        logger.info(`FFmpeg started for ${this.camera.id}: ${commandLine}`);
        this.emitStatus('started');
      })
      .on('codecData', (data) => {
        logger.debug(`Codec data for ${this.camera.id}:`, {
          format: data.format,
          video: data.video,
          audio: data.audio
        });
      })
      .on('progress', (progress) => {
        logger.debug(`FFmpeg progress for ${this.camera.id}:`, progress);
      })
      .on('stderr', (stderrLine) => {
        // 解析 FFmpeg 日志
        this.parseFFmpegLog(stderrLine);
      })
      .on('error', (err) => {
        this.handleError(err);
      })
      .on('end', () => {
        this.handleEnd();
      });

    // 获取 FFmpeg 进程
    this.command.on('spawn', (process) => {
      this.process = process;
      
      // 捕获标准输出数据
      if (process.stdout) {
        process.stdout.on('data', (data) => {
          if (this.onDataCallback && config.stream.format !== 'hls') {
            this.onDataCallback(data);
          }
        });
      }
    });
  }

  // 解析 FFmpeg 日志
  parseFFmpegLog(line) {
    // 过滤掉正常的进度信息
    if (line.includes('frame=') || line.includes('fps=') || line.includes('size=')) {
      return;
    }

    // 检测错误
    if (line.includes('Error') || line.includes('error') || line.includes('failed')) {
      logger.error(`FFmpeg error for ${this.camera.id}:`, line);
      
      // 特定的错误处理
      if (line.includes('Connection refused')) {
        this.emitStatus('connection_refused');
      } else if (line.includes('Connection timed out')) {
        this.emitStatus('connection_timeout');
      } else if (line.includes('Invalid data')) {
        this.emitStatus('invalid_data');
      }
    } else if (line.includes('warning') || line.includes('Warning')) {
      logger.warn(`FFmpeg warning for ${this.camera.id}:`, line);
    } else {
      logger.debug(`FFmpeg log for ${this.camera.id}:`, line);
    }
  }

  // 处理错误
  handleError(err) {
    logger.error(`FFmpeg error for ${this.camera.id}:`, err.message);
    this.isRunning = false;
    
    if (this.onErrorCallback) {
      this.onErrorCallback(err);
    }

    this.emitStatus('error');
    this.attemptReconnect();
  }

  // 处理结束
  handleEnd() {
    logger.info(`FFmpeg ended for ${this.camera.id}`);
    
    if (this.isRunning) {
      // 非正常结束，尝试重连
      this.isRunning = false;
      this.emitStatus('ended_unexpectedly');
      this.attemptReconnect();
    } else {
      // 正常停止
      this.emitStatus('stopped');
    }
  }

  // 尝试重连
  attemptReconnect() {
    const { ffmpeg } = config;
    
    if (this.reconnectAttempts < ffmpeg.maxReconnect) {
      this.reconnectAttempts++;
      logger.info(`Reconnecting stream ${this.camera.id} (attempt ${this.reconnectAttempts}/${ffmpeg.maxReconnect})...`);
      
      this.emitStatus('reconnecting');
      
      setTimeout(() => {
        this.start();
      }, ffmpeg.reconnectInterval);
    } else {
      logger.error(`Max reconnection attempts reached for ${this.camera.id}`);
      this.emitStatus('max_reconnect_reached');
    }
  }

  // 发射状态
  emitStatus(status) {
    if (this.onStatusCallback) {
      this.onStatusCallback({
        cameraId: this.camera.id,
        status,
        timestamp: Date.now(),
        reconnectAttempts: this.reconnectAttempts,
        uptime: this.startTime ? Date.now() - this.startTime : 0
      });
    }
  }

  // 获取流统计信息
  getStats() {
    return {
      cameraId: this.camera.id,
      isRunning: this.isRunning,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

module.exports = FFmpegService;