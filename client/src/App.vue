<template>
  <div id="app" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar">
      <div class="logo">
        <el-icon :size="28"><VideoCamera /></el-icon>
        <span v-if="!sidebarCollapsed" class="logo-text">RTSP 流媒体</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        :collapse-transition="false"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <template #title>监控中心</template>
        </el-menu-item>
        
        <el-menu-item index="/cameras">
          <el-icon><VideoCamera /></el-icon>
          <template #title>摄像头管理</template>
        </el-menu-item>
        
        <el-menu-item index="/streams">
          <el-icon><DataLine /></el-icon>
          <template #title>流管理</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
        
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <template #title>关于</template>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button
          link
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <el-icon v-if="!sidebarCollapsed"><Fold /></el-icon>
          <el-icon v-else><Expand /></el-icon>
        </el-button>
      </div>
    </aside>
    
    <main class="main-container">
      <header class="main-header">
        <div class="header-left">
          <h2 class="page-title">{{ $route.meta.title || 'RTSP 流媒体服务' }}</h2>
        </div>
        <div class="header-right">
          <el-tag :type="connectionStatus === 'connected' ? 'success' : 'danger'" size="small">
            <el-icon v-if="connectionStatus === 'connected'"><Connection /></el-icon>
            <el-icon v-else><Warning /></el-icon>
            {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
          </el-tag>
          <el-button circle @click="toggleTheme">
            <el-icon v-if="isDarkMode"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </el-button>
        </div>
      </header>
      
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemStore } from '@/store/system'

const systemStore = useSystemStore()

const sidebarCollapsed = computed(() => systemStore.sidebarCollapsed)
const isDarkMode = computed(() => systemStore.isDarkMode)
const connectionStatus = computed(() => systemStore.connectionStatus)

onMounted(() => {
  systemStore.initTheme()
})

function toggleSidebar() {
  systemStore.toggleSidebar()
}

function toggleTheme() {
  systemStore.toggleTheme()
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-collapsed .sidebar {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.collapse-btn {
  color: rgba(255, 255, 255, 0.65);
  font-size: 18px;
}

.collapse-btn:hover {
  color: #fff;
}

/* 主容器 */
.main-container {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
  min-height: 100vh;
}

.sidebar-collapsed .main-container {
  margin-left: 64px;
}

.main-header {
  height: 64px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 深色主题 */
html.dark #app {
  background: #141414;
}

html.dark .main-header {
  background: #1f1f1f;
  border-bottom: 1px solid #303030;
}

html.dark .page-title {
  color: #e0e0e0;
}

html.dark .main-content {
  background: #141414;
}
</style>
