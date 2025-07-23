import type { LayerItem } from "@/connects/layer_pb";
import { LayerType } from "@/connects/layer_pb";
import type { ILayerManager } from "@/types/map/map-interface";
import type { MarkerClusterContext, MarkerContext } from "./amap";

/**
 * 图层管理器基类 - 大幅简化版本
 */
export abstract class LayerManagerBase implements ILayerManager {
  protected map: AMap.Map;
  protected layerType: LayerType;
  protected cluster: AMap.MarkerClusterer | null = null;

  constructor(map: AMap.Map, layerType: LayerType) {
    this.map = map;
    this.layerType = layerType;
  }

  /**
   * 创建单个标记的抽象方法，由子类实现
   */
  abstract createMarker(context: MarkerContext): void;

  /**
   * 创建聚合标记的抽象方法，由子类实现
   */
  abstract createClusterMarker(context: MarkerClusterContext): void;

  /**
   * 渲染图层数据
   */
  render(data: LayerItem[]): void {
    // 清除之前的聚合器
    this.clear();

    if (!data || data.length === 0) {
      console.log(`${this.layerType} 图层没有数据需要渲染`);
      return;
    }

    try {
      // 解析数据为标记点
      const markers = data
        .map((layer) => {
          const geometry = this.parseGeometry(layer.geometryJson);
          if (!geometry || geometry.type !== "Point") {
            return null;
          }

          return {
            lnglat: geometry.coordinates,
            extData: layer,
          };
        })
        .filter(Boolean);

      if (markers.length === 0) {
        console.log(`${this.layerType} 图层没有有效的点数据`);
        return;
      }

      // 创建聚合器
      this.cluster = new (window as any).AMap.MarkerClusterer(this.map, markers, {
        renderClusterMarker: this.createClusterMarker.bind(this),
        renderMarker: this.createMarker.bind(this),
        gridSize: 60,
        maxZoom: 15,
      });

      console.log(`${this.layerType} 图层渲染完成，共 ${markers.length} 个标记`);
    } catch (error) {
      console.error(`${this.layerType} 图层渲染失败:`, error);
    }
  }

  /**
   * 清除图层
   */
  clear(): void {
    if (this.cluster) {
      try {
        this.cluster.setMarkers([]);
        this.cluster.setMap(null);
        this.cluster = null;
        console.log(`${this.layerType} 图层已清除`);
      } catch (error) {
        console.error(`${this.layerType} 图层清除失败:`, error);
      }
    }
  }

  /**
   * 获取图层类型
   */
  getLayerType(): LayerType {
    return this.layerType;
  }

  /**
   * 解析几何数据
   */
  protected parseGeometry(geometryJson: string): any {
    try {
      return JSON.parse(geometryJson);
    } catch (error) {
      console.warn("解析几何数据失败:", error);
      return null;
    }
  }

  /**
   * 创建标记点击事件处理器
   */
  protected createMarkerClickHandler(layer: LayerItem): (e: any) => void {
    return (e: any) => {
      try {
        // 创建信息窗口内容
        const content = this.createInfoWindowContent(layer);

        // 打开信息窗口
        const infoWindow = new (window as any).AMap.InfoWindow({
          content: content,
          anchor: "bottom-center",
          offset: new (window as any).AMap.Pixel(0, -10),
        });

        infoWindow.open(this.map, e.target.getPosition());
      } catch (error) {
        console.error("处理标记点击事件失败:", error);
      }
    };
  }

  /**
   * 创建信息窗口内容 - 可被子类重写
   */
  protected createInfoWindowContent(layer: LayerItem): string {
    return `
      <div class="p-3 min-w-[200px]">
        <h3 class="font-bold text-lg mb-2">${layer.name}</h3>
        <p class="text-gray-600 mb-2">${layer.content}</p>
        <div class="text-sm text-gray-500">
          <div>类型: ${this.getLayerTypeName()}</div>
          ${layer.timeRange ? `<div>时间: ${layer.timeRange}</div>` : ""}
        </div>
      </div>
    `;
  }

  /**
   * 获取图层类型名称
   */
  protected getLayerTypeName(): string {
    const typeNames: Record<LayerType, string> = {
      [LayerType.CITY]: "城池",
      [LayerType.EVENT]: "事件",
      [LayerType.WAR]: "战争",
      [LayerType.DISASTER]: "灾难",
      [LayerType.ROUTE]: "路线",
      [LayerType.TERRITORY]: "疆域",
      [LayerType.DEFAULT]: "默认",
    };
    return typeNames[this.layerType] || "未知";
  }
}
