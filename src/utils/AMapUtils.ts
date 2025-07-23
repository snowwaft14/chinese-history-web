import type { LayerItem } from "@/connects/layer_pb";
import { LayerType } from "@/connects/layer_pb";
import AMapLoader from "@amap/amap-jsapi-loader";
import { LayerManagerBase } from "./amap/LayerManagerBase";
import { CityLayerManager } from "./amap/CityLayerManager";
import { EventLayerManager } from "./amap/EventLayerManager";
import { WarLayerManager } from "./amap/WarLayerManager";
import { DisasterLayerManager } from "./amap/DisasterLayerManager";
import { TerritoryLayerManager } from "./amap/TerritoryLayerManager";
import { RouteLayerManager } from "./amap/RouteLayerManager";
import type { ILayerManager } from "@/types/map";

// 扩展 window 对象以包含高德地图 API
declare global {
  interface Window {
    AMap: typeof AMap;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

/**
 * 高德地图适配器类 - 大大简化版本
 */
export class AmapAdapter {
  private map: AMap.Map | null = null;
  private layerManagers: Map<LayerType, ILayerManager> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    console.log("AmapAdapter 初始化");
  }

  /**
   * 初始化地图
   */
  async initializeMap(container: string | HTMLElement, options: any): Promise<void> {
    if (this.isInitialized && this.map) {
      return Promise.resolve();
    }

    try {
      console.log("开始初始化高德地图...");

      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: "5bd7e782ac0911bebeee4aaf62c6d6d5",
      };

      // 加载高德地图API
      const AMap = await AMapLoader.load({
        key: "902c38fea20962ec97f20078c9578725",
        version: "2.0",
        plugins: [
          "AMap.MarkerClusterer",
          "AMap.InfoWindow",
        ],
      });

      // 验证容器
      const containerElement =
        typeof container === "string"
          ? document.getElementById(container) || document.querySelector(container)
          : container;

      if (!containerElement) {
        throw new Error(`地图容器不存在: ${container}`);
      }

      // 创建地图实例
      this.map = new AMap.Map(containerElement, {
        viewMode: "2D",
        zoom: options.zoom || 6,
        center: new AMap.LngLat(options.center.lng, options.center.lat),
        resizeEnable: true,
        scrollWheel: true,
        doubleClickZoom: true,
      }) as AMap.Map;

      this.isInitialized = true;
      console.log("高德地图初始化成功");
    } catch (error) {
      this.isInitialized = false;
      throw new Error(`高德地图初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取地图实例
   */
  getMap(): AMap.Map | null {
    return this.map;
  }

  /**
   * 检查地图是否准备就绪
   */
  isMapReady(): boolean {
    return this.isInitialized && this.map !== null;
  }

  /**
   * 渲染图层
   */
  renderLayers(layers: LayerItem[]): void {
    if (!this.isMapReady()) {
      console.warn("地图未准备就绪，无法渲染图层");
      return;
    }

    console.log(`开始渲染图层，共 ${layers.length} 个图层`);

    // 清除之前的图层
    this.clearLayers();

    // 按图层类型分组
    const layersByType = this.groupLayersByType(layers);
    console.log(`图层分组完成，共 ${layersByType.size} 种类型`);

    // 渲染各类型图层
    layersByType.forEach((layersOfType, layerType) => {
      this.addLayer(layersOfType, layerType);
    });

    console.log("图层渲染完成");
  }

  /**
   * 添加图层
   */
  private addLayer(layerData: LayerItem[], layerType: LayerType): void {
    if (!layerData || layerData.length === 0) {
      console.warn(`图层数据为空: ${layerType}`);
      return;
    }

    try {
      // 获取或创建图层管理器
      let layerManager = this.layerManagers.get(layerType);
      if (!layerManager) {
        layerManager = this.createLayerManager(layerType);
        this.layerManagers.set(layerType, layerManager);
      }

      // 渲染图层
      layerManager.render(layerData);
      console.log(`图层 ${layerType} 添加完成，数据量: ${layerData.length}`);
    } catch (error) {
      console.error(`添加图层失败 ${layerType}:`, error);
    }
  }

  /**
   * 清除所有图层
   */
  private clearLayers(): void {
    this.layerManagers.forEach((manager, layerType) => {
      try {
        manager.clear();
      } catch (error) {
        console.error(`清除图层失败 ${layerType}:`, error);
      }
    });
    this.layerManagers.clear();
  }

  /**
   * 按图层类型分组
   */
  private groupLayersByType(layers: LayerItem[]): Map<LayerType, LayerItem[]> {
    const grouped = new Map<LayerType, LayerItem[]>();

    layers.forEach((layer) => {
      if (!grouped.has(layer.type)) {
        grouped.set(layer.type, []);
      }
      grouped.get(layer.type)!.push(layer);
    });

    return grouped;
  }

  /**
   * 创建图层管理器
   */
  private createLayerManager(layerType: LayerType): ILayerManager {
    if (!this.map) {
      throw new Error("地图实例未初始化");
    }

    switch (layerType) {
      case LayerType.CITY:
        return new CityLayerManager(this.map);
      case LayerType.EVENT:
        return new EventLayerManager(this.map);
      case LayerType.WAR:
        return new WarLayerManager(this.map);
      case LayerType.DISASTER:
        return new DisasterLayerManager(this.map);
      case LayerType.TERRITORY:
        return new TerritoryLayerManager(this.map);
      case LayerType.ROUTE:
        return new RouteLayerManager(this.map);
      default:
        throw new Error(`不支持的图层类型: ${layerType}`);
    }
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    try {
      this.clearLayers();
      if (this.map) {
        this.map.destroy();
        this.map = null;
      }
      this.isInitialized = false;
      console.log("高德地图已销毁");
    } catch (error) {
      console.error("销毁地图时发生错误:", error);
    }
  }
}