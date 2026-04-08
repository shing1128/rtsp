const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../../data');
const CAMERAS_FILE = path.join(DATA_DIR, 'cameras.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 摄像头模型类
class Camera {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name || '未命名摄像头';
    this.rtspUrl = data.rtspUrl || '';
    this.enabled = data.enabled !== false; // 默认启用
    this.protocol = data.protocol || 'tcp';
    this.resolution = data.resolution || '1280x720';
    this.fps = data.fps || 25;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.status = data.status || 'offline';
    this.lastConnected = data.lastConnected || null;
    this.reconnectCount = data.reconnectCount || 0;
    this.description = data.description || '';
  }

  // 生成唯一ID
  generateId() {
    return 'cam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 验证摄像头数据
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('摄像头名称不能为空');
    }

    if (!this.rtspUrl || this.rtspUrl.trim().length === 0) {
      errors.push('RTSP地址不能为空');
    } else {
      // 验证 RTSP URL 格式
      const rtspRegex = /^rtsp:\/\/[^:]+:[^@]+@[^:]+:\d+\/.*$/;
      if (!rtspRegex.test(this.rtspUrl)) {
        errors.push('RTSP地址格式不正确，应为: rtsp://username:password@host:port/path');
      }
    }

    if (!['tcp', 'udp', 'udp_multicast'].includes(this.protocol)) {
      errors.push('传输协议必须是 tcp、udp 或 udp_multicast');
    }

    return errors;
  }

  // 转换为 JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      rtspUrl: this.rtspUrl,
      enabled: this.enabled,
      protocol: this.protocol,
      resolution: this.resolution,
      fps: this.fps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      lastConnected: this.lastConnected,
      reconnectCount: this.reconnectCount,
      description: this.description
    };
  }

  // 获取公开的摄像头信息（隐藏敏感信息）
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      protocol: this.protocol,
      resolution: this.resolution,
      fps: this.fps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      lastConnected: this.lastConnected,
      description: this.description
    };
  }
}

// 摄像头管理器
class CameraManager {
  constructor() {
    this.cameras = new Map();
    this.loadCameras();
  }

  // 加载摄像头数据
  loadCameras() {
    try {
      if (fs.existsSync(CAMERAS_FILE)) {
        const data = fs.readFileSync(CAMERAS_FILE, 'utf8');
        const camerasData = JSON.parse(data);
        
        camerasData.forEach(camData => {
          const camera = new Camera(camData);
          this.cameras.set(camera.id, camera);
        });
        
        logger.info(`Loaded ${this.cameras.size} cameras from storage`);
      } else {
        // 从环境变量加载默认摄像头
        const config = require('../config');
        if (config.cameras && config.cameras.length > 0) {
          config.cameras.forEach(camData => {
            const camera = new Camera(camData);
            this.cameras.set(camera.id, camera);
          });
          logger.info(`Loaded ${this.cameras.size} cameras from environment config`);
          this.saveCameras();
        }
      }
    } catch (error) {
      logger.error('Failed to load cameras:', error);
    }
  }

  // 保存摄像头数据
  saveCameras() {
    try {
      const camerasData = Array.from(this.cameras.values()).map(cam => cam.toJSON());
      fs.writeFileSync(CAMERAS_FILE, JSON.stringify(camerasData, null, 2), 'utf8');
      logger.debug('Cameras saved to storage');
    } catch (error) {
      logger.error('Failed to save cameras:', error);
    }
  }

  // 获取所有摄像头
  getAll() {
    return Array.from(this.cameras.values());
  }

  // 获取所有启用的摄像头
  getEnabled() {
    return this.getAll().filter(cam => cam.enabled);
  }

  // 根据ID获取摄像头
  getById(id) {
    return this.cameras.get(id);
  }

  // 创建摄像头
  create(data) {
    const camera = new Camera(data);
    
    const errors = camera.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // 检查是否已存在相同RTSP地址的摄像头
    const existing = this.getAll().find(cam => cam.rtspUrl === camera.rtspUrl);
    if (existing) {
      throw new Error('已存在相同RTSP地址的摄像头');
    }

    this.cameras.set(camera.id, camera);
    this.saveCameras();
    
    logger.info(`Camera created: ${camera.name} (${camera.id})`);
    return camera;
  }

  // 更新摄像头
  update(id, data) {
    const camera = this.cameras.get(id);
    if (!camera) {
      throw new Error('摄像头不存在');
    }

    // 更新字段
    if (data.name !== undefined) camera.name = data.name;
    if (data.rtspUrl !== undefined) camera.rtspUrl = data.rtspUrl;
    if (data.enabled !== undefined) camera.enabled = data.enabled;
    if (data.protocol !== undefined) camera.protocol = data.protocol;
    if (data.resolution !== undefined) camera.resolution = data.resolution;
    if (data.fps !== undefined) camera.fps = data.fps;
    if (data.description !== undefined) camera.description = data.description;
    
    camera.updatedAt = new Date().toISOString();

    const errors = camera.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    this.cameras.set(id, camera);
    this.saveCameras();
    
    logger.info(`Camera updated: ${camera.name} (${camera.id})`);
    return camera;
  }

  // 删除摄像头
  delete(id) {
    const camera = this.cameras.get(id);
    if (!camera) {
      throw new Error('摄像头不存在');
    }

    this.cameras.delete(id);
    this.saveCameras();
    
    logger.info(`Camera deleted: ${camera.name} (${camera.id})`);
    return camera;
  }

  // 更新摄像头状态
  updateStatus(id, status) {
    const camera = this.cameras.get(id);
    if (!camera) {
      return null;
    }

    camera.status = status;
    
    if (status === 'online') {
      camera.lastConnected = new Date().toISOString();
      camera.reconnectCount = 0;
    } else if (status === 'error') {
      camera.reconnectCount++;
    }
    
    camera.updatedAt = new Date().toISOString();
    
    this.cameras.set(id, camera);
    this.saveCameras();
    
    return camera;
  }

  // 获取摄像头统计信息
  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      enabled: all.filter(c => c.enabled).length,
      online: all.filter(c => c.status === 'online').length,
      offline: all.filter(c => c.status === 'offline').length,
      error: all.filter(c => c.status === 'error').length
    };
  }
}

// 创建单例实例
const cameraManager = new CameraManager();

module.exports = {
  Camera,
  cameraManager
};