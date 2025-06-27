import { computed, ref } from "vue";
import type { Dynasty } from "@/connects/dynasty_pb";
import { dynastyServiceClient } from "@/services/dynastyService";

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

  // 朝代数据
  private static dynasties = ref<Dynasty[]>([]);
  private static dynastiesLoaded = ref(false);
  private static loadingDynasties = ref(false);

  /**
   * 获取农历日期相关数据
   */
  static getLunarDate() {
    const lunarMonths = computed(() => DateInputUtils.LUNAR_MONTHS);
    const lunarDays = computed(() => DateInputUtils.LUNAR_DAYS);

    return {
      lunarMonths,
      lunarDays,
    };
  }

  /**
   * 获取所有朝代数据
   */
  static async getAllDynasties(): Promise<Dynasty[]> {
    // 如果已经加载过，直接返回缓存的数据
    if (DateInputUtils.dynastiesLoaded.value) {
      return DateInputUtils.dynasties.value;
    }

    // 如果正在加载，等待加载完成
    if (DateInputUtils.loadingDynasties.value) {
      // 等待加载完成
      while (DateInputUtils.loadingDynasties.value) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return DateInputUtils.dynasties.value;
    }

    try {
      DateInputUtils.loadingDynasties.value = true;
      console.log("开始加载朝代数据...");

      const dynasties = await dynastyServiceClient.getAllDynasties(false);
      DateInputUtils.dynasties.value = dynasties;
      DateInputUtils.dynastiesLoaded.value = true;

      console.log(
        `成功加载 ${dynasties.length} 个朝代:`,
        dynasties.map((d) => d.name),
      );
      return dynasties;
    } catch (error) {
      console.error("加载朝代数据失败:", error);
      // 返回空数组，确保应用不会崩溃
      return [];
    } finally {
      DateInputUtils.loadingDynasties.value = false;
    }
  }

  /**
   * 获取朝代名称列表（用于下拉选择）
   */
  static async getDynastyNames(): Promise<string[]> {
    const dynasties = await DateInputUtils.getAllDynasties();
    return dynasties.map((dynasty) => dynasty.name);
  }

  /**
   * 根据名称获取朝代详情
   */
  static async getDynastyByName(name: string): Promise<Dynasty | undefined> {
    const dynasties = await DateInputUtils.getAllDynasties();
    return dynasties.find((dynasty) => dynasty.name === name);
  }

  /**
   * 检查是否正在加载朝代数据
   */
  static isLoadingDynasties(): boolean {
    return DateInputUtils.loadingDynasties.value;
  }

  /**
   * 获取朝代数据响应式引用（用于组件中的响应式更新）
   */
  static getDynastiesRef() {
    return {
      dynasties: computed(() => DateInputUtils.dynasties.value),
      dynastiesLoaded: computed(() => DateInputUtils.dynastiesLoaded.value),
      loadingDynasties: computed(() => DateInputUtils.loadingDynasties.value),
    };
  }
}
