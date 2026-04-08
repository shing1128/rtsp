<template>
  <div class="element-test">
    <h2>Element Plus 组件测试</h2>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基础组件测试</span>
          <el-button class="button" text>操作按钮</el-button>
        </div>
      </template>
      
      <div class="test-section">
        <h3>按钮组件</h3>
        <el-button>默认按钮</el-button>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-button type="warning">警告按钮</el-button>
        <el-button type="danger">危险按钮</el-button>
      </div>
      
      <div class="test-section">
        <h3>图标组件</h3>
        <el-icon :size="20" color="#409EFF">
          <VideoCamera />
        </el-icon>
        <el-icon :size="20" color="#67C23A">
          <CircleCheck />
        </el-icon>
        <el-icon :size="20" color="#E6A23C">
          <Warning />
        </el-icon>
        <el-icon :size="20" color="#F56C6C">
          <CircleClose />
        </el-icon>
      </div>
      
      <div class="test-section">
        <h3>消息提示</h3>
        <el-button @click="showMessage">显示消息</el-button>
        <el-button type="success" @click="showSuccess">成功消息</el-button>
        <el-button type="warning" @click="showWarning">警告消息</el-button>
      </div>
      
      <div class="test-section">
        <h3>日期时间: {{ currentTime }}</h3>
        <p>相对时间: {{ relativeTime }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from '../utils/dayjs'

const currentTime = ref('')
const relativeTime = ref('')

onMounted(() => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  relativeTime.value = dayjs().subtract(1, 'hour').fromNow()
})

const showMessage = () => {
  ElMessage('这是一条消息提示')
}

const showSuccess = () => {
  ElMessage.success('操作成功')
}

const showWarning = () => {
  ElMessage.warning('警告消息')
}
</script>

<style scoped>
.element-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.test-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.test-section .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.test-section .el-icon {
  margin-right: 20px;
}
</style>