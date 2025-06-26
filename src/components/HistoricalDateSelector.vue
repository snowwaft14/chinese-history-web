<template>
  <div class="historical-date-selector relative">
    <!-- 触发按钮 -->
    <button @click="toggleDropdown"
      class="w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-4 text-left hover:bg-opacity-100 hover:shadow-2xl transition-all duration-200 flex items-center justify-between min-w-80 max-w-md">
      <div class="flex items-center space-x-3 flex-1">
        <span class="text-lg">🕐</span>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-gray-500 truncate">
            {{ dateRangeSummary }}
          </div>
        </div>
      </div>
      <svg :class="[
        'w-4 h-4 transition-transform duration-200 text-gray-400 flex-shrink-0',
        isOpen ? 'transform rotate-180' : ''
      ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉面板 -->
    <div v-if="isOpen"
      class="historical-date-selector-panel absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden backdrop-blur-sm bg-opacity-95 max-w-md"
      style="z-index: 9999;">
      <div class="p-6">
        <!-- 纪年方式选择 -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3">纪年方式</label>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="type in calendarTypes" :key="type.value" @click="selectedCalendarType = type.value" :class="[
              'px-4 py-3 text-sm rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 font-medium',
              selectedCalendarType === type.value
                ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
            ]">
              <span>{{ type.icon }}</span>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-100 mb-6"></div>

        <!-- 时间范围选择 -->
        <div class="space-y-5">
          <!-- 起始时间 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">🚀</span>
              起始时间
            </label>
            <DateInput :calendar-type="selectedCalendarType" :model-value="dateRange.start"
              @update:model-value="updateStartDate" />
          </div>

          <!-- 结束时间 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">🏁</span>
              结束时间
            </label>
            <DateInput :calendar-type="selectedCalendarType" :model-value="dateRange.end"
              @update:model-value="updateEndDate" />
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-100 my-6"></div>

        <!-- 预设时间段 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span class="mr-2">⚡</span>
            快速选择
          </label>
          <div class="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
            <button v-for="preset in presetRanges" :key="preset.name" @click="applyPresetRange(preset)"
              class="p-4 text-left rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
              <div class="font-semibold text-gray-800 group-hover:text-blue-700 mb-1">
                {{ preset.name }}
              </div>
              <div class="text-xs text-gray-500 group-hover:text-blue-600">
                {{ preset.description }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="isOpen" @click="closeDropdown" class="fixed inset-0 z-[9998]" style="z-index: 9998;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CalendarType, type HistoricalDate } from '@/connects/layer_pb.ts'
import { type HistoricalDateRange } from '@/models/historical-date'
import { PERIOD_RANGES } from '@/models/historical-data'
import { HistoricalDateUtils } from './HistoricalDateSelector.vue.ts'
import DateInput from './DateInput.vue'

// Props
interface Props {
  beginDate?: HistoricalDate
  endDate?: HistoricalDate
}

const props = withDefaults(defineProps<Props>(), {
  beginDate: () => HistoricalDateUtils.createDefault(CalendarType.GREGORIAN),
  endDate: () => HistoricalDateUtils.createDefault(CalendarType.GREGORIAN)
})

// Emits
const emit = defineEmits<{
  'update:beginDate': [value: HistoricalDate]
  'update:endDate': [value: HistoricalDate]
  'apply': [beginDate: HistoricalDate, endDate: HistoricalDate]
}>()

// 响应式数据
const isOpen = ref(false)
const selectedCalendarType = ref<CalendarType>(CalendarType.GREGORIAN)
const dateRange = ref<HistoricalDateRange>({
  start: { ...props.beginDate },
  end: { ...props.endDate }
})

// 日历类型选项
const calendarTypes = [
  { value: CalendarType.GREGORIAN, label: '公元纪年', icon: '📅' },
  { value: CalendarType.ERA_NAME, label: '年号', icon: '📜' },
  { value: CalendarType.DYNASTY_RANGE, label: '区间', icon: '🧭' },
  { value: CalendarType.LUNAR, label: '农历', icon: '🌕' }
]

// 预设时间段
const presetRanges = computed(() =>
  PERIOD_RANGES.map(period => ({
    name: period.name,
    description: period.description,
    start: {
      calendarType: CalendarType.DYNASTY_RANGE,
      period: period.name,
      dynasty: period.dynasty
    } as HistoricalDate,
    end: {
      calendarType: CalendarType.DYNASTY_RANGE,
      period: period.name,
      dynasty: period.dynasty
    } as HistoricalDate
  }))
)

// 计算属性
const isValidRange = computed(() => {
  return HistoricalDateUtils.isValid(dateRange.value.start) &&
    HistoricalDateUtils.isValid(dateRange.value.end)
})

// 日期范围摘要显示
const dateRangeSummary = computed(() => {
  if (!isValidRange.value) return '请选择时间范围'

  const start = dateRange.value.start
  const end = dateRange.value.end

  // 如果是朝代区间类型
  if (start.calendarType === CalendarType.DYNASTY_RANGE && start.period) {
    return `${start.period}期间`
  }

  const startStr = formatDisplayDate(start)
  const endStr = formatDisplayDate(end)

  // 如果起止时间相同，只显示一个
  if (startStr === endStr) {
    return startStr
  }

  return `${startStr} 至 ${endStr}`
})

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const updateStartDate = (date: HistoricalDate) => {
  dateRange.value.start = date
  emit('update:beginDate', date)
}

const updateEndDate = (date: HistoricalDate) => {
  dateRange.value.end = date
  emit('update:endDate', date)
}

const applyPresetRange = (preset: any) => {
  selectedCalendarType.value = CalendarType.DYNASTY_RANGE
  dateRange.value = {
    start: preset.start,
    end: preset.end
  }
  emit('update:beginDate', preset.start)
  emit('update:endDate', preset.end)
}

const formatDisplayDate = (date: HistoricalDate): string => {
  return HistoricalDateUtils.formatDate(date)
}

const reset = () => {
  const defaultType = CalendarType.GREGORIAN
  selectedCalendarType.value = defaultType
  const defaultStart = HistoricalDateUtils.createDefault(defaultType)
  const defaultEnd = HistoricalDateUtils.createDefault(defaultType)

  dateRange.value = {
    start: defaultStart,
    end: defaultEnd
  }

  emit('update:beginDate', defaultStart)
  emit('update:endDate', defaultEnd)
}

const apply = () => {
  if (isValidRange.value) {
    // 确保起始日期不大于结束日期，如果是则交换
    let startDate = dateRange.value.start
    let endDate = dateRange.value.end

    const startISO = HistoricalDateUtils.toISODate(startDate)
    const endISO = HistoricalDateUtils.toISODate(endDate)

    if (startISO > endISO) {
      [startDate, endDate] = [endDate, startDate]
      dateRange.value.start = startDate
      dateRange.value.end = endDate
      emit('update:beginDate', startDate)
      emit('update:endDate', endDate)
    }

    emit('apply', startDate, endDate)
  }
}

const applyAndClose = () => {
  apply()
  closeDropdown()
}

// 监听日历类型变化，更新日期格式
const updateCalendarType = (newType: CalendarType) => {
  const defaultStart = HistoricalDateUtils.createDefault(newType)
  const defaultEnd = HistoricalDateUtils.createDefault(newType)

  dateRange.value = {
    start: defaultStart,
    end: defaultEnd
  }

  emit('update:beginDate', defaultStart)
  emit('update:endDate', defaultEnd)
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// 生命周期
import { watch, onMounted, onUnmounted } from 'vue'
watch(selectedCalendarType, updateCalendarType)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 组件特定样式 */
.historical-date-selector-panel {
  max-height: 80vh;
  overflow-y: auto;
}

/* 滚动条样式 */
.historical-date-selector-panel::-webkit-scrollbar {
  width: 4px;
}

.historical-date-selector-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.historical-date-selector-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.historical-date-selector-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>