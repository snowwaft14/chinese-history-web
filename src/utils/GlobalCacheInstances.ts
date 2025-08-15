import type { Dynasty, Emperor, EraName } from "@/connects/dynasty_pb";
import { StaticCacheManager, type StaticInstanceName } from "./StaticCacheManager";
import { dynastyServiceClient } from "@/services/dynastyService";

/**
 * 全局静态缓存实例定义
 */
export class GlobalCacheInstances {
  /**
   * 所有朝代的缓存实例名称
   */
  public static readonly AllDynastiesName: StaticInstanceName<Dynasty[]> =
    StaticCacheManager.createInstanceName<Dynasty[]>("AllDynasties");

  /**
   * 皇帝缓存的Map：key为朝代名称，value为该朝代的皇帝数组
   */
  private static readonly EmperorCacheMap = new Map<string, StaticInstanceName<Emperor[]>>();

  /**
   * 年号缓存的Map：key为皇帝ID，value为该皇帝的年号数组
   */
  private static readonly EraCacheMap = new Map<string, StaticInstanceName<EraName[]>>();

  /**
   * 年号详情缓存的Map：key为"朝代名_年号名"，value为年号详情
   */
  private static readonly EraDetailCacheMap = new Map<string, StaticInstanceName<EraName | null>>();

  /**
   * 获取所有朝代（使用缓存）
   * @param isRefresh 是否强制刷新缓存
   */
  public static async getAllDynasties(isRefresh: boolean = false): Promise<Dynasty[]> {
    if (isRefresh) {
      StaticCacheManager.clearCache(GlobalCacheInstances.AllDynastiesName);
    }
    return await StaticCacheManager.createAsync<Dynasty[]>(
      GlobalCacheInstances.AllDynastiesName,
      async () => {
        console.log("开始从服务器加载所有朝代数据...");
        const dynasties = await dynastyServiceClient.getAllDynasties(true);
        console.log(`成功加载 ${dynasties.length} 个朝代:`, dynasties.map((d: Dynasty) => d.name));
        return dynasties;
      },
      [], // 默认值为空数组
      600 // 10分钟过期
    );
  }

  /**
   * 获取指定朝代的皇帝列表（使用缓存）
   * @param dynastyName 朝代名称
   * @param isRefresh 是否强制刷新缓存
   */
  public static async getEmperorsByDynasty(dynastyName: string, isRefresh: boolean = false): Promise<Emperor[]> {
    if (!dynastyName) return [];

    // 获取或创建该朝代的皇帝缓存实例
    let emperorInstanceName = GlobalCacheInstances.EmperorCacheMap.get(dynastyName);
    if (!emperorInstanceName) {
      emperorInstanceName = StaticCacheManager.createInstanceName<Emperor[]>(`Emperors_${dynastyName}`);
      GlobalCacheInstances.EmperorCacheMap.set(dynastyName, emperorInstanceName);
    }

    if (isRefresh) {
      StaticCacheManager.clearCache(emperorInstanceName);
    }

    return await StaticCacheManager.createAsync<Emperor[]>(
      emperorInstanceName,
      async () => {
        console.log(`开始从服务器加载朝代 ${dynastyName} 的皇帝数据...`);
        const emperors = await dynastyServiceClient.getEmperorsByDynasty(dynastyName, true);
        console.log(`成功加载朝代 ${dynastyName} 的 ${emperors.length} 个皇帝:`, emperors.map((e: Emperor) => e.id));
        return emperors;
      },
      [], // 默认值为空数组
      600 // 10分钟过期
    );
  }

  /**
   * 获取指定皇帝的年号列表（使用缓存）
   * @param emperorId 皇帝ID
   * @param isRefresh 是否强制刷新缓存
   */
  public static async getErasByEmperor(emperorId: string, isRefresh: boolean = false): Promise<EraName[]> {
    if (!emperorId) return [];

    // 获取或创建该皇帝的年号缓存实例
    let eraInstanceName = GlobalCacheInstances.EraCacheMap.get(emperorId);
    if (!eraInstanceName) {
      eraInstanceName = StaticCacheManager.createInstanceName<EraName[]>(`Eras_${emperorId}`);
      GlobalCacheInstances.EraCacheMap.set(emperorId, eraInstanceName);
    }

    if (isRefresh) {
      StaticCacheManager.clearCache(eraInstanceName);
    }

    return await StaticCacheManager.createAsync<EraName[]>(
      eraInstanceName,
      async () => {
        console.log(`开始从服务器加载皇帝 ${emperorId} 的年号数据...`);
        const eras = await dynastyServiceClient.getErasByEmperor(emperorId);
        console.log(`成功加载皇帝 ${emperorId} 的 ${eras.length} 个年号:`, eras.map((e: EraName) => e.name));
        return eras;
      },
      [], // 默认值为空数组
      600 // 10分钟过期
    );
  }

