<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside 
      class="layout-aside" 
      :width="sidebarCollapsed ? '64px' : '220px'"
    >
      <div class="sidebar-logo">
        <el-icon :size="28" class="logo-icon">
          <VideoCamera />
        </el-icon>
        <span v-show="!sidebarCollapsed" class="logo-text">RTSP 流媒体</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        router
        :collapse="sidebarCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        background-color="transparent"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#fff"
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
          <el-icon :size="18">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </el-button>
      </div>
    </el-aside>
    
    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="layout-header" height="64px">
        <div class="header-left">
          <h2 class="page-title">{{ $route.meta.title || 'RTSP 流媒体服务' }}</h2>
        </div>
        
        <div class="header-right">
          <!-- 连接状态 -->
          <el-tooltip :content="connectionStatus === 'connected' ? 'WebSocket 已连接' : 'WebSocket 未连接'">
            <div class="status-indicator">
              <span class="status-dot" :class="connectionStatus"></span>
              <span class="status-text">{{ connectionStatus === 'connected' ? '已连接' : '未连接' }}</span>
            </div>
          </el-tooltip>
          
          <!-- 全屏按钮 -->
          <el-button circle @click="toggleFullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
          
          <!-- 主题切换 -->
          <el-button circle @click="toggleTheme">
            <el-icon v-if="isDarkMode"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </el-button>
          
          <!-- 用户菜单 -->
          <el-dropdown trigger="click">
            <el-button circle>
              <el-icon><User /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/settings')">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
      
      <!-- 底部状态栏 -->
      <el-footer class="layout-footer" height="40px">
        <div class="footer-left">
          <span class="footer-item">
            <el-icon><VideoCamera /></el-icon>
            摄像头: {{ cameraStats?.total || 0 }}
          </span>
          <span class="footer-item">
            <el-icon><CircleCheck /></el-icon>
            在线: {{ cameraStats?.online || 0 }}
          </span>
          <span class="footer-item">
            <el-icon><Loading /></el-icon>
            运行中: {{ activeStreamCount }}
          </span>
        </div>
        <div class="footer-right">
          <span class="footer-item version">
            v1.0.0
          </span>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/store/system'
import { useCameraStore } from '@/store/camera'
import { useStreamStore } from '@/store/stream'

const router = useRouter()
const systemStore = useSystemStore()
const cameraStore = useCameraStore()
const streamStore = useStreamStore()

const sidebarCollapsed = computed(() => systemStore.sidebarCollapsed)
const isDarkMode = computed(() => systemStore.isDarkMode)
const connectionStatus = computed(() => systemStore.connectionStatus)
const cameraStats = computed(() => cameraStore.stats)
const activeStreamCount = computed(() => streamStore.activeStreams.length)

onMounted(() => {
  systemStore.initTheme()
  // 定期刷新统计数据
  setInterval(() => {
    cameraStore.fetchCameraStats()
    streamStore.fetchStreamStats()
  }, 10000)
})

function toggleSidebar() {
  systemStore.toggleSidebar()
}

function toggleTheme() {
  systemStore.toggleTheme()
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function handleLogout() {
  // TODO: 实现登出逻辑
  ElMessage.info('退出登录功能待实现')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

/* 侧边栏 */
.layout-aside {
  background: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  color: #1890ff;
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
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff !important;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.collapse-btn {
  color: rgba(255, 255, 255, 0.65);
}

.collapse-btn:hover {
  color: #fff;
}

/* 主容器 */
.main-container {
  background: var(--color-bg);
}

/* 顶部导航栏 */
.layout-header {
  background: var(--color-bg-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: var(--box-shadow-sm);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 连接状态指示器 */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--color-bg-dark);
  border-radius: 12px;
  margin-right: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-dot.connected {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.status-dot.disconnected {
  background: #ff4d4f;
}

.status-dot.connecting {
  background: #faad14;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 12px;
  color: var(--color-text-regular);
}

/* 主内容区 */
.layout-main {
  padding: 24px;
  overflow-y: auto;
}

/* 底部状态栏 */
.layout-footer {
  background: var(--color-bg-light);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.footer-left {
  display: flex;
  gap: 24px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-item .el-icon {
  font-size: 14px;
}

.version {
  font-family: monospace;
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
</style>