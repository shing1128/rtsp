require('dotenv').config();

// 解析环境变量
function parseEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value;
}

function parseIntEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseJsonEnv(key, defaultValue) {
  const value = process.env[key];
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to parse ${key} as JSON, using default value`);
    return defaultValue;
  }
}

// 配置对象
const config = {
  // 服务器配置
  port: parseIntEnv('PORT', 3000),
  nodeEnv: parseEnv('NODE_ENV', 'development'),
  
  // 摄像头配置
  cameras: parseJsonEnv('CAMERAS', []),
  
  // 流媒体参数
  stream: {
    width: parseIntEnv('STREAM_WIDTH', 1280),
    height: parseIntEnv('STREAM_HEIGHT', 720),
    bitrate: parseEnv('STREAM_BITRATE', '2000k'),
    fps: parseIntEnv('STREAM_FPS', 25),
    codec: parseEnv('STREAM_CODEC', 'libx264'),
    format: parseEnv('STREAM_FORMAT', 'flv'),
    hlsTime: parseIntEnv('HLS_TIME', 2),
    hlsListSize: parseIntEnv('HLS_LIST_SIZE', 5)
  },
  
  // WebSocket 配置
  ws: {
    port: parseIntEnv('WS_PORT', parseIntEnv('PORT', 3000)),
    heartbeatInterval: parseIntEnv('WS_HEARTBEAT_INTERVAL', 30000),
    clientTimeout: parseIntEnv('WS_CLIENT_TIMEOUT', 60000)
  },
  
  // FFmpeg 配置
  ffmpeg: {
    path: parseEnv('FFMPEG_PATH', 'ffmpeg'),
    inputTimeout: parseIntEnv('FFMPEG_INPUT_TIMEOUT', 5000000),
    maxReconnect: parseIntEnv('FFMPEG_MAX_RECONNECT', 5),
    reconnectInterval: parseIntEnv('FFMPEG_RECONNECT_INTERVAL', 5000),
    analyzeDuration: parseIntEnv('FFMPEG_ANALYZE_DURATION', 1000000),
    probeSize: parseIntEnv('FFMPEG_PROBE_SIZE', 2048)
  },
  
  // 日志配置
  log: {
    level: parseEnv('LOG_LEVEL', 'info'),
    file: parseEnv('LOG_FILE', './logs/app.log'),
    maxSize: parseIntEnv('LOG_MAX_SIZE', 50),
    maxFiles: parseIntEnv('LOG_MAX_FILES', 5)
  },
  
  // CORS 配置
  cors: {
    origin: parseEnv('CORS_ORIGIN', '*')
  },
  
  // 安全配置
  security: {
    apiSecretKey: parseEnv('API_SECRET_KEY', ''),
    rateLimit: parseIntEnv('RATE_LIMIT', 100)
  }
};

// 验证摄像头配置
if (!Array.isArray(config.cameras)) {
  console.warn('CAMERAS 配置不是有效的数组，使用空数组');
  config.cameras = [];
}

// 导出配置
module.exports = config;