  /**
   * 获取指定年号的详情（使用缓存）
   * @param dynastyName 朝代名称
   * @param eraName 年号名称
   * @param isRefresh 是否强制刷新缓存
   */
  public static async getEraDetail(dynastyName: string, eraName: string, isRefresh: boolean = false): Promise<EraName | null> {
    if (!dynastyName || !eraName) return null;

    const cacheKey = `${dynastyName}_${eraName}`;

    // 获取或创建该年号的详情缓存实例
    let eraDetailInstanceName = GlobalCacheInstances.EraDetailCacheMap.get(cacheKey);
    if (!eraDetailInstanceName) {
      eraDetailInstanceName = StaticCacheManager.createInstanceName<EraName | null>(`EraDetail_${cacheKey}`);
      GlobalCacheInstances.EraDetailCacheMap.set(cacheKey, eraDetailInstanceName);
    }

    if (isRefresh) {
      StaticCacheManager.clearCache(eraDetailInstanceName);
    }

    return await StaticCacheManager.createAsync<EraName | null>(
      eraDetailInstanceName,
      async () => {
        console.log(`开始从服务器加载年号 ${dynastyName}.${eraName} 的详情...`);
        const eraDetail = await dynastyServiceClient.getEraByName(dynastyName, eraName);
        if (eraDetail) {
          console.log(`成功加载年号 ${dynastyName}.${eraName} 的详情:`, {
            name: eraDetail.name,
            startDate: eraDetail.startDate,
            endDate: eraDetail.endDate,
            note: eraDetail.note
          });
          return eraDetail;
        } else {
          console.warn(`未找到年号 ${dynastyName}.${eraName} 的详情`);
          return null;
        }
      },
      null, // 默认值为null
      600 // 10分钟过期
    );
  }

  /**
   * 清除所有缓存
   */
  public static clearAllCache(): void {
    StaticCacheManager.clearAllCache();
    GlobalCacheInstances.EmperorCacheMap.clear();
    GlobalCacheInstances.EraCacheMap.clear();
    GlobalCacheInstances.EraDetailCacheMap.clear();
    console.log("已清除所有全局缓存");
  }

  /**
   * 清除指定朝代的相关缓存
   */
  public static clearDynastyCache(dynastyName: string): void {
    // 清除该朝代的皇帝缓存
    const emperorInstanceName = GlobalCacheInstances.EmperorCacheMap.get(dynastyName);
    if (emperorInstanceName) {
      StaticCacheManager.clearCache(emperorInstanceName);
    }

    // 清除该朝代的年号详情缓存
    for (const [cacheKey, instanceName] of GlobalCacheInstances.EraDetailCacheMap.entries()) {
      if (cacheKey.startsWith(`${dynastyName}_`)) {
        StaticCacheManager.clearCache(instanceName);
      }
    }

    console.log(`已清除朝代 ${dynastyName} 的相关缓存`);
  }

  /**
   * 清除指定皇帝的年号缓存
   */
  public static clearEmperorCache(emperorId: string): void {
    const eraInstanceName = GlobalCacheInstances.EraCacheMap.get(emperorId);
    if (eraInstanceName) {
      StaticCacheManager.clearCache(eraInstanceName);
      console.log(`已清除皇帝 ${emperorId} 的年号缓存`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  public static getCacheStats(): {
    total: number;
    active: number;
    expired: number;
    dynastyCount: number;
    emperorCount: number;
    eraDetailCount: number;
  } {
    const basicStats = StaticCacheManager.getCacheStats();

    return {
      ...basicStats,
      dynastyCount: 1, // 固定为1，只有AllDynasties
      emperorCount: GlobalCacheInstances.EmperorCacheMap.size,
      eraDetailCount: GlobalCacheInstances.EraDetailCacheMap.size
    };
  }
} 