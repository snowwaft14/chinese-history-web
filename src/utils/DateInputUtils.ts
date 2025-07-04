import { computed } from "vue";

// 农历月份名称
const LUNAR_MONTHS = [
  "正月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "冬月",
  "腊月",
];

// 农历日期名称
const LUNAR_DAYS = [
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
];

export class DateInputUtils {
  // 静态数据
  static readonly LUNAR_MONTHS = LUNAR_MONTHS;
  static readonly LUNAR_DAYS = LUNAR_DAYS;

  // === 中文数字转换相关 ===
  
  // 基础中文数字
  private static readonly CHINESE_NUMBERS = [
    "零", "一", "二", "三", "四", "五", "六", "七", "八", "九"
  ];

  // 年号专用的中文数字（元年、二年等）- 支持到六十一年（康熙在位61年）
  private static readonly ERA_YEAR_NAMES = [
    "元年", "二年", "三年", "四年", "五年", "六年", "七年", "八年", "九年", "十年",
    "十一年", "十二年", "十三年", "十四年", "十五年", "十六年", "十七年", "十八年", "十九年", "二十年",
    "二十一年", "二十二年", "二十三年", "二十四年", "二十五年", "二十六年", "二十七年", "二十八年", "二十九年", "三十年",
    "三十一年", "三十二年", "三十三年", "三十四年", "三十五年", "三十六年", "三十七年", "三十八年", "三十九年", "四十年",
    "四十一年", "四十二年", "四十三年", "四十四年", "四十五年", "四十六年", "四十七年", "四十八年", "四十九年", "五十年",
    "五十一年", "五十二年", "五十三年", "五十四年", "五十五年", "五十六年", "五十七年", "五十八年", "五十九年", "六十年", "六十一年"
  ];

  // 天宝载专用名称（天宝三载、四载等）
  private static readonly TIANBAO_ZAI_NAMES = [
    "元年", "二年", "三载", "四载", "五载", "六载", "七载", "八载", "九载", "十载",
    "十一载", "十二载", "十三载", "十四载", "十五载"
  ];

  /**
   * 将数字转换为年号年份的中文表示
   * @param year 年份数字（1-61）
   * @param eraName 年号名称，用于特殊处理
   * @returns 中文年份字符串
   */
  private static numberToEraYear(year: number, eraName: string = ""): string {
    if (year < 1 || year > 61) {
      return `${year}年`;
    }

    // 特殊处理：天宝年号，三年及以后改称"载"
    if (eraName === "天宝" && year <= 15) {
      return this.TIANBAO_ZAI_NAMES[year - 1];
    }

    // 普通年号处理
    return this.ERA_YEAR_NAMES[year - 1] || `${year}年`;
  }

  /**
   * 将中文年份转换为数字
   * @param chineseYear 中文年份字符串
   * @returns 数字年份
   */
  static eraYearToNumber(chineseYear: string): number {
    // 移除年/载后缀
    const cleanText = chineseYear.replace(/[年载]$/, "");

    // 元年特殊处理
    if (cleanText === "元") {
      return 1;
    }

    // 在天宝载名称中查找
    const tianbaoIndex = this.TIANBAO_ZAI_NAMES.findIndex(name => 
      name.replace(/[年载]$/, "") === cleanText
    );
    if (tianbaoIndex !== -1) {
      return tianbaoIndex + 1;
    }

    // 在普通年号名称中查找
    const eraIndex = this.ERA_YEAR_NAMES.findIndex(name => 
      name.replace(/年$/, "") === cleanText
    );
    if (eraIndex !== -1) {
      return eraIndex + 1;
    }

    // 尝试解析复杂中文数字
    return this.parseComplexChineseNumber(cleanText);
  }

  /**
   * 解析复杂的中文数字（如"二十三"）
   * @param chineseText 中文数字文本
   * @returns 解析后的数字
   */
  private static parseComplexChineseNumber(chineseText: string): number {
    let result = 0;
    let temp = 0;

    for (let i = 0; i < chineseText.length; i++) {
      const char = chineseText[i];
      
      if (char === "十") {
        if (temp === 0) {
          temp = 1; // "十"在开头表示10
        }
        result += temp * 10;
        temp = 0;
      } else if (char === "二十" || char === "三十" || char === "四十") {
        // 处理"二十"、"三十"等
        const tens = this.CHINESE_NUMBERS.indexOf(char.charAt(0));
        result += tens * 10;
      } else {
        const digit = this.CHINESE_NUMBERS.indexOf(char);
        if (digit >= 0) {
          temp = digit;
        }
      }
    }

    result += temp;
    return result > 0 ? result : parseInt(chineseText) || 1;
  }

  /**
   * 根据年号名称和年份范围生成年份选项
   * @param eraName 年号名称
   * @param startYear 起始年份（实际历史年份）
   * @param endYear 结束年份（实际历史年份）
   * @returns 年份选项数组
   */
  public static generateEraYearOptions(eraName: string, startYear: number, endYear: number): Array<{
    value: number;
    label: string;
    searchValues: string[];
  }> {
    const yearCount = endYear - startYear + 1;
    const options: Array<{
      value: number;
      label: string;
      searchValues: string[];
    }> = [];

    for (let i = 1; i <= yearCount; i++) {
      const chineseYear = this.numberToEraYear(i, eraName);
      
      // 生成搜索值：包括数字和中文
      const searchValues = [
        i.toString(), // 数字形式
        chineseYear, // 完整中文形式
        chineseYear.replace(/[年载]$/, ""), // 去掉后缀的形式
      ];

      // 特殊处理元年
      if (i === 1) {
        searchValues.push("1", "元", "第一", "首");
      }

      options.push({
        value: i,
        label: chineseYear,
        searchValues: [...new Set(searchValues)] // 去重
      });
    }

    return options;
  }

  /**
   * 检查是否为天宝年号的载制
   * @param eraName 年号名称
   * @param year 年份
   * @returns 是否使用载制
   */
  static isTianbaoZai(eraName: string, year: number): boolean {
    return eraName === "天宝" && year >= 3 && year <= 15;
  }

  /**
   * 获取年号年份的显示文本（用于HistoricalDateUtils）
   * @param year 年份数字
   * @param eraName 年号名称
   * @returns 显示用的中文年份
   */
  static getEraYearDisplayText(year: number, eraName: string = ""): string {
    return this.numberToEraYear(year, eraName);
  }
}
