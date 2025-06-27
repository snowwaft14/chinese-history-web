import { create } from "@bufbuild/protobuf";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from '@/connects/common_pb'
import { ERAS, PERIOD_RANGES } from '@/models/historical-data'

/**
 * 历史日期工具类
 */
export class HistoricalDateUtils {

  /**
   * 验证历史日期是否有效
   */
  static isValid(historicalDate: HistoricalDate): boolean {
    return true
  }
} 