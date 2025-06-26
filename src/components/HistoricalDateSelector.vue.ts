import { create } from "@bufbuild/protobuf";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from '@/connects/layer_pb'
import { ERAS, PERIOD_RANGES } from '@/models/historical-data'

/**
 * 历史日期工具类
 */
export class HistoricalDateUtils {

  /**
   * 将历史日期转换为公元日期字符串
   */
  static toISODate(historicalDate: HistoricalDate): string {
    switch (historicalDate.calendarType) {
      case CalendarType.GREGORIAN:
        return historicalDate.isoDate || ''

      case CalendarType.ERA_NAME:
        return this.convertEraToISO(historicalDate)

      case CalendarType.DYNASTY_RANGE:
        return this.convertPeriodToISO(historicalDate)

      case CalendarType.LUNAR:
        // 农历转换需要农历库支持，暂时返回空字符串
        return historicalDate.isoDate || ''

      default:
        return ''
    }
  }

  /**
   * 年号转换为公元日期
   */
  static convertEraToISO(historicalDate: HistoricalDate): string {
    if (!historicalDate.eraName || !historicalDate.eraYear) {
      return ''
    }

    const era = ERAS.find(e => e.name === historicalDate.eraName)
    if (!era) {
      return ''
    }

    const year = era.startYear + (historicalDate.eraYear - 1)
    const month = historicalDate.eraMonth || 1
    const day = historicalDate.eraDay || 1

    // 确保年份为4位数，月日为2位数
    const paddedYear = year.toString().padStart(4, '0')
    const paddedMonth = month.toString().padStart(2, '0')
    const paddedDay = day.toString().padStart(2, '0')

    return `${paddedYear}-${paddedMonth}-${paddedDay}`
  }

  /**
   * 模糊区间转换为公元日期
   */
  static convertPeriodToISO(historicalDate: HistoricalDate, isEndDate = false): string {
    if (!historicalDate.period) {
      return ''
    }

    const period = PERIOD_RANGES.find(p => p.name === historicalDate.period)
    if (!period) {
      return ''
    }

    return isEndDate ? period.endDate : period.startDate
  }

  /**
   * 格式化历史日期为可读字符串
   */
  static formatDate(historicalDate: HistoricalDate): string {
    switch (historicalDate.calendarType) {
      case CalendarType.GREGORIAN:
        return historicalDate.isoDate || ''

      case CalendarType.ERA_NAME:
        return this.formatEraDate(historicalDate)

      case CalendarType.DYNASTY_RANGE:
        return historicalDate.period || ''

      case CalendarType.LUNAR:
        return historicalDate.lunarDate || ''

      default:
        return ''
    }
  }

  /**
   * 格式化年号日期
   */
  static formatEraDate(historicalDate: HistoricalDate): string {
    const parts: string[] = []

    if (historicalDate.eraName) {
      parts.push(historicalDate.eraName)
    }

    if (historicalDate.eraYear) {
      parts.push(`${historicalDate.eraYear}年`)
    }

    if (historicalDate.eraMonth) {
      parts.push(`${historicalDate.eraMonth}月`)
    }

    if (historicalDate.eraDay) {
      parts.push(`${historicalDate.eraDay}日`)
    }

    return parts.join('')
  }

  /**
   * 创建默认的历史日期对象
   */
  static createDefault(calendarType: CalendarType): HistoricalDate {
    const base: HistoricalDate = create(HistoricalDateSchema, {
      calendarType
  })

    switch (calendarType) {
      case CalendarType.GREGORIAN:
        return {
          ...base,
          isoDate: '0755-12-16' // 默认安史之乱开始时间
        }

      case CalendarType.ERA_NAME:
        return {
          ...base,
          eraName: '天宝',
          eraYear: 14,
          eraMonth: 12,
          eraDay: 16
        }

      case CalendarType.DYNASTY_RANGE:
        return {
          ...base,
          period: '安史之乱',
          dynasty: '唐朝'
        }

      case CalendarType.LUNAR:
        return {
          ...base,
          lunarDate: '天宝十四年十一月初九'
        }

      default:
        return base
    }
  }

  /**
   * 验证历史日期是否有效
   */
  static isValid(historicalDate: HistoricalDate): boolean {
    switch (historicalDate.calendarType) {
      case CalendarType.GREGORIAN:
        return !!historicalDate.isoDate && this.isValidISODate(historicalDate.isoDate)

      case CalendarType.ERA_NAME:
        return !!(historicalDate.eraName && historicalDate.eraYear)

      case CalendarType.DYNASTY_RANGE:
        return !!historicalDate.period

      case CalendarType.LUNAR:
        return !!historicalDate.lunarDate

      default:
        return false
    }
  }

  /**
   * 验证ISO日期格式是否正确
   */
  static isValidISODate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) {
      return false
    }

    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * 获取年号的可用年份范围
   */
  static getEraYearRange(eraName: string): { min: number; max: number } | null {
    const era = ERAS.find(e => e.name === eraName)
    if (!era) {
      return null
    }

    return {
      min: 1,
      max: era.endYear - era.startYear + 1
    }
  }
} 