const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');

// 获取流管理器实例（在 index.js 中初始化）
let streamManager = null;

// 设置流管理器
function setStreamManager(manager) {
  streamManager = manager;
}

// 获取流状态
router.get('/status', asyncHandler(async (req, res) => {
  if (!streamManager) {
    return res.status(503).json({
      success: false,
      message: '流服务未初始化'
    });
  }
  
  const stats = streamManager.getStats();
  res.json({
    success: true,
    data: stats
  });
}));

// 启动流
router.post('/:cameraId/start', asyncHandler(async (req, res) => {
  if (!streamManager) {
    return res.status(503).json({
      success: false,
      message: '流服务未初始化'
    });
  }
  
  const { cameraManager } = require('../models/camera');
  const camera = cameraManager.getById(req.params.cameraId);
  
  if (!camera) {
    return res.status(404).json({
      success: false,
      message: '摄像头不存在'
    });
  }
  
  const started = streamManager.startStream(camera);
  
  res.json({
    success: started,
    message: started ? '流启动成功' : '流启动失败或已在运行'
  });
}));

// 停止流
router.post('/:cameraId/stop', asyncHandler(async (req, res) => {
  if (!streamManager) {
    return res.status(503).json({
      success: false,
      message: '流服务未初始化'
    });
  }
  
  const stopped = streamManager.stopStream(req.params.cameraId);
  
  res.json({
    success: stopped,
    message: stopped ? '流停止成功' : '流未运行'
  });
}));

// 重启流
router.post('/:cameraId/restart', asyncHandler(async (req, res) => {
  if (!streamManager) {
    return res.status(503).json({
      success: false,
      message: '流服务未初始化'
    });
  }
  
  const restarted = streamManager.restartStream(req.params.cameraId);
  
  res.json({
    success: restarted,
    message: restarted ? '流重启中' : '流重启失败'
  });
}));

// 获取特定摄像头的流状态
router.get('/:cameraId/status', asyncHandler(async (req, res) => {
  if (!streamManager) {
    return res.status(503).json({
      success: false,
      message: '流服务未初始化'
    });
  }
  
  const { cameraManager } = require('../models/camera');
  const camera = cameraManager.getById(req.params.cameraId);
  
  if (!camera) {
    return res.status(404).json({
      success: false,
      message: '摄像头不存在'
    });
  }
  
  const ffmpegService = streamManager.streams.get(req.params.cameraId);
  
  res.json({
    success: true,
    data: {
      cameraId: req.params.cameraId,
      isRunning: ffmpegService ? ffmpegService.isRunning : false,
      stats: ffmpegService ? ffmpegService.getStats() : null
    }
  });
}));

module.exports = {
  router,
  setStreamManager
};