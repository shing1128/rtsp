<template>
  <div class="camera-detail-view">
    <el-page-header @back="goBack" title="摄像头详情" />
    
    <el-card v-if="camera" class="detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ camera.name }}</span>
          <el-tag :type="getStatusType(camera.status)">
            {{ getStatusText(camera.status) }}
          </el-tag>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ camera.id }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ camera.name }}</el-descriptions-item>
        <el-descriptions-item label="协议">{{ camera.protocol }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-switch v-model="camera.enabled" disabled />
        </el-descriptions-item>
        <el-descriptions-item label="分辨率">{{ camera.resolution || '-' }}</el-descriptions-item>
        <el-descriptions-item label="帧率">{{ camera.fps || '-' }} fps</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(camera.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="最后连接">{{ camera.lastConnected ? formatDate(camera.lastConnected) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ camera.description || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="actions">
        <el-button type="primary" @click="handleStart" :loading="starting">
          启动流
        </el-button>
        <el-button type="danger" @click="handleStop" :loading="stopping">
          停止流
        </el-button>
        <el-button @click="handleRestart" :loading="restarting">
          重启流
        </el-button>
      </div>
    </el-card>
    
    <el-skeleton v-else :rows="6" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCameraStore } from '@/store/camera'
import { useStreamStore } from '@/store/stream'
import type { Camera } from '@/types'
import { formatDate } from '@/utils/dayjs'

const route = useRoute()
const router = useRouter()
const cameraStore = useCameraStore()
const streamStore = useStreamStore()

const camera = computed(() => cameraStore.currentCamera)
const starting = ref(false)
const stopping = ref(false)
const restarting = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  await cameraStore.fetchCameraById(id)
})

function goBack() {
  router.back()
}

async function handleStart() {
  if (!camera.value) return
  starting.value = true
  await streamStore.startStream(camera.value.id)
  starting.value = false
}

async function handleStop() {
  if (!camera.value) return
  stopping.value = true
  await streamStore.stopStream(camera.value.id)
  stopping.value = false
}

async function handleRestart() {
  if (!camera.value) return
  restarting.value = true
  await streamStore.restartStream(camera.value.id)
  restarting.value = false
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
.camera-detail-view {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>