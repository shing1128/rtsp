<template>
  <div class="home">
    <h1>RTSP 流媒体转发服务</h1>
    <p>欢迎使用 RTSP 流媒体转发管理系统</p>
    
    <div class="stats">
      <div class="stat-card">
        <h3>在线流数量</h3>
        <p class="number">{{ onlineStreams.length }}</p>
      </div>
      <div class="stat-card">
        <h3>总流数量</h3>
        <p class="number">{{ streamCount }}</p>
      </div>
    </div>

    <div class="actions">
      <router-link to="/streams" class="btn">管理流</router-link>
      <router-link to="/about" class="btn secondary">关于</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStreamStore } from '../stores/stream'
import { storeToRefs } from 'pinia'

const streamStore = useStreamStore()
const { onlineStreams, streamCount } = storeToRefs(streamStore)
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #42b883;
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.stat-card {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 150px;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.number {
  font-size: 2rem;
  font-weight: bold;
  color: #42b883;
  margin: 0;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn:hover {
  background: #3aa876;
}

.btn.secondary {
  background: #666;
}

.btn.secondary:hover {
  background: #555;
}
</style>
