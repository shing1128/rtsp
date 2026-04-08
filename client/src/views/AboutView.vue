<template>
  <div class="about-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关于 RTSP 流媒体服务</span>
          <el-tag type="success">v1.0.0</el-tag>
        </div>
      </template>
      
      <el-descriptions title="系统信息" :column="2" border>
        <el-descriptions-item label="系统名称">RTSP 流媒体转发服务</el-descriptions-item>
        <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="构建时间">2024-01-01</el-descriptions-item>
        <el-descriptions-item label="许可证">MIT</el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <h3>技术栈</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><Monitor /></el-icon>
                <span>前端技术</span>
              </div>
            </template>
            <ul class="tech-list">
              <li>Vue 3 + Composition API</li>
              <li>TypeScript</li>
              <li>Element Plus UI</li>
              <li>Pinia 状态管理</li>
              <li>Vue Router 4</li>
              <li>Vite 构建工具</li>
            </ul>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><Cpu /></el-icon>
                <span>后端技术</span>
              </div>
            </template>
            <ul class="tech-list">
              <li>Node.js</li>
              <li>Express.js</li>
              <li>WebSocket (ws)</li>
              <li>FFmpeg 流媒体</li>
              <li>Fluent FFmpeg</li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
      
      <el-divider />
      
      <h3>功能特性</h3>
      <el-timeline>
        <el-timeline-item type="success">
          <h4>RTSP 流转发</h4>
          <p>支持将 RTSP 流转发为 HTTP-FLV、HLS 等格式</p>
        </el-timeline-item>
        <el-timeline-item type="primary">
          <h4>多路流管理</h4>
          <p>同时管理多个摄像头流，支持批量操作</p>
        </el-timeline-item>
        <el-timeline-item type="warning">
          <h4>实时状态监控</h4>
          <p>WebSocket 实时推送流状态，可视化监控</p>
        </el-timeline-item>
        <el-timeline-item type="info">
          <h4>自动重连</h4>
          <p>断线自动重连，保证服务稳定性</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped>
.about-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.tech-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  color: #606266;
}

.tech-list li {
  margin-bottom: 4px;
}

h3 {
  margin: 20px 0 16px 0;
  color: #303133;
}

h4 {
  margin: 0 0 8px 0;
  color: #409EFF;
}

p {
  margin: 0;
  color: #909399;
}
</style>