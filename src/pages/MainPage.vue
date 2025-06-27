<template>
  <div class="history-map-page w-screen h-screen overflow-hidden relative">
    <!-- 左上角：历史日期选择器 -->
    <div class="absolute top-4 left-4 z-[100]" style="z-index: 100;">
      <HistoricalDateSelector v-model:begin-date="beginDate" v-model:end-date="endDate" @apply="onDateRangeApply" />
    </div>

    <!-- 查询按钮 -->
    <div class="absolute top-4 left-[22rem] z-[90]" style="z-index: 90;">
      <button @click="performQuery" :disabled="loading || !isValidDateRange"
        class="bg-blue-500 bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl border border-blue-200 px-6 py-4 text-white font-semibold hover:bg-blue-600 hover:shadow-2xl transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="!loading">🔍</span>
        <div v-if="loading" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>{{ loading ? '查询中...' : '查询图层' }}</span>
      </button>
    </div>

    <!-- 右上角：图层类型选择器 -->
    <div class="absolute top-4 right-4 z-[80]" style="z-index: 80;">
      <LayerSelector v-model="selectedLayerTypes" :layer-options="layerTypeOptions" @change="onLayerTypeChange" />
    </div>

    <!-- 底部状态栏 -->
    <div class="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg shadow-lg px-4 py-2">
      <div class="text-sm text-gray-600">
        <span>已加载图层：{{ layerCount }} 个</span>
        <span v-if="loading" class="ml-2 text-blue-600">加载中...</span>
        <span v-if="error" class="ml-2 text-red-600">{{ error }}</span>
        <span v-if="lastQueryTime" class="ml-2 text-gray-500">
          上次查询：{{ lastQueryTime }}
        </span>
      </div>
    </div>

    <!-- 地图容器 -->
    <BaiduMap ref="mapRef" :center="XI_AN_CENTER" :zoom="8" @map-ready="onMapReady" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { create } from "@bufbuild/protobuf";
import { ref, reactive, onMounted, computed } from 'vue'
import BaiduMap from '@/components/BaiduMap.vue'
import HistoricalDateSelector from '@/components/HistoricalDateSelector.vue'
import LayerSelector from '@/components/LayerSelector.vue'
import { XI_AN_CENTER } from '@/components/BaiduMap.vue.ts'
import { layerServiceClient } from '@/services/layerService'
import { LayerType } from '@/connects/layer_pb'
import type { LayerItem } from '@/connects/layer_pb'
import type { MapService } from '@/components/BaiduMap.vue.ts'
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from '@/connects/layer_pb'
import { type HistoricalDateRange } from '@/models/historical-date'
import { HistoricalDateUtils } from '@/components/HistoricalDateSelector.vue.ts'

// 响应式数据
const mapRef = ref<InstanceType<typeof BaiduMap>>()
const loading = ref(false)
const error = ref<string>('')
const layerCount = ref(0)
const lastQueryTime = ref<string>('')

// 历史日期范围（使用beginDate和endDate）
const beginDate = ref<HistoricalDate>(create(HistoricalDateSchema, {
  calendarType: CalendarType.GREGORIAN,
  year: 755,
  month: 12,
  day: 16
}))

const endDate = ref<HistoricalDate>(create(HistoricalDateSchema, {
  calendarType: CalendarType.GREGORIAN,
  year: 763,
  month: 12,
  day: 16
}))

// 计算属性：验证日期范围是否有效
const isValidDateRange = computed(() => {
  return HistoricalDateUtils.isValid(beginDate.value) &&
    HistoricalDateUtils.isValid(endDate.value)
})

// 计算属性：构造历史日期范围对象
const historicalDateRange = computed((): HistoricalDateRange => ({
  start: beginDate.value,
  end: endDate.value
}))

// 图层类型选项
const layerTypeOptions = [
  {
    value: LayerType.CITY,
    label: '城池',
    icon: '🏰',
    description: '重要城市和军事要塞'
  },
  {
    value: LayerType.EVENT,
    label: '事件',
    icon: '⚔️',
    description: '历史事件和重要节点'
  },
  {
    value: LayerType.TERRITORY,
    label: '疆域',
    icon: '🗺️',
    description: '政治疆域和控制区域'
  },
  {
    value: LayerType.ROUTE,
    label: '路线',
    icon: '🛤️',
    description: '行军路线和交通要道'
  }
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
  // 地图准备好后，可以进行初始查询
}

// 历史日期范围应用（从日期选择器的应用按钮触发）
const onDateRangeApply = (newBeginDate: HistoricalDate, newEndDate: HistoricalDate) => {
  console.log('应用新的历史日期范围:', {
    start: `${newBeginDate.year}-${newBeginDate.month}-${newBeginDate.day}`,
    end: `${newEndDate.year}-${newEndDate.month}-${newEndDate.day}`
  })
}

// 执行查询（点击查询按钮触发）
const performQuery = async () => {
  if (!mapService || loading.value || !isValidDateRange.value) return

  loading.value = true
  error.value = ''

  try {

    // 使用新的历史日期范围服务
    const layers = await layerServiceClient.getLayersByDateRange(historicalDateRange.value)

    currentLayers.value = layers
    console.log(`从服务器获取到 ${layers.length} 个图层数据`)

    // 记录查询时间
    lastQueryTime.value = new Date().toLocaleTimeString()

    // 应用图层类型过滤并渲染到地图
    renderFilteredLayers()

  } catch (err) {
    console.error('获取图层数据失败:', err)
    error.value = '获取图层数据失败，请检查服务器连接'
  } finally {
    loading.value = false
  }
}

// 图层类型变化处理
const onLayerTypeChange = (selectedTypes: LayerType[]) => {
  console.log('图层类型已变化:', selectedTypes.map(type => {
    const option = layerTypeOptions.find(opt => opt.value === type)
    return `${option?.label}(${option?.value})`
  }))

  // 重新过滤并渲染图层
  renderFilteredLayers()
}

// 渲染过滤后的图层
const renderFilteredLayers = () => {
  if (!mapService) return

  // 根据选中的图层类型过滤数据
  const filteredLayers = currentLayers.value.filter(layer =>
    selectedLayerTypes.value.includes(layer.type)
  )

  console.log('图层过滤结果:', {
    总图层数: currentLayers.value.length,
    已选择类型: selectedLayerTypes.value.map(type => {
      const option = layerTypeOptions.find(opt => opt.value === type)
      return option?.label
    }),
    过滤后图层数: filteredLayers.length
  })

  // 渲染过滤后的图层到地图
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

  0%,
  100% {
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