<template>
  <div class="streams">
    <h1>流管理</h1>
    
    <div class="stream-list">
      <div v-if="streams.length === 0" class="empty">
        暂无流配置
      </div>
      
      <div v-else class="stream-grid">
        <div 
          v-for="stream in streams" 
          :key="stream.id"
          class="stream-card"
          :class="stream.status"
        >
          <h3>{{ stream.name }}</h3>
          <p class="url">{{ stream.url }}</p>
          <span class="status" :class="stream.status">{{ stream.status }}</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link to="/" class="btn">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStreamStore } from '../stores/stream'
import { storeToRefs } from 'pinia'

const streamStore = useStreamStore()
const { streams } = storeToRefs(streamStore)

// 添加一些示例数据
streamStore.addStream({
  name: '测试摄像头 1',
  url: 'rtsp://192.168.1.100:554/stream1',
  status: 'online'
})

streamStore.addStream({
  name: '测试摄像头 2', 
  url: 'rtsp://192.168.1.101:554/stream1',
  status: 'offline'
})
</script>

<style scoped>
.streams {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stream-list {
  margin: 2rem 0;
}

.empty {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.stream-card {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ccc;
}

.stream-card.online {
  border-left-color: #42b883;
}

.stream-card.offline {
  border-left-color: #999;
}

.stream-card.error {
  border-left-color: #e74c3c;
}

.stream-card h3 {
  margin: 0 0 0.5rem 0;
}

.url {
  color: #666;
  font-size: 0.9rem;
  word-break: break-all;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.status.online {
  background: #42b883;
  color: white;
}

.status.offline {
  background: #999;
  color: white;
}

.status.error {
  background: #e74c3c;
  color: white;
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
