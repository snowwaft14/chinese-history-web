<template>
  <div class="historical-date-selector relative w-full max-w-md min-w-[400px]">
    <!-- 触发按钮 - 根据不同模式显示不同内容 -->
    <div class="dropdown dropdown-bottom w-full" :class="{ 'dropdown-open': isOpen }">
      <button @click="toggleDropdown" tabindex="0" role="button"
        class="btn btn-outline btn-primary w-full justify-between">
        <div class="flex-1 min-w-0 text-left">
          <div class="text-sm truncate">
            {{ getDisplayText() }}
          </div>
        </div>
        <svg :class="[
          'w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2',
          isOpen ? 'transform rotate-180' : ''
        ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- 下拉面板 -->
      <div tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-0 shadow-lg border border-base-300 mt-1">
        <div class="card card-body">
          <!-- 纪年方式单选框 - 只有阳历、农历、年号 -->
          <div class="form-control mb-4">
            <div class="label">
              <span class="label-text font-semibold">纪年方式</span>
            </div>
            <div class="flex gap-6">
              <label class="label cursor-pointer p-0">
                <input type="radio" :value="CalendarType.GREGORIAN" v-model="selectedCalendarType" 
                  class="radio radio-primary radio-sm" />
                <span class="label-text ml-2">阳历</span>
              </label>
              <label class="label cursor-pointer p-0">
                <input type="radio" :value="CalendarType.LUNAR" v-model="selectedCalendarType"
                  class="radio radio-primary radio-sm" />
                <span class="label-text ml-2">农历</span>
              </label>
              <label class="label cursor-pointer p-0">
                <input type="radio" :value="CalendarType.ERA" v-model="selectedCalendarType"
                  class="radio radio-primary radio-sm" />
                <span class="label-text ml-2">年号</span>
              </label>
            </div>
          </div>

          <!-- 时间范围选择 -->
          <div class="space-y-4">
            <!-- 开始日期 -->
            <div class="card bg-base-200 card-body p-3">
              <div class="label">
                <span class="label-text font-medium text-primary">开始日期</span>
              </div>
              <DateInput :calendar-type="selectedCalendarType" :value="dateRange.start"
                @update:model-value="updateStartDate" />
            </div>

            <!-- 结束日期 -->
            <div class="card bg-base-200 card-body p-3">
              <div class="label">
                <span class="label-text font-medium text-primary">结束日期</span>
              </div>
              <DateInput :calendar-type="selectedCalendarType" :value="dateRange.end"
                @update:model-value="updateEndDate" />
            </div>
          </div>

          <!-- 快速选择列表 -->
          <div class="mt-4">
            <div class="label">
              <span class="label-text font-medium text-primary">快速选择</span>
            </div>
            <div class="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              <button v-for="preset in presetRanges" :key="preset.name" @click="applyPresetRange(preset)"
                class="btn btn-ghost btn-sm w-full justify-start text-left p-3 h-auto normal-case">
                <div class="w-full">
                  <div class="font-medium text-base-content mb-1">
                    {{ preset.name }}
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ preset.description }}
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions justify-end mt-4 pt-3 border-t border-base-300">
            <button @click="reset" class="btn btn-ghost btn-sm">重置</button>
            <button @click="applyAndClose" class="btn btn-primary btn-sm" :disabled="!isValidRange">
              确定
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="isOpen" @click="closeDropdown" class="fixed inset-0 z-40 bg-black/20"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HistoricalDateSelector'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from '@/connects/common_pb.ts'
import { type HistoricalDateRange } from '@/models/historical-date'
import { PERIOD_RANGES } from '@/models/historical-data'
import { create } from '@bufbuild/protobuf'
import DateInput from './DateInput.vue'

// Props
interface Props {
  beginDate?: HistoricalDate
  endDate?: HistoricalDate
}

const props = withDefaults(defineProps<Props>(), {
  beginDate: () => create(HistoricalDateSchema, {
    calendarType: CalendarType.GREGORIAN,
    year: 755,
    month: 12,
    day: 16,
    isLeapMonth: false,
    dynastyName: '',
    eraName: ''
  }),
  endDate: () => create(HistoricalDateSchema, {
    calendarType: CalendarType.GREGORIAN,
    year: 755,
    month: 12,
    day: 16,
    isLeapMonth: false,
    dynastyName: '',
    eraName: ''
  })
})

// 创建默认日期函数
function createDefaultDate(calendarType: CalendarType): HistoricalDate {
  return create(HistoricalDateSchema, {
    calendarType,
    year: 755,
    month: 12,
    day: 16,
    isLeapMonth: false,
    dynastyName: calendarType === CalendarType.ERA ? '唐' : '',
    eraName: calendarType === CalendarType.ERA ? '天宝' : ''
  })
}

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

