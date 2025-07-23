import type { LayerItem } from '@/connects/layer_pb';
import { LayerType } from '@/connects/layer_pb';
import type { ILayerManager } from '@/types/map/map-interface';

/**
 * 疆域图层管理器 - 简化版本
 * 处理多边形数据，不使用聚合
 */
export class TerritoryLayerManager implements ILayerManager {
  protected map: AMap.Map;
  protected layerType: LayerType = LayerType.TERRITORY;
  protected polygons: any[] = [];

  constructor(map: AMap.Map) {
    this.map = map;
  }

  /**
   * 渲染疆域图层数据
   */
  render(data: LayerItem[]): void {
    // 清除之前的多边形
    this.clear();

    if (!data || data.length === 0) {
      console.log('疆域图层没有数据需要渲染');
      return;
    }

    try {
      data.forEach((layer) => {
        const geometry = this.parseGeometry(layer.geometryJson);
        if (!geometry || geometry.type !== 'Polygon') {
          return;
        }

        this.renderPolygon(layer, geometry);
      });

      console.log(`疆域图层渲染完成，共 ${this.polygons.length} 个多边形`);
    } catch (error) {
      console.error('疆域图层渲染失败:', error);
    }
  }

  /**
   * 清除图层
   */
  clear(): void {
    if (this.polygons.length > 0) {
      try {
        this.polygons.forEach(polygon => {
          this.map.remove(polygon);
        });
        this.polygons = [];
        console.log('疆域图层已清除');
      } catch (error) {
        console.error('疆域图层清除失败:', error);
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
   * 渲染单个多边形
   */
  private renderPolygon(layer: LayerItem, geometry: any): void {
    try {
      // 转换坐标格式
      const path = geometry.coordinates[0].map((coord: number[]) => [coord[0], coord[1]]);

      // 创建多边形
      const polygon = new (window as any).AMap.Polygon({
        path: path,
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#1890ff',
        fillOpacity: 0.2,
        strokeStyle: 'solid'
      });

      // 添加到地图
      this.map.add(polygon);
      this.polygons.push(polygon);

      // 添加点击事件
      polygon.on('click', (e: any) => {
        this.handlePolygonClick(layer, e);
      });

    } catch (error) {
      console.error('渲染疆域多边形失败:', error);
    }
  }

  /**
   * 处理多边形点击事件
   */
  private handlePolygonClick(layer: LayerItem, e: any): void {
    try {
      // 创建信息窗口内容
      const content = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${layer.title}</h3>
          <p class="text-gray-600 mb-2">${layer.content}</p>
          <div class="text-sm text-gray-500">
            <div>类型: 疆域</div>
            ${layer.timeRange ? `<div>时间: ${layer.timeRange}</div>` : ''}
          </div>
        </div>
      `;
      
      // 打开信息窗口
      const infoWindow = new (window as any).AMap.InfoWindow({
        content: content,
        anchor: 'bottom-center',
        offset: new (window as any).AMap.Pixel(0, -10)
      });
      
      infoWindow.open(this.map, e.lnglat);
    } catch (error) {
      console.error('处理疆域点击事件失败:', error);
    }
  }

  /**
   * 解析几何数据
   */
  private parseGeometry(geometryJson: string): any {
    try {
      return JSON.parse(geometryJson);
    } catch (error) {
      console.warn('解析几何数据失败:', error);
      return null;
    }
  }
}