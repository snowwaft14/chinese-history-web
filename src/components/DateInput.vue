<template>
  <div class="date-input-component min-w-[340px]">
    <!-- 阳历输入：[☑公元前] [年] [月] [日] -->
    <div v-if="calendarType === CalendarType.GREGORIAN" class="flex items-center space-x-2">
      <label class="flex items-center">
        <input type="checkbox" v-model="isBC" @change="updateGregorianDate"
          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span class="ml-1 text-sm text-gray-700">公元前</span>
      </label>
      
      <div class="flex items-center space-x-1">
        <input type="number" v-model="gregorianYear" @input="updateGregorianDate" placeholder="5" min="0" max="1840"
          class="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <span class="text-sm text-gray-700">年</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <input type="number" v-model="gregorianMonth" @input="updateGregorianDate" placeholder="12" min="1" max="12"
          class="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <span class="text-sm text-gray-700">月</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <input type="number" v-model="gregorianDay" @input="updateGregorianDate" placeholder="30" min="1" max="31"
          class="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <span class="text-sm text-gray-700">日</span>
      </div>
    </div>

    <!-- 农历输入：[☑公元前] [年] [月] [日] [☑闰] -->
    <div v-else-if="calendarType === CalendarType.LUNAR" class="flex items-center space-x-2">
      <label class="flex items-center">
        <input type="checkbox" v-model="isLunarBC" @change="updateLunarDate"
          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span class="ml-1 text-sm text-gray-700">公元前</span>
      </label>
      
      <div class="flex items-center space-x-1">
        <input type="number" v-model="lunarYear" @input="updateLunarDate" placeholder="5" min="1" max="3000"
          class="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <span class="text-sm text-gray-700">年</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <div class="relative">
          <select v-model="lunarMonth" @change="updateLunarDate"
            class="w-16 px-2 py-1 pr-6 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none">
            <option value="">冬</option>
            <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span class="text-sm text-gray-700">月</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <div class="relative">
          <select v-model="lunarDay" @change="updateLunarDate"
            class="w-16 px-2 py-1 pr-6 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none">
            <option value="">廿三</option>
            <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
              {{ day }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span class="text-sm text-gray-700">日</span>
      </div>
      
      <label class="flex items-center">
        <input type="checkbox" v-model="isLeapMonth" @change="updateLunarDate"
          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span class="ml-1 text-sm text-gray-700">闰</span>
      </label>
    </div>

    <!-- 年号输入：[年号下拉] [年] [月] [日] [☑闰] -->
    <div v-else-if="calendarType === CalendarType.ERA" class="flex items-center space-x-2">
      <div class="relative">
        <select v-model="eraName" @change="updateEraDate"
          class="px-3 py-1 pr-6 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none min-w-[80px]">
          <option value="">唐武德</option>
          <option v-for="era in eras" :key="era.name" :value="era.name">
            {{ era.name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
          <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div class="flex items-center space-x-1">
        <input type="number" v-model="eraYear" @input="updateEraDate" placeholder="5" min="1" max="50"
          class="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        <span class="text-sm text-gray-700">年</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <div class="relative">
          <select v-model="eraMonth" @change="updateEraDate"
            class="w-16 px-2 py-1 pr-6 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none">
            <option value="">冬</option>
            <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span class="text-sm text-gray-700">月</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <div class="relative">
          <select v-model="eraDay" @change="updateEraDate"
            class="w-16 px-2 py-1 pr-6 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none">
            <option value="">廿三</option>
            <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
              {{ day }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
            <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span class="text-sm text-gray-700">日</span>
      </div>
      
      <label class="flex items-center">
        <input type="checkbox" v-model="isLeapMonth" @change="updateEraDate"
          class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span class="ml-1 text-sm text-gray-700">闰</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarType, type HistoricalDate } from '@/connects/layer_pb'
import { ERAS, LUNAR_MONTHS, LUNAR_DAYS } from '@/models/historical-data'

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

//是否是公元前
const isBC = ref(false)

//是否是闰月
const isLeapMonth = ref(false)

// 阳历相关响应式数据
const gregorianYear = ref<number>()
const gregorianMonth = ref<number>()
const gregorianDay = ref<number>()

// 农历相关响应式数据
const isLunarBC = ref(false)
const lunarYear = ref<number>()
const lunarMonth = ref<number>()
const lunarDay = ref<number>()

// 年号相关响应式数据
const eraName = ref<string>()
const eraYear = ref<number>()
const eraMonth = ref<number>()
const eraDay = ref<number>()

// 计算属性
const eras = computed(() => ERAS)
const lunarMonths = computed(() => LUNAR_MONTHS)
const lunarDays = computed(() => LUNAR_DAYS)

// 更新方法
const updateGregorianDate = () => {
  if (!gregorianYear.value || !gregorianMonth.value || !gregorianDay.value) return

  const year = isBC.value ? -gregorianYear.value : gregorianYear.value
  
  const newDate: HistoricalDate = {
    ...props.modelValue,
    calendarType: CalendarType.GREGORIAN,
    year: year,
    month: gregorianMonth.value,
    day: gregorianDay.value,
    isLeapMonth: false,
    eraName: ''
  }
  emit('update:modelValue', newDate)
}

const updateLunarDate = () => {
  if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) return

  const year = isLunarBC.value ? -lunarYear.value : lunarYear.value
  
  const newDate: HistoricalDate = {
    ...props.modelValue,
    calendarType: CalendarType.LUNAR,
    year: year,
    month: lunarMonth.value,
    day: lunarDay.value,
    isLeapMonth: isLunarLeapMonth.value,
    eraName: ''
  }
  emit('update:modelValue', newDate)
}

const updateEraDate = () => {
  if (!eraName.value || !eraYear.value || !eraMonth.value || !eraDay.value) return
  
  const newDate: HistoricalDate = {
    ...props.modelValue,
    calendarType: CalendarType.ERA,
    year: eraYear.value,
    month: eraMonth.value,
    day: eraDay.value,
    isLeapMonth: isEraLeapMonth.value,
    eraName: eraName.value
  }
  emit('update:modelValue', newDate)
}

// 初始化数据
const initializeData = () => {
  const value = props.modelValue
  if (!value) return

  if (value.calendarType === CalendarType.GREGORIAN) {
    isBC.value = value.year < 0
    gregorianYear.value = Math.abs(value.year)
    gregorianMonth.value = value.month
    gregorianDay.value = value.day
  } else if (value.calendarType === CalendarType.LUNAR) {
    isLunarBC.value = value.year < 0
    lunarYear.value = Math.abs(value.year)
    lunarMonth.value = value.month
    lunarDay.value = value.day
    isLunarLeapMonth.value = value.isLeapMonth
  } else if (value.calendarType === CalendarType.ERA) {
    eraName.value = value.eraName
    eraYear.value = value.year
    eraMonth.value = value.month
    eraDay.value = value.day
    isEraLeapMonth.value = value.isLeapMonth
  }
}

// 监听modelValue变化
watch(() => props.modelValue, initializeData, { immediate: true })
</script>

<style scoped>
select:disabled {
  cursor: not-allowed;
}
</style>