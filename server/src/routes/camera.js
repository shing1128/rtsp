const express = require('express');
const router = express.Router();
const { cameraManager } = require('../models/camera');
const { asyncHandler } = require('../middleware/errorHandler');

// 获取所有摄像头
router.get('/', asyncHandler(async (req, res) => {
  const cameras = cameraManager.getAll();
  res.json({
    success: true,
    data: cameras.map(cam => cam.toPublicJSON())
  });
}));

// 获取摄像头统计信息
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = cameraManager.getStats();
  res.json({
    success: true,
    data: stats
  });
}));

// 获取单个摄像头
router.get('/:id', asyncHandler(async (req, res) => {
  const camera = cameraManager.getById(req.params.id);
  
  if (!camera) {
    return res.status(404).json({
      success: false,
      message: '摄像头不存在'
    });
  }
  
  res.json({
    success: true,
    data: camera.toPublicJSON()
  });
}));

// 创建摄像头
router.post('/', asyncHandler(async (req, res) => {
  const { name, rtspUrl, protocol, resolution, fps, description } = req.body;
  
  const camera = cameraManager.create({
    name,
    rtspUrl,
    protocol: protocol || 'tcp',
    resolution: resolution || '1280x720',
    fps: fps || 25,
    description,
    enabled: true
  });
  
  res.status(201).json({
    success: true,
    message: '摄像头创建成功',
    data: camera.toPublicJSON()
  });
}));

// 更新摄像头
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, rtspUrl, protocol, resolution, fps, enabled, description } = req.body;
  
  const camera = cameraManager.update(req.params.id, {
    name,
    rtspUrl,
    protocol,
    resolution,
    fps,
    enabled,
    description
  });
  
  res.json({
    success: true,
    message: '摄像头更新成功',
    data: camera.toPublicJSON()
  });
}));

// 删除摄像头
router.delete('/:id', asyncHandler(async (req, res) => {
  cameraManager.delete(req.params.id);
  
  res.json({
    success: true,
    message: '摄像头删除成功'
  });
}));

// 启用/禁用摄像头
router.patch('/:id/enable', asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  
  const camera = cameraManager.update(req.params.id, { enabled });
  
  res.json({
    success: true,
    message: `摄像头已${enabled ? '启用' : '禁用'}`,
    data: camera.toPublicJSON()
  });
}));

// 测试 RTSP 连接
router.post('/:id/test', asyncHandler(async (req, res) => {
  const camera = cameraManager.getById(req.params.id);
  
  if (!camera) {
    return res.status(404).json({
      success: false,
      message: '摄像头不存在'
    });
  }
  
  // TODO: 实现 RTSP 连接测试
  res.json({
    success: true,
    message: '连接测试功能待实现',
    data: {
      cameraId: camera.id,
      status: 'not_tested'
    }
  });
}));

module.exports = router;