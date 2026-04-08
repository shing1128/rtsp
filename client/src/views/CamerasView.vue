<template>
  <div class="cameras-view">
    <div class="page-header">
      <h1>摄像头管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加摄像头
      </el-button>
    </div>
    
    <el-card>
      <el-table :data="cameras" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="protocol" label="协议" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.protocol }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled" 
              @change="(val) => handleEnabledChange(row.id, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="isEdit ? '编辑摄像头' : '添加摄像头'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入摄像头名称" />
        </el-form-item>
        <el-form-item label="RTSP地址" prop="rtspUrl">
          <el-input 
            v-model="form.rtspUrl" 
            placeholder="rtsp://username:password@host:port/path"
          />
        </el-form-item>
        <el-form-item label="传输协议" prop="protocol">
          <el-radio-group v-model="form.protocol">
            <el-radio-button label="tcp">TCP</el-radio-button>
            <el-radio-button label="udp">UDP</el-radio-button>
            <el-radio-button label="udp_multicast">UDP组播</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            rows="3"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useCameraStore } from '@/store/camera'
import type { Camera, CameraFormData } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const cameraStore = useCameraStore()

const cameras = computed(() => cameraStore.cameras)
const loading = computed(() => cameraStore.loading)

const showAddDialog = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref('')
const formRef = ref<FormInstance>()

const form = reactive<CameraFormData>({
  name: '',
  rtspUrl: '',
  protocol: 'tcp',
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  rtspUrl: [
    { required: true, message: '请输入RTSP地址', trigger: 'blur' },
    { 
      pattern: /^rtsp:\/\/[^:]+:[^@]+@[^:]+:\d+\/.*$/,
      message: 'RTSP地址格式不正确',
      trigger: 'blur'
    }
  ],
  protocol: [{ required: true, message: '请选择协议', trigger: 'change' }]
}

onMounted(() => {
  cameraStore.fetchCameras()
})

function handleEdit(camera: Camera) {
  isEdit.value = true
  currentId.value = camera.id
  form.name = camera.name
  form.rtspUrl = camera.rtspUrl
  form.protocol = camera.protocol
  form.description = camera.description || ''
  showAddDialog.value = true
}

function handleDelete(camera: Camera) {
  ElMessageBox.confirm(
    `确定要删除摄像头 "${camera.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await cameraStore.deleteCamera(camera.id)
  })
}

async function handleEnabledChange(id: string, enabled: boolean) {
  await cameraStore.toggleCameraEnabled(id, enabled)
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      if (isEdit.value) {
        await cameraStore.updateCamera(currentId.value, form)
      } else {
        await cameraStore.createCamera(form)
      }
      
      submitting.value = false
      showAddDialog.value = false
      resetForm()
    }
  })
}

function resetForm() {
  form.name = ''
  form.rtspUrl = ''
  form.protocol = 'tcp'
  form.description = ''
  isEdit.value = false
  currentId.value = ''
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
.cameras-view {
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
</style>