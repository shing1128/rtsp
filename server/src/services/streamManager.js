const FFmpegService = require('./ffmpegService');
const config = require('../config');
const logger = require('../utils/logger');

class StreamManager {
  constructor(wss) {
    this.wss = wss;
    this.streams = new Map(); // cameraId -> FFmpegService instance
    this.clients = new Map(); // ws -> Set(cameraId)
  }

  // 启动所有启用的流
  startAllStreams() {
    logger.info('Starting all enabled streams...');
    const { cameraManager } = require('../models/camera');
    const cameras = cameraManager.getEnabled();
    
    cameras.forEach(camera => {
      this.startStream(camera);
    });
  }

  // 停止所有流
  stopAllStreams() {
    logger.info('Stopping all streams...');
    this.streams.forEach((ffmpegService, cameraId) => {
      this.stopStream(cameraId);
    });
  }

  // 启动单个流
  startStream(camera) {
    if (this.streams.has(camera.id)) {
      logger.warn(`Stream ${camera.id} is already running`);
      return false;
    }

    logger.info(`Starting stream for camera: ${camera.name} (${camera.id})`);

    const ffmpegService = new FFmpegService(camera);
    
    // 设置回调
    ffmpegService
      .onData((data) => {
        this.broadcastVideoData(camera.id, data);
      })
      .onError((err) => {
        logger.error(`Stream error for ${camera.id}:`, err.message);
      })
      .onStatus((statusInfo) => {
        this.handleStreamStatus(statusInfo);
      });

    const started = ffmpegService.start();
    
    if (started) {
      this.streams.set(camera.id, ffmpegService);
      return true;
    }
    
    return false;
  }

  // 停止单个流
  stopStream(cameraId) {
    const ffmpegService = this.streams.get(cameraId);
    if (!ffmpegService) {
      return false;
    }

    logger.info(`Stopping stream: ${cameraId}`);
    ffmpegService.stop();
    this.streams.delete(cameraId);
    this.broadcastStatus(cameraId, 'stopped');
    return true;
  }

  // 重启流
  restartStream(cameraId) {
    const { cameraManager } = require('../models/camera');
    const camera = cameraManager.getById(cameraId);
    
    if (!camera) {
      logger.error(`Cannot restart stream: camera ${cameraId} not found`);
      return false;
    }

    this.stopStream(cameraId);
    
    // 延迟后重新启动
    setTimeout(() => {
      this.startStream(camera);
    }, 1000);

    return true;
  }

  // 处理流状态变化
  handleStreamStatus(statusInfo) {
    const { cameraId, status } = statusInfo;
    
    logger.debug(`Stream status changed for ${cameraId}: ${status}`);
    
    // 更新摄像头模型中的状态
    const { cameraManager } = require('../models/camera');
    cameraManager.updateStatus(cameraId, status);
    
    // 广播状态给所有订阅的客户端
    this.broadcastStatus(cameraId, status, statusInfo);
  }

  // 订阅视频流
  subscribeStream(ws, cameraId) {
    if (!this.clients.has(ws)) {
      this.clients.set(ws, new Set());
    }
    this.clients.get(ws).add(cameraId);
    
    logger.info(`Client subscribed to stream: ${cameraId}`);
    
    // 检查流是否已启动，如果没有则启动
    const { cameraManager } = require('../models/camera');
    const camera = cameraManager.getById(cameraId);
    
    if (camera && camera.enabled && !this.streams.has(cameraId)) {
      this.startStream(camera);
    }
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      cameraId,
      timestamp: Date.now()
    }));
  }

  // 取消订阅
  unsubscribeStream(ws, cameraId) {
    const subscriptions = this.clients.get(ws);
    if (subscriptions) {
      subscriptions.delete(cameraId);
      logger.info(`Client unsubscribed from stream: ${cameraId}`);
    }
    
    ws.send(JSON.stringify({
      type: 'unsubscribed',
      cameraId,
      timestamp: Date.now()
    }));
    
    // 检查是否还有客户端订阅此流
    let hasSubscribers = false;
    this.clients.forEach((subs) => {
      if (subs.has(cameraId)) {
        hasSubscribers = true;
      }
    });
    
    // 如果没有订阅者，可以考虑停止流（可选）
    if (!hasSubscribers) {
      logger.debug(`No subscribers for stream ${cameraId}, but keeping it running`);
    }
  }

  // 移除客户端
  removeClient(ws) {
    this.clients.delete(ws);
  }

  // 广播流状态
  broadcastStatus(cameraId, status, extraInfo = {}) {
    const message = JSON.stringify({
      type: 'streamStatus',
      cameraId,
      status,
      ...extraInfo,
      timestamp: Date.now()
    });

    this.clients.forEach((subscriptions, ws) => {
      if (subscriptions.has(cameraId) && ws.readyState === 1) {
        ws.send(message);
      }
    });
  }

  // 广播视频数据
  broadcastVideoData(cameraId, data) {
    this.clients.forEach((subscriptions, ws) => {
      if (subscriptions.has(cameraId) && ws.readyState === 1) {
        ws.send(data);
      }
    });
  }

  // 获取流统计信息
  getStats() {
    const stats = {
      total: this.streams.size,
      active: 0,
      streams: []
    };

    this.streams.forEach((ffmpegService, cameraId) => {
      const serviceStats = ffmpegService.getStats();
      stats.streams.push(serviceStats);
      
      if (serviceStats.isRunning) {
        stats.active++;
      }
    });

    return stats;
  }
}

module.exports = StreamManager;