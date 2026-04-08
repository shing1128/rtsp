// 环境变量加载
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

// 导入配置
const config = require('./config');

// 导入路由
const cameraRoutes = require('./routes/camera');
const { router: streamRoutes, setStreamManager } = require('./routes/stream');

// 导入服务
const StreamManager = require('./services/streamManager');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// 创建 Express 应用
const app = express();
const server = http.createServer(app);

// 中间件
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// 路由
app.use('/api/cameras', cameraRoutes);
app.use('/api/streams', streamRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'
});

// 流管理器
const streamManager = new StreamManager(wss);
setStreamManager(streamManager);

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
  logger.info(`WebSocket connected from ${req.socket.remoteAddress}`);
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to RTSP streaming server'
  }));
  
  // 处理消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON message'
      }));
    }
  });
  
  // 心跳
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // 关闭处理
  ws.on('close', () => {
    logger.info('WebSocket disconnected');
    streamManager.removeClient(ws);
  });
  
  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
});

// WebSocket 消息处理
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      // 订阅视频流
      streamManager.subscribeStream(ws, data.cameraId);
      break;
      
    case 'unsubscribe':
      // 取消订阅
      streamManager.unsubscribeStream(ws, data.cameraId);
      break;
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
      
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${data.type}`
      }));
  }
}

// 心跳检测
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, config.ws.heartbeatInterval);

// 启动服务器
const PORT = config.port;
server.listen(PORT, () => {
  logger.info('=================================');
  logger.info('RTSP Streaming Server Started');
  logger.info('=================================');
  logger.info(`HTTP Server: http://localhost:${PORT}`);
  logger.info(`WebSocket: ws://localhost:${PORT}/ws`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info('=================================');
  
  // 启动所有启用的摄像头流
  streamManager.startAllStreams();
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  clearInterval(heartbeatInterval);
  streamManager.stopAllStreams();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  clearInterval(heartbeatInterval);
  streamManager.stopAllStreams();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
