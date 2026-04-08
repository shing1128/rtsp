<template>
  <div class="home-view">
    <div class="hero-section">
      <h1>RTSP 流媒体转发服务</h1>
      <p class="subtitle">欢迎使用 RTSP 流媒体转发管理系统</p>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409EFF"><VideoCamera /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ cameraStats?.total || 0 }}</div>
              <div class="stat-label">摄像头总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67c23a"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value text-success">{{ cameraStats?.online || 0 }}</div>
              <div class="stat-label">在线</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#e6a23c"><Loading /></el-icon>
            <div class="stat-info">
              <div class="stat-value text-warning">{{ activeStreams.length }}</div>
              <div class="stat-label">流运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#f56c6c"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value text-danger">{{ cameraStats?.error || 0 }}</div>
              <div class="stat-label">异常</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="actions-card">
      <template #header>
        <span>快捷操作</span>
      </template>
      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/monitor')">
          <el-icon><Monitor /></el-icon>
          进入监控中心
        </el-button>
        <el-button type="success" size="large" @click="$router.push('/cameras')">
          <el-icon><VideoCamera /></el-icon>
          管理摄像头
        </el-button>
        <el-button type="warning" size="large" @click="$router.push('/streams')">
          <el-icon><DataLine /></el-icon>
          流管理
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCameraStore } from '@/store/camera'
import { useStreamStore } from '@/store/stream'

const cameraStore = useCameraStore()
const streamStore = useStreamStore()

const cameraStats = computed(() => cameraStore.stats)
const activeStreams = computed(() => streamStore.activeStreams)

onMounted(() => {
  cameraStore.fetchCameraStats()
  streamStore.fetchStreamStats()
})
</script>

<style scoped>
.home-view {
  padding: 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
}

.hero-section h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-value.text-success {
  color: #67c23a;
}

.stat-value.text-warning {
  color: #e6a23c;
}

.stat-value.text-danger {
  color: #f56c6c;
}

.stat-label {
  margin-top: 4px;
  color: #909399;
  font-size: 14px;
}

.actions-card {
  text-align: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.actions .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>