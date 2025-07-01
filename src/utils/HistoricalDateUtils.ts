import { create } from "@bufbuild/protobuf";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb";
import { DateInputUtils } from "@/utils/DateInputUtils";

export class HistoricalDateUtils {
  /**
   * 历史日期工具类
   */
  /**
   * 创建默认日期
   * @param calendarType 日历类型
   * @returns 默认的历史日期对象
   */
  static createDefaultDate(calendarType: CalendarType): HistoricalDate {
    return create(HistoricalDateSchema, {
      calendarType,
      year: calendarType === CalendarType.ERA ? 0 : 755,
      month: 12,
      day: 16,
      isLeapMonth: false,
      dynastyName: calendarType === CalendarType.ERA ? "唐" : "",
      eraName: calendarType === CalendarType.ERA ? "天宝" : "",
      eraYear: calendarType === CalendarType.ERA ? 14 : 0,
    });
  }

  /**
   * 验证历史日期是否有效
   * @param date 历史日期对象
   * @returns 是否有效
   */
  static isValid(date: HistoricalDate): boolean {
    // 对于年号类型，检查 eraYear 和相关字段
    if (date.calendarType === CalendarType.ERA) {
      if (!date.eraYear || date.eraYear <= 0) return false;
      if (!date.dynastyName || !date.eraName) return false;
    } else {
      // 对于公元和农历，年份可以是负数（公元前），但不能是0（没有公元0年）
      if (date.year === 0) return false;
    }

    // 月份必须在1-12之间
    if (date.month < 1 || date.month > 12) return false;

    // 日期必须在1-31之间（简化验证，不考虑具体月份的天数差异）
    if (date.day < 1 || date.day > 31) return false;

    return true;
  }

  /**
   * 格式化年份为中文显示
   * @param year 年份（可为负数）
   * @returns 格式化的年份字符串
   */
  private static formatYear(year: number): string {
    return year < 0 ? `公元前${Math.abs(year)}` : `公元${year}`;
  }

  /**
   * 格式化传统月日名称
   * @param month 月份
   * @param day 日期
   * @param isLeapMonth 是否闰月
   * @returns 格式化的月日字符串
   */
  private static formatTraditionalMonthDay(
    month: number,
    day: number,
    isLeapMonth: boolean = false,
  ): string {
    const leapPrefix = isLeapMonth ? "闰" : "";
    const monthName = DateInputUtils.LUNAR_MONTHS[month - 1] || `${month}月`;
    const dayName = DateInputUtils.LUNAR_DAYS[day - 1] || `${day}日`;
    return `${leapPrefix}${monthName}${dayName}`;
  }

  /**
   * 格式化阳历日期
   * @param date 历史日期对象
   * @returns 格式化的阳历日期字符串
   */
  private static formatGregorianDate(date: HistoricalDate): string {
    return `${this.formatYear(date.year)}年${date.month}月${date.day}日`;
  }

  /**
   * 格式化农历日期
   * @param date 历史日期对象
   * @returns 格式化的农历日期字符串
   */
  private static formatLunarDate(date: HistoricalDate): string {
    const traditionalMonthDay = this.formatTraditionalMonthDay(
      date.month,
      date.day,
      date.isLeapMonth,
    );
    return `【农历】${this.formatYear(date.year)}年${traditionalMonthDay}`;
  }

  /**
   * 格式化年号日期
   * @param date 历史日期对象
   * @returns 格式化的年号日期字符串
   */
  private static formatEraDate(date: HistoricalDate): string {
    const traditionalMonthDay = this.formatTraditionalMonthDay(
      date.month,
      date.day,
      date.isLeapMonth,
    );
    // 使用中文年份显示
    const chineseEraYear = DateInputUtils.getEraYearDisplayText(date.eraYear, date.eraName);
    return `${date.dynastyName}${date.eraName}${chineseEraYear}${traditionalMonthDay}`;
  }

  /**
   * 格式化日期范围显示文本
   * @param startText 开始日期文本
   * @param endText 结束日期文本
   * @returns 格式化的范围文本
   */
  private static formatDateRange(startText: string, endText: string): string {
    return startText === endText ? startText : `${startText} 至 ${endText}`;
  }

  /**
   * 获取历史日期范围的显示文本
   * @param start 开始日期
   * @param end 结束日期
   * @param selectedCalendarType 选中的日历类型
   * @param currentPresetName 当前预设名称（快速选择时使用）
   * @returns 格式化的显示文本
   */
  static getDisplayText(
    start: HistoricalDate,
    end: HistoricalDate,
    selectedCalendarType: CalendarType,
    currentPresetName: string = "",
  ): string {
    if (!this.isValid(start) || !this.isValid(end)) {
      return "请选择时间范围";
    }

    // 如果是快速选择，显示预设名称格式
    if (currentPresetName) {
      const startText = this.formatGregorianDate(start);
      const endText = this.formatGregorianDate(end);
      return `${currentPresetName}（${this.formatDateRange(startText, endText)}）`;
    }

    // 根据不同的日历类型显示不同格式
    switch (selectedCalendarType) {
      case CalendarType.ERA:
        if (start.dynastyName && start.eraName && start.eraYear) {
          const startText = this.formatEraDate(start);
          const endText = this.formatEraDate(end);
          return this.formatDateRange(startText, endText);
        }
        return "请选择年号时间范围";

      case CalendarType.GREGORIAN:
        if (start.year && start.month && start.day) {
          const startText = this.formatGregorianDate(start);
          const endText = this.formatGregorianDate(end);
          return this.formatDateRange(startText, endText);
        }
        return "请选择公元时间范围";

      case CalendarType.LUNAR:
        if (start.year && start.month && start.day) {
          const startText = this.formatLunarDate(start);
          const endText = this.formatLunarDate(end);
          return this.formatDateRange(startText, endText);
        }
        return "请选择农历时间范围";

      default:
        return "请选择时间范围";
    }
  }
}
