<template>
  <div class="date-input-component min-w-[340px]">
    <!-- 阳历输入：[☑公元前] [年] [月] [日] -->
    <div v-if="value.calendarType === CalendarType.GREGORIAN" class="flex items-center gap-3 flex-wrap">
      <div class="form-control">
        <label class="label cursor-pointer p-0">
          <input type="checkbox" v-model="isBC" @change="updateGregorianDate"
            class="checkbox checkbox-primary checkbox-sm" />
          <span class="label-text ml-2 text-sm font-medium">公元前</span>
        </label>
      </div>
      
      <div class="flex items-center gap-1">
        <input type="number" v-model="gregorianYear" @input="updateGregorianDate" 
          placeholder="5" min="0" max="1840"
          class="input input-bordered input-sm w-16 text-center" />
        <span class="text-sm font-medium text-base-content">年</span>
      </div>
      
      <div class="flex items-center gap-1">
        <input type="number" v-model="gregorianMonth" @input="updateGregorianDate" 
          placeholder="12" min="1" max="12"
          class="input input-bordered input-sm w-14 text-center" />
        <span class="text-sm font-medium text-base-content">月</span>
      </div>
      
      <div class="flex items-center gap-1">
        <input type="number" v-model="gregorianDay" @input="updateGregorianDate" 
          placeholder="30" min="1" max="31"
          class="input input-bordered input-sm w-14 text-center" />
        <span class="text-sm font-medium text-base-content">日</span>
      </div>
    </div>

    <!-- 农历输入：[☑公元前] [年] [☑闰] [月] [日]  -->
    <div v-else-if="value.calendarType === CalendarType.LUNAR" class="flex items-center gap-3 flex-wrap">
      <div class="form-control">
        <label class="label cursor-pointer p-0">
          <input type="checkbox" v-model="isBC" @change="updateLunarDate"
            class="checkbox checkbox-primary checkbox-sm" />
          <span class="label-text ml-2 text-sm font-medium">公元前</span>
        </label>
      </div>
      
      <div class="flex items-center gap-1">
        <input type="number" v-model="lunarYear" @input="updateLunarDate" 
          placeholder="5" min="1" max="3000"
          class="input input-bordered input-sm w-16 text-center" />
        <span class="text-sm font-medium text-base-content">年</span>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer p-0">
          <input type="checkbox" v-model="isLeapMonth" @change="updateLunarDate"
            class="checkbox checkbox-secondary checkbox-sm" />
          <span class="label-text ml-2 text-sm font-medium">闰</span>
        </label>
      </div>
      
      <div class="flex items-center gap-1">
        <select v-model="lunarMonth" @change="updateLunarDate"
          class="select select-bordered select-sm w-16 text-center">
          <option disabled value="">月</option>
          <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
            {{ month }}
          </option>
        </select>
        <span class="text-sm font-medium text-base-content">月</span>
      </div>
      
      <div class="flex items-center gap-1">
        <select v-model="lunarDay" @change="updateLunarDate"
          class="select select-bordered select-sm w-16 text-center">
          <option disabled value="">日</option>
          <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
            {{ day }}
          </option>
        </select>
        <span class="text-sm font-medium text-base-content">日</span>
      </div>     
    </div>

    <!-- 年号输入：[朝代] [皇帝] [年号] [年] [☑闰] [月] [日] -->
    <div v-else-if="value.calendarType === CalendarType.ERA" class="flex items-center gap-3 flex-wrap">
      <div class="dropdown">
        <select v-model="eraName" @change="updateEraDate"
          class="select select-bordered select-sm min-w-[80px]">
          <option disabled value="">年号</option>
          <option v-for="era in eras" :key="era.name" :value="era.name">
            {{ era.name }}
          </option>
        </select>
      </div>
      
      <div class="flex items-center gap-1">
        <input type="number" v-model="eraYear" @input="updateEraDate" 
          placeholder="5" min="1" max="50"
          class="input input-bordered input-sm w-14 text-center" />
        <span class="text-sm font-medium text-base-content">年</span>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer p-0">
          <input type="checkbox" v-model="isLeapMonth" @change="updateEraDate"
            class="checkbox checkbox-secondary checkbox-sm" />
          <span class="label-text ml-2 text-sm font-medium">闰</span>
        </label>
      </div>
      
      <div class="flex items-center gap-1">
        <select v-model="eraMonth" @change="updateEraDate"
          class="select select-bordered select-sm w-16 text-center">
          <option disabled value="">月</option>
          <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
            {{ month }}
          </option>
        </select>
        <span class="text-sm font-medium text-base-content">月</span>
      </div>
      
      <div class="flex items-center gap-1">
        <select v-model="eraDay" @change="updateEraDate"
          class="select select-bordered select-sm w-16 text-center">
          <option disabled value="">日</option>
          <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
            {{ day }}
          </option>
        </select>
        <span class="text-sm font-medium text-base-content">日</span>
      </div>    
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarType, type HistoricalDate } from '@/connects/common_pb'
import { LunarDate } from "./DateInput.vue.ts"
import { ERAS } from "../models/historical-data.ts"

