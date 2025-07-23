import type { LayerItem } from '@/connects/layer_pb';
import { LayerType } from '@/connects/layer_pb';
import type { ILayerManager } from '@/types/map/map-interface';

/**
 * 路线图层管理器 - 简化版本
 * 处理线条数据，不使用聚合
 */
export class RouteLayerManager implements ILayerManager {
  protected map: AMap.Map;
  protected layerType: LayerType = LayerType.ROUTE;
  protected polylines: any[] = [];

  constructor(map: AMap.Map) {
    this.map = map;
  }

  /**
   * 渲染路线图层数据
   */
  render(data: LayerItem[]): void {
    // 清除之前的线条
    this.clear();

    if (!data || data.length === 0) {
      console.log('路线图层没有数据需要渲染');
      return;
    }

    try {
      data.forEach((layer) => {
        const geometry = this.parseGeometry(layer.geometryJson);
        if (!geometry || geometry.type !== 'LineString') {
          return;
        }

        this.renderPolyline(layer, geometry);
      });

      console.log(`路线图层渲染完成，共 ${this.polylines.length} 条路线`);
    } catch (error) {
      console.error('路线图层渲染失败:', error);
    }
  }

  /**
   * 清除图层
   */
  clear(): void {
    if (this.polylines.length > 0) {
      try {
        this.polylines.forEach(polyline => {
          this.map.remove(polyline);
        });
        this.polylines = [];
        console.log('路线图层已清除');
      } catch (error) {
        console.error('路线图层清除失败:', error);
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
   * 渲染单条路线
   */
  private renderPolyline(layer: LayerItem, geometry: any): void {
    try {
      // 转换坐标格式
      const path = geometry.coordinates.map((coord: number[]) => [coord[0], coord[1]]);

      // 创建折线
      const polyline = new (window as any).AMap.Polyline({
        path: path,
        strokeColor: '#52c41a',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });

      // 添加到地图
      this.map.add(polyline);
      this.polylines.push(polyline);

      // 添加点击事件
      polyline.on('click', (e: any) => {
        this.handlePolylineClick(layer, e);
      });

    } catch (error) {
      console.error('渲染路线失败:', error);
    }
  }

  /**
   * 处理路线点击事件
   */
  private handlePolylineClick(layer: LayerItem, e: any): void {
    try {
      // 创建信息窗口内容
      const content = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${layer.name || '路线'}</h3>
          <p class="text-gray-600 mb-2">历史路线</p>
          <div class="text-sm text-gray-500">
            <div>类型: 路线</div>
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
      console.error('处理路线点击事件失败:', error);
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