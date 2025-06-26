import type { HistoricalDate } from "@/connects/layer_pb"

// 历史日期范围
export interface HistoricalDateRange {
  start: HistoricalDate
  end: HistoricalDate
}

// 朝代信息
export interface Dynasty {
  name: string
  startYear: number
  endYear: number
  periods: DynastyPeriod[]
}

// 朝代时期
export interface DynastyPeriod {
  name: string
  description: string
  startYear: number
  endYear: number
}

// 年号信息
export interface Era {
  name: string
  emperor: string
  dynasty: string
  startYear: number
  endYear: number
}

// 农历月份信息
export interface LunarMonth {
  year: number
  month: number
  isLeap: boolean
  name: string
  days: number
}

// 模糊区间定义
export interface PeriodRange {
  name: string
  description: string
  startDate: string  // ISO格式
  endDate: string    // ISO格式
  dynasty?: string
} 