// Props
interface Props {
  value: HistoricalDate
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:value': [value: HistoricalDate]
}>()

//是否是公元前
const isBC = ref(false)

//是否是闰月
const isLeapMonth = ref(false)

// 阳历相关响应式数据
const gregorianYear = ref<number>()
const gregorianMonth = ref<number>()
const gregorianDay = ref<number>()

// 农历相关响应式数据，公元8年 闰 五月初六
const lunarYear = ref<number>()
const lunarMonth = ref<number>()
const lunarDay = ref<number>()

// 年号相关响应式数据，唐 太宗 贞观 3年 闰 四月 初八
const dynastyName = ref<string>()
const emperorId = ref<string>()
const eraName = ref<string>()
const eraYear = ref<number>()
const eraMonth = ref<number>()
const eraDay = ref<number>()

// 计算属性
const eras = computed(() => ERAS)
const { lunarMonths, lunarDays } = LunarDate()

// 更新方法
const updateGregorianDate = () => {
  if (!gregorianYear.value || !gregorianMonth.value || !gregorianDay.value) return

  const year = isBC.value ? -gregorianYear.value : gregorianYear.value
  
  const newDate: HistoricalDate = {
    ...props.value,
    calendarType: CalendarType.GREGORIAN,
    year: year,
    month: gregorianMonth.value,
    day: gregorianDay.value,
    isLeapMonth: false,
    dynastyName: '',
    eraName: ''
  }
  emit('update:value', newDate)
}

const updateLunarDate = () => {
  if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) return

  const year = isBC.value ? -lunarYear.value : lunarYear.value
  
  const newDate: HistoricalDate = {
    ...props.value,
    calendarType: CalendarType.LUNAR,
    year: year,
    month: lunarMonth.value,
    day: lunarDay.value,
    isLeapMonth: isLeapMonth.value,
    dynastyName: '',
    eraName: ''
  }
  emit('update:value', newDate)
}

const updateEraDate = () => {
  if (!eraName.value || !eraYear.value || !eraMonth.value || !eraDay.value || !dynastyName.value) return
  
  const newDate: HistoricalDate = {
    ...props.value,
    calendarType: CalendarType.ERA,
    year: eraYear.value,
    month: eraMonth.value,
    day: eraDay.value,
    isLeapMonth: isLeapMonth.value,
    dynastyName: dynastyName.value,
    eraName: eraName.value
  }
  emit('update:value', newDate)
}

// 初始化数据
const initializeData = () => {
  const value = props.value
  if (!value) return

  if (value.calendarType === CalendarType.GREGORIAN) {
    isBC.value = value.year < 0
    gregorianYear.value = Math.abs(value.year)
    gregorianMonth.value = value.month
    gregorianDay.value = value.day
  } else if (value.calendarType === CalendarType.LUNAR) {
    isBC.value = value.year < 0
    lunarYear.value = Math.abs(value.year)
    lunarMonth.value = value.month
    lunarDay.value = value.day
    isLeapMonth.value = value.isLeapMonth
  } else if (value.calendarType === CalendarType.ERA) {
    eraName.value = value.eraName
    dynastyName.value = value.dynastyName
    eraYear.value = value.year
    eraMonth.value = value.month
    eraDay.value = value.day
    isLeapMonth.value = value.isLeapMonth
  }
}

// 监听modelValue变化
watch(() => props.value, initializeData, { immediate: true })
</script>

<style scoped>
select:disabled {
  cursor: not-allowed;
}
</style>