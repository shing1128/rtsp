<template>
  <div class="streams-view">
    <div class="page-header">
      <h1>流管理</h1>
      <el-button type="primary" @click="fetchStreamStats" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats?.total || 0 }}</div>
            <div class="stat-label">总流数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value text-success">{{ stats?.active || 0 }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value text-warning">{{ inactiveCount }}</div>
            <div class="stat-label">已停止</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ subscribedCount }}</div>
            <div class="stat-label">已订阅</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 流列表 -->
    <el-card class="streams-card">
      <template #header>
        <span>流状态列表</span>
      </template>
      
      <el-table :data="streams" v-loading="loading" stripe>
        <el-table-column prop="cameraId" label="摄像头ID" min-width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRunning ? 'success' : 'info'" size="small">
              {{ row.isRunning ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="运行时长" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.uptime) }}
          </template>
        </el-table-column>
        <el-table-column prop="reconnectAttempts" label="重连次数" width="100" />
        <el-table-column label="WebSocket" width="120">
          <template #default="{ row }">
            <el-tag :type="isSubscribed(row.cameraId) ? 'success' : 'info'" size="small">
              {{ isSubscribed(row.cameraId) ? '已订阅' : '未订阅' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="!row.isRunning" 
              link 
              type="primary" 
              @click="handleStart(row.cameraId)"
            >
              启动
            </el-button>
            <el-button 
              v-else 
              link 
              type="danger" 
              @click="handleStop(row.cameraId)"
            >
              停止
            </el-button>
            <el-button link @click="handleRestart(row.cameraId)">重启</el-button>
            <el-button 
              v-if="!isSubscribed(row.cameraId)"
              link 
              type="primary" 
              @click="handleSubscribe(row.cameraId)"
            >
              订阅
            </el-button>
            <el-button 
              v-else
              link 
              type="danger" 
              @click="handleUnsubscribe(row.cameraId)"
            >
              取消订阅
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && streams.length === 0" description="暂无流数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useStreamStore } from '@/store/stream'

const streamStore = useStreamStore()

const streams = computed(() => streamStore.streams)
const stats = computed(() => streamStore.stats)
const loading = computed(() => streamStore.loading)
const isSubscribed = (cameraId: string) => streamStore.isSubscribed(cameraId)

const inactiveCount = computed(() => 
  streams.value.filter(s => !s.isRunning).length
)

const subscribedCount = computed(() => 
  streamStore.subscribedCameras.size
)

onMounted(() => {
  fetchStreamStats()
  // 每5秒自动刷新
  const timer = setInterval(fetchStreamStats, 5000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})

async function fetchStreamStats() {
  await streamStore.fetchStreamStats()
}

async function handleStart(cameraId: string) {
  await streamStore.startStream(cameraId)
}

async function handleStop(cameraId: string) {
  await streamStore.stopStream(cameraId)
}

async function handleRestart(cameraId: string) {
  await streamStore.restartStream(cameraId)
}

function handleSubscribe(cameraId: string) {
  streamStore.subscribe(cameraId)
  ElMessage.success(`已订阅摄像头: ${cameraId}`)
}

function handleUnsubscribe(cameraId: string) {
  streamStore.unsubscribe(cameraId)
  ElMessage.success(`已取消订阅: ${cameraId}`)
}

function formatDuration(ms: number) {
  if (!ms || ms < 1000) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>

<style scoped>
.streams-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
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

.stat-label {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.streams-card {
  margin-top: 20px;
}
</style>