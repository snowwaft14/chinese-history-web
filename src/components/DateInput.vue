<template>
  <div class="date-input-component">
    <!-- 公元纪年输入 -->
    <div v-if="calendarType === CalendarType.GREGORIAN" class="space-y-2">
      <input type="date" :value="modelValue.isoDate" @input="updateGregorianDate"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" />
    </div>

    <!-- 年号输入 -->
    <div v-else-if="calendarType === CalendarType.ERA_NAME" class="space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <!-- 年号选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">年号</label>
          <select :value="modelValue.eraName" @change="updateEraName"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
            <option value="">选择年号</option>
            <option v-for="era in eras" :key="era.name" :value="era.name">
              {{ era.name }}（{{ era.emperor }}）
            </option>
          </select>
        </div>

        <!-- 年份选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">年份</label>
          <select :value="modelValue.eraYear" @change="updateEraYear" :disabled="!modelValue.eraName"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400">
            <option value="">年</option>
            <option v-for="year in availableEraYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- 月份选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">月份</label>
          <select :value="modelValue.eraMonth" @change="updateEraMonth"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
            <option value="">月</option>
            <option v-for="month in 12" :key="month" :value="month">
              {{ month }}月
            </option>
          </select>
        </div>

        <!-- 日期选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">日期</label>
          <select :value="modelValue.eraDay" @change="updateEraDay"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
            <option value="">日</option>
            <option v-for="day in 30" :key="day" :value="day">
              {{ day }}日
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 朝代区间输入 -->
    <div v-else-if="calendarType === CalendarType.DYNASTY_RANGE" class="space-y-3">
      <select :value="modelValue.period" @change="updatePeriod"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
        <option value="">选择历史时期</option>
        <option v-for="period in periods" :key="period.name" :value="period.name">
          {{ period.name }}
        </option>
      </select>
      <div v-if="selectedPeriod" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-xs text-blue-700 font-medium">
          {{ selectedPeriod.description }}
        </p>
      </div>
    </div>

    <!-- 农历输入 -->
    <div v-else-if="calendarType === CalendarType.LUNAR" class="space-y-4">
      <div class="grid grid-cols-3 gap-3">
        <!-- 年份输入 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">年份</label>
          <input type="number" placeholder="年" min="618" max="907" :value="lunarYear" @input="updateLunarYear"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm" />
        </div>

        <!-- 月份选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">月份</label>
          <select :value="lunarMonth" @change="updateLunarMonth"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
            <option value="">月</option>
            <option v-for="month in lunarMonths" :key="month" :value="month">
              {{ month }}
            </option>
          </select>
        </div>

        <!-- 日期选择 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">日期</label>
          <select :value="lunarDay" @change="updateLunarDay"
            class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm">
            <option value="">日</option>
            <option v-for="day in lunarDays" :key="day" :value="day">
              {{ day }}
            </option>
          </select>
        </div>
      </div>

      <!-- 是否闰月 -->
      <div class="flex items-center justify-center">
        <label
          class="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
          <input type="checkbox" :checked="isLeapMonth" @change="updateLeapMonth"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm font-medium text-gray-700">🌙 闰月</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarType, type HistoricalDate } from '@/connects/layer_pb'
import { ERAS, PERIOD_RANGES, LUNAR_MONTHS, LUNAR_DAYS } from '@/models/historical-data'
import { HistoricalDateUtils } from './HistoricalDateSelector.vue.ts'

// Props
interface Props {
  calendarType: CalendarType
  modelValue: HistoricalDate
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: HistoricalDate]
}>()

// 农历相关响应式数据
const lunarYear = ref<number>()
const lunarMonth = ref<string>()
const lunarDay = ref<string>()
const isLeapMonth = ref(false)

// 计算属性
const eras = computed(() => ERAS)
const periods = computed(() => PERIOD_RANGES)
const lunarMonths = computed(() => LUNAR_MONTHS)
const lunarDays = computed(() => LUNAR_DAYS)

const selectedPeriod = computed(() => {
  return periods.value.find(p => p.name === props.modelValue.period)
})

const availableEraYears = computed(() => {
  if (!props.modelValue.eraName) return []

  const range = HistoricalDateUtils.getEraYearRange(props.modelValue.eraName)
  if (!range) return []

  const years = []
  for (let i = range.min; i <= range.max; i++) {
    years.push(i)
  }
  return years
})

// 更新方法
const updateGregorianDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newDate: HistoricalDate = {
    ...props.modelValue,
    isoDate: target.value
  }
  emit('update:modelValue', newDate)
}

const updateEraName = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDate: HistoricalDate = {
    ...props.modelValue,
    eraName: target.value,
    eraYear: 0,
    eraMonth: 0,
    eraDay: 0
  }
  emit('update:modelValue', newDate)
}

const updateEraYear = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDate: HistoricalDate = {
    ...props.modelValue,
    eraYear: target.value ? parseInt(target.value) : 0
  }
  emit('update:modelValue', newDate)
}

const updateEraMonth = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDate: HistoricalDate = {
    ...props.modelValue,
    eraMonth: target.value ? parseInt(target.value) : 0
  }
  emit('update:modelValue', newDate)
}

const updateEraDay = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDate: HistoricalDate = {
    ...props.modelValue,
    eraDay: target.value ? parseInt(target.value) : 0
  }
  emit('update:modelValue', newDate)
}

const updatePeriod = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedPeriod = periods.value.find(p => p.name === target.value)
  const newDate: HistoricalDate = {
    ...props.modelValue,
    period: target.value,
    dynasty: selectedPeriod?.dynasty || ""
  }
  emit('update:modelValue', newDate)
}

const updateLunarYear = (event: Event) => {
  const target = event.target as HTMLInputElement
  lunarYear.value = target.value ? parseInt(target.value) : undefined
  updateLunarDate()
}

const updateLunarMonth = (event: Event) => {
  const target = event.target as HTMLSelectElement
  lunarMonth.value = target.value
  updateLunarDate()
}

const updateLunarDay = (event: Event) => {
  const target = event.target as HTMLSelectElement
  lunarDay.value = target.value
  updateLunarDate()
}

const updateLeapMonth = (event: Event) => {
  const target = event.target as HTMLInputElement
  isLeapMonth.value = target.checked
  updateLunarDate()
}

const updateLunarDate = () => {
  if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) return

  const leapPrefix = isLeapMonth.value ? '闰' : ''
  const lunarDateString = `${lunarYear.value}年${leapPrefix}${lunarMonth.value}${lunarDay.value}`

  const newDate: HistoricalDate = {
    ...props.modelValue,
    lunarDate: lunarDateString
  }
  emit('update:modelValue', newDate)
}

// 初始化农历数据
const initializeLunarData = () => {
  if (props.modelValue.lunarDate) {
    const lunar = props.modelValue.lunarDate
    const yearMatch = lunar.match(/(\d+)年/)
    const monthMatch = lunar.match(/[闰]?([十一二三四五六七八九正月]{1,2})/)
    const dayMatch = lunar.match(/(初[一二三四五六七八九十]|[十廿][一二三四五六七八九十]?|二十|三十)/)

    if (yearMatch) lunarYear.value = parseInt(yearMatch[1])
    if (monthMatch) lunarMonth.value = monthMatch[1]
    if (dayMatch) lunarDay.value = dayMatch[1]
    isLeapMonth.value = lunar.includes('闰')
  }
}

// 监听modelValue变化
watch(() => props.modelValue, initializeLunarData, { immediate: true })
</script>

<style scoped>
select:disabled {
  cursor: not-allowed;
}
</style>