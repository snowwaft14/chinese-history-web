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
      month: calendarType === CalendarType.ERA ? 0 : 12,
      day: calendarType === CalendarType.ERA ? 0 : 16,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
    });
  }

  /**
   * 验证历史日期是否有效
   * @param date 历史日期对象
   * @returns 是否有效
   */
  static isValid(date: HistoricalDate): boolean {
    // 对于年号类型，检查基本字段
    if (date.calendarType === CalendarType.ERA) {
      // 必须有朝代和皇帝，其他字段可以部分缺失
      if (!date.dynastyName || !date.emperorId) return false;
      if (date.eraYear < 0) return false;
    } else {
      // 对于公元和农历，年份不能是0（没有公元0年）
      if (date.year === 0) return false;
    }

    // 月份：0表示未设置（默认1月/正月），1-12有效
    if (date.month < 0 || date.month > 12) return false;

    // 日期：0表示未设置（默认1日/初一），1-31有效
    if (date.day < 0 || date.day > 31) return false;

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
   * @param month 月份（0表示未设置）
   * @param day 日期（0表示未设置）
   * @param isLeapMonth 是否闰月
   * @returns 格式化的月日字符串
   */
  private static formatTraditionalMonthDay(
    month: number = 0,
    day: number = 0,
    isLeapMonth: boolean = false,
  ): string {
    const leapPrefix = isLeapMonth ? "闰" : "";

    // 处理0值：0表示未设置，使用默认值
    const effectiveMonth = month || 1; // 默认正月
    const effectiveDay = day || 1; // 默认初一

    const monthName = DateInputUtils.LUNAR_MONTHS[effectiveMonth - 1] || `${effectiveMonth}月`;
    const dayName = DateInputUtils.LUNAR_DAYS[effectiveDay - 1] || `${effectiveDay}日`;
    return `${leapPrefix}${monthName}${dayName}`;
  }

  /**
   * 格式化阳历日期
   * @param date 历史日期对象
   * @returns 格式化的阳历日期字符串
   */
  private static formatGregorianDate(date: HistoricalDate): string {
    if (!date.year) {
      return "请选择年份";
    }

    // 处理0值：0表示未设置，使用默认值
    const effectiveMonth = date.month || 1; // 默认1月
    const effectiveDay = date.day || 1; // 默认1日

    return `${this.formatYear(date.year)}年${effectiveMonth}月${effectiveDay}日`;
  }

  /**
   * 格式化农历日期
   * @param date 历史日期对象
   * @returns 格式化的农历日期字符串
   */
  private static formatLunarDate(date: HistoricalDate): string {
    if (!date.year) {
      return "请选择年份";
    }

    const traditionalMonthDay = this.formatTraditionalMonthDay(
      date.month,
      date.day,
      date.isLeapMonth,
    );
    return `${this.formatYear(date.year)}年${traditionalMonthDay}`;
  }

  /**
   * 格式化年号日期
   * @param date 历史日期对象
   * @returns 格式化的年号日期字符串
   */
  private static formatEraDate(date: HistoricalDate): string {
    if (!date.dynastyName) {
      return "请选择朝代";
    }

    if (!date.eraName) {
      return `${date.dynastyName}开国元年正月初一`; // 默认该朝代开国元年
    }

    const traditionalMonthDay = this.formatTraditionalMonthDay(
      date.month,
      date.day,
      date.isLeapMonth,
    );

    // 使用中文年份显示，0表示未设置，默认为元年
    const eraYear = date.eraYear || 1; // 默认元年
    const chineseEraYear = DateInputUtils.getEraYearDisplayText(eraYear, date.eraName);
    return `${date.emperorId}${date.eraName}${chineseEraYear}${traditionalMonthDay}`;
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
        const startText1 = this.formatEraDate(start);
        const endText1 = this.formatEraDate(end);
        return this.formatDateRange(startText1, endText1);

      case CalendarType.GREGORIAN:
        const startText2 = this.formatGregorianDate(start);
        const endText2 = this.formatGregorianDate(end);
        return this.formatDateRange(startText2, endText2);

      case CalendarType.LUNAR:
        const startText3 = this.formatLunarDate(start);
        const endText3 = this.formatLunarDate(end);
        return `农历 ${this.formatDateRange(startText3, endText3)}`;

      default:
        return "请选择时间范围";
    }
  }
}
