<template>
  <div class="w-screen h-screen overflow-hidden relative">
    <BaiduMap />
    
    <!-- 居中的文本框和按钮 -->
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div class="bg-white p-6 rounded-lg shadow-lg min-w-80">
        <div class="flex flex-col gap-4">
          <input 
            v-model="name"
            type="text" 
            placeholder="请输入您的名字"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            @click="handleSayHello"
            :disabled="loading"
            class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '请求中...' : '发送问候' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaiduMap from '@/components/BaiduMap.vue'
import { greetService } from '@/services/greet'

const name = ref('')
const loading = ref(false)

const handleSayHello = async () => {
  if (!name.value.trim()) {
    alert('请输入您的名字')
    return
  }

  loading.value = true
  try {
    const result = await greetService.sayHello(name.value)
    alert(result.message)
  } catch (error) {
    console.error('调用gRPC服务失败:', error)
    alert('调用服务失败: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 全屏布局样式 */
</style> 