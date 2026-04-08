<template>
  <div class="monitor-view">
    <h1>监控中心</h1>
    <p>实时视频监控</p>
    
    <div class="monitor-grid">
      <div v-for="camera in enabledCameras" :key="camera.id" class="monitor-item">
        <div class="camera-card">
          <div class="camera-header">
            <span class="camera-name">{{ camera.name }}</span>
            <el-tag :type="getStatusType(camera.status)" size="small">
              {{ getStatusText(camera.status) }}
            </el-tag>
          </div>
          <div class="video-container">
            <!-- TODO: 视频播放器组件 -->
            <div class="video-placeholder">
              <el-icon :size="48"><VideoCamera /></el-icon>
              <p>视频播放区域</p>
            </div>
          </div>
          <div class="camera-actions">
            <el-button 
              v-if="!isSubscribed(camera.id)"
              type="primary" 
              size="small"
              @click="subscribe(camera.id)"
            >
              订阅
            </el-button>
            <el-button 
              v-else
              type="danger" 
              size="small"
              @click="unsubscribe(camera.id)"
            >
              取消订阅
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="enabledCameras.length === 0" class="empty-state">
      <el-empty description="没有启用的摄像头" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCameraStore } from '@/store/camera'
import { useStreamStore } from '@/store/stream'
import type { Camera } from '@/types'

const cameraStore = useCameraStore()
const streamStore = useStreamStore()

const enabledCameras = computed(() => cameraStore.enabledCameras)
const isSubscribed = (cameraId: string) => streamStore.isSubscribed(cameraId)

onMounted(() => {
  cameraStore.fetchCameras()
  streamStore.fetchStreamStats()
})

onUnmounted(() => {
  streamStore.disconnectWebSocket()
})

function subscribe(cameraId: string) {
  streamStore.subscribe(cameraId)
}

function unsubscribe(cameraId: string) {
  streamStore.unsubscribe(cameraId)
}

function getStatusType(status: Camera['status']) {
  switch (status) {
    case 'online': return 'success'
    case 'offline': return 'info'
    case 'error': return 'danger'
    default: return 'info'
  }
}

function getStatusText(status: Camera['status']) {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'error': return '错误'
    default: return '未知'
  }
}
</script>

<style scoped>
.monitor-view {
  padding: 20px;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.camera-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.camera-name {
  font-weight: 500;
  color: #303133;
}

.video-container {
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  color: #909399;
  text-align: center;
}

.camera-actions {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-state {
  margin-top: 100px;
}
</style>