<template>
  <div class="settings-view">
    <h1>系统设置</h1>
    
    <el-card>
      <template #header>
        <span>界面设置</span>
      </template>
      
      <el-form label-width="150px">
        <el-form-item label="主题">
          <el-radio-group v-model="preferences.theme" @change="handleThemeChange">
            <el-radio-button label="light">浅色</el-radio-button>
            <el-radio-button label="dark">深色</el-radio-button>
            <el-radio-button label="auto">跟随系统</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="语言">
          <el-select v-model="preferences.language" style="width: 200px">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="自动刷新">
          <el-switch v-model="preferences.autoRefresh" />
        </el-form-item>
        
        <el-form-item label="刷新间隔" v-if="preferences.autoRefresh">
          <el-slider 
            v-model="preferences.refreshInterval" 
            :min="1000" 
            :max="30000" 
            :step="1000"
            show-stops
            style="width: 300px"
          />
          <span class="slider-value">{{ preferences.refreshInterval }}ms</span>
        </el-form-item>
        
        <el-form-item label="视频播放器">
          <el-radio-group v-model="preferences.videoPlayer">
            <el-radio-button label="jsmpeg">JSMpeg</el-radio-button>
            <el-radio-button label="hls">HLS</el-radio-button>
            <el-radio-button label="native">原生</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="监控布局">
          <el-radio-group v-model="preferences.gridLayout">
            <el-radio-button label="1x1">1x1</el-radio-button>
            <el-radio-button label="2x2">2x2</el-radio-button>
            <el-radio-button label="3x3">3x3</el-radio-button>
            <el-radio-button label="4x4">4x4</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <span>系统信息</span>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="构建时间">2024-01-01</el-descriptions-item>
        <el-descriptions-item label="Vue版本">3.x</el-descriptions-item>
        <el-descriptions-item label="Element Plus">2.x</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <div class="actions">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSystemStore } from '@/store/system'

const systemStore = useSystemStore()

const preferences = computed(() => systemStore.preferences)

function handleThemeChange() {
  systemStore.applyTheme()
}

function saveSettings() {
  ElMessage.success('设置已保存')
}

function resetSettings() {
  systemStore.updatePreferences({
    theme: 'light',
    language: 'zh-CN',
    autoRefresh: true,
    refreshInterval: 5000,
    videoPlayer: 'jsmpeg',
    gridLayout: '2x2'
  })
  systemStore.applyTheme()
  ElMessage.success('设置已重置')
}
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.slider-value {
  margin-left: 15px;
  color: #606266;
}

.actions {
  margin-top: 20px;
}
</style>