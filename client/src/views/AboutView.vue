<template>
  <div class="about">
    <h1>关于</h1>
    
    <div class="info">
      <h2>RTSP 流媒体转发服务</h2>
      <p>版本: 1.0.0</p>
      
      <h3>技术栈</h3>
      <ul>
        <li>前端: Vue 3 + TypeScript + Element Plus</li>
        <li>后端: Node.js + Express + WebSocket</li>
        <li>流媒体: FFmpeg</li>
        <li>构建工具: Vite</li>
      </ul>
      
      <h3>功能特性</h3>
      <ul>
        <li>RTSP 流转发为 HTTP-FLV / HLS / WebRTC</li>
        <li>多路流管理</li>
        <li>实时状态监控</li>
        <li>WebSocket 实时推流</li>
      </ul>
    </div>

    <div class="actions">
      <router-link to="/" class="btn">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.info {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  margin: 2rem 0;
}

h1 {
  color: #42b883;
}

h2 {
  color: #333;
  margin-top: 0;
}

h3 {
  color: #666;
  margin-top: 1.5rem;
}

ul {
  line-height: 1.8;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