// 预设时间段 - 转换为新格式
const presetRanges = computed(() =>
  PERIOD_RANGES.map(period => {
    // 解析 ISO 日期格式 (例如: "0755-12-16")
    const parseISODate = (dateStr: string) => {
      const parts = dateStr.split('-')
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      }
    }
    
    const startParts = parseISODate(period.startDate)
    const endParts = parseISODate(period.endDate)
    
    return {
      name: period.name,
      description: period.description,
      start: create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: startParts.year,
        month: startParts.month,
        day: startParts.day,
        isLeapMonth: false,
        dynastyName: '',
        eraName: ''
      }),
      end: create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: endParts.year,
        month: endParts.month,
        day: endParts.day,
        isLeapMonth: false,
        dynastyName: '',
        eraName: ''
      })
    }
  })
)

// 计算属性
const isValidRange = computed(() => {
  return isValidDate(dateRange.value.start) && isValidDate(dateRange.value.end)
})

// 验证日期是否有效
function isValidDate(date: HistoricalDate): boolean {
  return date.year > 0 && date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= 31
}

// 根据当前状态获取显示文本
const getDisplayText = () => {
  if (!isValidRange.value) return '请选择时间范围'

  const start = dateRange.value.start
  const end = dateRange.value.end

  // 根据不同的日历类型显示不同格式
  switch (start.calendarType) {
    case CalendarType.ERA:
      if (start.eraName && start.year) {
        const startText = `${start.eraName}${start.year}年${start.month}月${start.day}日`
        const endText = end.eraName && end.year ? 
          `${end.eraName}${end.year}年${end.month}月${end.day}日` : ''
        
        if (startText === endText) return startText
        return endText ? `${startText} 至 ${endText}` : startText
      }
      return '请选择年号时间范围'
      
    case CalendarType.GREGORIAN:
      if (start.year && start.month && start.day) {
        const formatDate = (date: HistoricalDate) => {
          const year = date.year < 0 ? `公元前${Math.abs(date.year)}` : `公元${date.year}`
          return `${year}年${date.month}月${date.day}日`
        }
        
        const startText = formatDate(start)
        const endText = end.year && end.month && end.day ? formatDate(end) : ''
        
        if (startText === endText) return startText
        return endText ? `${startText} 至 ${endText}` : startText
      }
      return '请选择公元时间范围'
      
    case CalendarType.LUNAR:
      if (start.year && start.month && start.day) {
        const formatLunarDate = (date: HistoricalDate) => {
          const year = date.year < 0 ? `公元前${Math.abs(date.year)}` : `${date.year}`
          const leapPrefix = date.isLeapMonth ? '闰' : ''
          return `${year}年${leapPrefix}${date.month}月${date.day}日`
        }
        
        const startText = formatLunarDate(start)
        const endText = end.year && end.month && end.day ? formatLunarDate(end) : ''
        
        if (startText === endText) return startText
        return endText ? `${startText} 至 ${endText}` : startText
      }
      return '请选择农历时间范围'
      
    default:
      return '请选择时间范围'
  }
}

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const updateStartDate = (date: HistoricalDate) => {
  dateRange.value.start = { ...date, calendarType: selectedCalendarType.value }
  emit('update:beginDate', dateRange.value.start)
}

const updateEndDate = (date: HistoricalDate) => {
  dateRange.value.end = { ...date, calendarType: selectedCalendarType.value }
  emit('update:endDate', dateRange.value.end)
}

const applyPresetRange = (preset: any) => {
  // 点击快速选择后收起面板，但不改变纪年方式
  dateRange.value = {
    start: preset.start,
    end: preset.end
  }
  emit('update:beginDate', preset.start)
  emit('update:endDate', preset.end)
  closeDropdown()
}

const reset = () => {
  const defaultType = CalendarType.GREGORIAN
  selectedCalendarType.value = defaultType
  const defaultStart = createDefaultDate(defaultType)
  const defaultEnd = createDefaultDate(defaultType)

  dateRange.value = {
    start: defaultStart,
    end: defaultEnd
  }

  emit('update:beginDate', defaultStart)
  emit('update:endDate', defaultEnd)
}

const apply = () => {
  if (isValidRange.value) {
    emit('apply', dateRange.value.start, dateRange.value.end)
  }
}

const applyAndClose = () => {
  if (isValidRange.value) {
    emit('apply', dateRange.value.start, dateRange.value.end)
    closeDropdown()
  }
}

// 监听日历类型变化，更新日期格式
const updateCalendarType = (newType: CalendarType) => {
  const defaultStart = createDefaultDate(newType)
  const defaultEnd = createDefaultDate(newType)

  dateRange.value = {
    start: { ...defaultStart, calendarType: newType },
    end: { ...defaultEnd, calendarType: newType }
  }

  emit('update:beginDate', dateRange.value.start)
  emit('update:endDate', dateRange.value.end)
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// 生命周期
watch(selectedCalendarType, updateCalendarType)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 确保下拉面板在最顶层 */
.historical-date-selector {
  z-index: 50;
}
</style>