<template>
  <div class="history-map-page w-screen h-screen overflow-hidden relative">
    <!-- 左上角：历史日期范围选择器 -->
    <div class="absolute top-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 min-w-80">
      <h3 class="text-lg font-semibold mb-3 text-gray-800">历史时间段</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            v-model="dateRange.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input
            v-model="dateRange.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          @click="refreshLayers"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          :disabled="loading"
        >
          {{ loading ? '加载中...' : '查询图层' }}
        </button>
      </div>
    </div>

    <!-- 右上角：图层类型选择器 -->
    <div class="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded-lg shadow-lg p-4 min-w-48">
      <h3 class="text-lg font-semibold mb-3 text-gray-800">图层类型</h3>
      <div class="space-y-2">
        <label
          v-for="layerType in layerTypeOptions"
          :key="layerType.value"
          class="flex items-center space-x-2 cursor-pointer"
        >
          <input
            v-model="selectedLayerTypes"
            :value="layerType.value"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            @change="onLayerTypeChange"
          />
          <span class="text-sm text-gray-700">{{ layerType.label }}</span>
        </label>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg shadow-lg px-4 py-2">
      <div class="text-sm text-gray-600">
        <span>已加载图层：{{ layerCount }} 个</span>
        <span v-if="loading" class="ml-2 text-blue-600">加载中...</span>
        <span v-if="error" class="ml-2 text-red-600">{{ error }}</span>
      </div>
    </div>

    <!-- 地图容器 -->
    <BaiduMap 
      ref="mapRef" 
      :center="XI_AN_CENTER" 
      :zoom="8"
      @map-ready="onMapReady"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import BaiduMap from '@/components/BaiduMap.vue'
import { XI_AN_CENTER } from '@/utils/map'
import { layerServiceClient } from '@/services/layerService'
import { LayerType } from '@/connects/layer_pb'
import type { LayerItem } from '@/connects/layer_pb'
import type { MapService } from '@/utils/map'

// 响应式数据
const mapRef = ref<InstanceType<typeof BaiduMap>>()
const loading = ref(false)
const error = ref<string>('')
const layerCount = ref(0)

// 日期范围（默认安史之乱期间）
const dateRange = reactive({
  startDate: '755-12-16', // 安禄山起兵
  endDate: '763-02-17'    // 安史之乱结束
})

// 图层类型选项
const layerTypeOptions = [
  { value: LayerType.CITY, label: '城池' },
  { value: LayerType.EVENT, label: '事件' },
  { value: LayerType.TERRITORY, label: '疆域' },
  { value: LayerType.ROUTE, label: '路线' }
]

// 选中的图层类型
const selectedLayerTypes = ref<LayerType[]>([
  LayerType.CITY,
  LayerType.EVENT,
  LayerType.TERRITORY,
  LayerType.ROUTE
])

// 当前加载的图层数据
const currentLayers = ref<LayerItem[]>([])

// 地图服务实例
let mapService: MapService | null = null

// 地图准备就绪回调
const onMapReady = (service: MapService) => {
  mapService = service
  console.log('地图已准备就绪')
  // 初始加载图层数据
  refreshLayers()
}

// 日期范围变化处理
const onDateRangeChange = () => {
  // 自动查询新的图层数据
  refreshLayers()
}

// 图层类型变化处理
const onLayerTypeChange = () => {
  // 重新过滤并渲染图层
  renderFilteredLayers()
}

// 刷新图层数据
const refreshLayers = async () => {
  if (!mapService || loading.value) return

  loading.value = true
  error.value = ''

  try {
    console.log(`查询图层数据: ${dateRange.startDate} 到 ${dateRange.endDate}`)
    
    const layers = await layerServiceClient.getLayers(
      dateRange.startDate,
      dateRange.endDate
    )

    currentLayers.value = layers
    layerCount.value = layers.length
    
    console.log(`获取到 ${layers.length} 个图层数据`)
    
    // 渲染图层到地图
    mapService.renderLayers(layers)
    
  } catch (err) {
    console.error('获取图层数据失败:', err)
    error.value = '获取图层数据失败，请检查服务器连接'
  } finally {
    loading.value = false
  }
}

// 渲染过滤后的图层
const renderFilteredLayers = () => {
  if (!mapService) return

  //在日志里打印选中的图层对应的中文名
  selectedLayerTypes.value.forEach(type => {
    const layerType = layerTypeOptions.find(option => option.value === type)
    console.log(`选中的图层类型：${layerType?.label}，${layerType?.value}`)
  })



  // 根据选中的图层类型过滤数据
  const filteredLayers = currentLayers.value.filter(layer => 
    selectedLayerTypes.value.includes(layer.type)
  )

  console.log(`渲染过滤后的图层，共 ${filteredLayers.length} 个`)
  mapService.renderLayers(filteredLayers)
  layerCount.value = filteredLayers.length
}

// 组件挂载时
onMounted(() => {
  console.log('历史地图页面已挂载')
})
</script>

<style scoped>
.history-map-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 自定义复选框样式 */
input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 日期输入框样式 */
input[type="date"] {
  color-scheme: light;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

/* 加载状态动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 