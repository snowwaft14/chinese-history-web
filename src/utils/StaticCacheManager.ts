/**
 * 缓存对象接口
 */
interface ICachedObject {
  name: string;
  lastUpdateTime: Date;
  expiredSeconds: number;
  getCachedObject(): Promise<any>;
}

/**
 * 缓存对象实现
 */
class CachedObject<T> implements ICachedObject {
  private _semaphore: Promise<void> = Promise.resolve();
  private _instance: T | null = null;

  public name: string;
  public lastUpdateTime: Date;
  public expiredSeconds: number;
  public initializeMethod: () => Promise<T>;

  constructor(name: string, initializeMethod: () => Promise<T>, expiredSeconds: number = 600) {
    this.name = name;
    this.initializeMethod = initializeMethod;
    this.expiredSeconds = expiredSeconds;
    this.lastUpdateTime = new Date(0); // 初始化为最小时间
  }

  async getCachedObject(): Promise<T> {
    // 检查对象是否存在且未过期
    const now = new Date();
    const elapsedSeconds = (now.getTime() - this.lastUpdateTime.getTime()) / 1000;
    
    if (this._instance !== null && elapsedSeconds < this.expiredSeconds) {
      return this._instance;
    }

    // 使用信号量确保只有一个请求在初始化
    // 关键修复：使用.then(...).catch(...)来避免Promise链被"污染"
    this._semaphore = this._semaphore.then(async () => {
      try {
        // 再次检查（双重检查锁定模式）
        const nowInner = new Date();
        const elapsedSecondsInner = (nowInner.getTime() - this.lastUpdateTime.getTime()) / 1000;
        
        if (this._instance === null || elapsedSecondsInner >= this.expiredSeconds) {
          console.log(`正在初始化缓存对象: ${this.name}`);
          this._instance = await this.initializeMethod();
          this.lastUpdateTime = new Date();
          console.log(`缓存对象初始化完成: ${this.name}`);
        }
      } catch (error) {
        console.error(`初始化缓存对象失败: ${this.name}`, error);
        // 重要：不要抛出错误，让Promise链继续可用
        // throw error;
      }
    }).catch(() => {
      // 捕获并忽略之前失败的Promise，重置信号量状态
      // 这样下次调用时Promise链就不会被之前的错误状态影响
    });
    
    await this._semaphore;
    
    // 检查初始化是否成功
    if (this._instance === null) {
      // 如果实例仍然为null，说明初始化失败，抛出新的错误
      throw new Error(`缓存对象 ${this.name} 初始化失败，请检查网络连接`);
    }
    
    return this._instance;
  }
}

/**
 * 静态实例名称类
 */
export class StaticInstanceName<T = any> {
  public instanceName: string;
  public instanceId: string;

  constructor(instanceName: string, instanceId?: string) {
    this.instanceName = instanceName;
    this.instanceId = instanceId || this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

  toString(): string {
    return this.instanceName;
  }
}

/**
 * 静态缓存管理器
 */
export class StaticCacheManager {
  private static _cache = new Map<string, ICachedObject>();
  private static _instanceNames = new Set<StaticInstanceName>();

  /**
   * 创建静态实例名称
   */
  static createInstanceName<T>(name: string): StaticInstanceName<T> {
    const instanceName = new StaticInstanceName<T>(name);
    this._instanceNames.add(instanceName);
    return instanceName;
  }

  /**
   * 异步创建或获取缓存对象
   */
  static async createAsync<T>(
    instanceName: StaticInstanceName<T>,
    initializeMethod: () => Promise<T>,
    defaultInstance?: T,
    expiredSeconds: number = 600 // 默认10分钟
  ): Promise<T> {
    const cachedName = `${instanceName.instanceName}_${instanceName.instanceId}`;
    
    let cachedObject = this._cache.get(cachedName) as CachedObject<T>;
    if (!cachedObject) {
      cachedObject = new CachedObject<T>(instanceName.instanceName, initializeMethod, expiredSeconds);
      this._cache.set(cachedName, cachedObject);
    }

    try {
      const result = await cachedObject.getCachedObject();
      return result ?? (defaultInstance as T);
    } catch (error) {
      console.error(`获取缓存对象失败: ${instanceName.instanceName}`, error);
      if (defaultInstance !== undefined) {
        return defaultInstance as T;
      }
      throw error;
    }
  }

  /**
   * 同步创建或获取缓存对象（返回Promise）
   */
  static create<T>(
    instanceName: StaticInstanceName<T>,
    initializeMethod: () => T,
    defaultInstance?: T,
    expiredSeconds: number = 600
  ): Promise<T> {
    return this.createAsync(
      instanceName,
      async () => initializeMethod(),
      defaultInstance,
      expiredSeconds
    );
  }

  /**
   * 获取已存在的缓存对象
   */
  static async get<T>(
    instanceName: StaticInstanceName<T>,
    defaultInstance?: T
  ): Promise<T> {
    const cachedName = `${instanceName.instanceName}_${instanceName.instanceId}`;
    const cachedObject = this._cache.get(cachedName) as CachedObject<T>;
    
    if (cachedObject) {
      try {
        const result = await cachedObject.getCachedObject();
        return result ?? (defaultInstance as T);
      } catch (error) {
        console.error(`获取缓存对象失败: ${instanceName.instanceName}`, error);
        return defaultInstance as T;
      }
    } else {
      return defaultInstance!;
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(instanceName: StaticInstanceName, isDelete: boolean = false): boolean {
    const cachedName = `${instanceName.instanceName}_${instanceName.instanceId}`;
    
    if (isDelete) {
      return this._cache.delete(cachedName);
    } else {
      const cachedObject = this._cache.get(cachedName);
      if (cachedObject) {
        cachedObject.lastUpdateTime = new Date(0); // 设置为过期
        return true;
      }
      return false;
    }
  }

  /**
   * 获取所有实例名称
   */
  static get instanceNames(): StaticInstanceName[] {
    return Array.from(this._instanceNames);
  }

  /**
   * 清除所有缓存
   */
  static clearAllCache(): void {
    this._cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { total: number; active: number; expired: number } {
    const now = new Date();
    let active = 0;
    let expired = 0;

    for (const cachedObject of this._cache.values()) {
      const elapsedSeconds = (now.getTime() - cachedObject.lastUpdateTime.getTime()) / 1000;
      if (elapsedSeconds < cachedObject.expiredSeconds) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      total: this._cache.size,
      active,
      expired
    };
  }
}

// 导出便捷方法
export const createInstanceName = StaticCacheManager.createInstanceName;
export const createAsync = StaticCacheManager.createAsync;
export const create = StaticCacheManager.create;
export const get = StaticCacheManager.get;
export const clearCache = StaticCacheManager.clearCache; 