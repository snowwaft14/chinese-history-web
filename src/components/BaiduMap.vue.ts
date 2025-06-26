import type { BaiduMapOptions, BaiduMapPoint, BaiduMapInstance, BaiduMapMarker, BaiduMapPolyline, BaiduMapPolygon, BaiduMapInfoWindow } from '@/models/map'
import { LayerType, type LayerItem } from '@/connects/layer_pb'

export class MapService {
  private map: BaiduMapInstance | null = null
  private container: string | HTMLElement
  private overlays: Map<string, any> = new Map() // 存储图层覆盖物
  
  constructor(container: string | HTMLElement) {
    this.container = container
  }

  // 初始化地图
  public initMap(options: BaiduMapOptions): Promise<BaiduMapInstance> {
    return new Promise((resolve, reject) => {
      // 检查百度地图API是否已加载
      if (typeof window.BMap === 'undefined') {
        reject(new Error('百度地图API未加载'))
        return
      }

      try {
        // 创建地图实例
        this.map = new window.BMap.Map(this.container)
        
        // 创建中心点
        const center = new window.BMap.Point(options.center.lng, options.center.lat)
        
        // 设置地图中心和缩放级别
        this.map.centerAndZoom(center, options.zoom)
        
        // 启用滚轮缩放
        if (options.enableScrollWheelZoom !== false) {
          this.map.enableScrollWheelZoom(true)
        }
        
        // 启用拖拽
        if (options.enableDragging !== false) {
          this.map.enableDragging()
        }
        
        resolve(this.map)
      } catch (error) {
        reject(error)
      }
    })
  }

  // 获取地图实例
  public getMap(): BaiduMapInstance | null {
    return this.map
  }

  // 设置地图中心点
  public setCenter(point: BaiduMapPoint): void {
    if (this.map) {
      const center = new window.BMap.Point(point.lng, point.lat)
      this.map.centerAndZoom(center, 12)
    }
  }

  // 渲染图层数据
  public renderLayers(layers: LayerItem[]): void {
    if (!this.map) return

    // 清除之前的图层
    this.clearLayers()

    layers.forEach(layer => {
      try {
        console.log(`开始渲染图层：${layer.type} - ${layer.name}:`)
        this.renderLayer(layer)
      } catch (error) {
        console.error(`渲染图层失败 ${layer.name}:`, error)
      }
    })
  }

  // 渲染单个图层
  private renderLayer(layer: LayerItem): void {
    if (!this.map) return

    const geoData = JSON.parse(layer.geometryJson)
    
    switch (layer.type) {
      case LayerType.CITY:
        this.renderCityLayer(layer, geoData)
        break
      case LayerType.EVENT:
        this.renderEventLayer(layer, geoData)
        break
      case LayerType.ROUTE:
        this.renderRouteLayer(layer, geoData)
        break
      case LayerType.TERRITORY:
        this.renderTerritoryLayer(layer, geoData)
        break
    }
  }

  // 渲染城池图层（点标注）
  private renderCityLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === 'Point') {
      const [lng, lat] = geoData.coordinates
      const point = new window.BMap.Point(lng, lat)
      const marker = new window.BMap.Marker(point)
      
      // 设置城池标签（不使用自定义图标，使用默认标记）
      const label = new window.BMap.Label(layer.name, { 
        offset: new window.BMap.Size(20, -10),
        position: point 
      })
      label.setStyle({
        color: '#333',
        backgroundColor: '#FFE4B5',
        border: '1px solid #B8860B',
        borderRadius: '3px',
        padding: '2px 5px',
        fontSize: '12px',
        fontWeight: 'bold'
      })
      
      // 添加点击事件
      marker.addEventListener('click', () => {
        this.showLayerInfo(layer, point)
      })
      
      this.map!.addOverlay(marker)
      this.map!.addOverlay(label)
      this.overlays.set(layer.id, { marker, label })
    }
  }

  // 渲染事件图层
  private renderEventLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === 'Point') {
      const [lng, lat] = geoData.coordinates
      const point = new window.BMap.Point(lng, lat)
      const marker = new window.BMap.Marker(point)
      
      // 设置事件标签（使用不同的样式区分事件和城池）
      const label = new window.BMap.Label(layer.name, { 
        offset: new window.BMap.Size(20, -10),
        position: point 
      })
      label.setStyle({
        color: '#fff',
        backgroundColor: '#DC143C',
        border: '1px solid #8B0000',
        borderRadius: '3px',
        padding: '2px 5px',
        fontSize: '12px',
        fontWeight: 'bold'
      })
      
      // 添加点击事件
      marker.addEventListener('click', () => {
        this.showLayerInfo(layer, point)
      })
      
      this.map!.addOverlay(marker)
      this.map!.addOverlay(label)
      this.overlays.set(layer.id, { marker, label })
    }
  }

  // 渲染路线图层
  private renderRouteLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === 'LineString') {
      const points = geoData.coordinates.map(([lng, lat]: [number, number]) => 
        new window.BMap.Point(lng, lat)
      )
      
      const polyline = new window.BMap.Polyline(points, {
        strokeColor: '#FF6B35',
        strokeWeight: 4,
        strokeOpacity: 0.8
      })
      
      // 添加点击事件
      polyline.addEventListener('click', (e: any) => {
        this.showLayerInfo(layer, e.point)
      })
      
      this.map!.addOverlay(polyline)
      this.overlays.set(layer.id, polyline)
    }
  }

  // 渲染疆域图层
  private renderTerritoryLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === 'Polygon') {
      const coordinates = geoData.coordinates[0] // 取第一个环
      const points = coordinates.map(([lng, lat]: [number, number]) => 
        new window.BMap.Point(lng, lat)
      )
      
      const polygon = new window.BMap.Polygon(points, {
        strokeColor: '#2E86AB',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#A23B72',
        fillOpacity: 0.3
      })
      
      // 添加点击事件
      polygon.addEventListener('click', (e: any) => {
        this.showLayerInfo(layer, e.point)
      })
      
      this.map!.addOverlay(polygon)
      this.overlays.set(layer.id, polygon)
    }
  }

  // 显示图层信息窗口
  private showLayerInfo(layer: LayerItem, point: any): void {
    const content = `
      <div class="layer-info-window">
        <h3>${layer.name}</h3>
        <p><strong>类型：</strong>${this.getLayerTypeName(layer.type)}</p>
        <p><strong>时间：</strong>${layer.startDate} - ${layer.endDate}</p>
        <p><strong>标签：</strong>${layer.tags.join(', ')}</p>
        <div class="mt-2">
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm" onclick="alert('查看详情功能待实现')">
            查看详情
          </button>
        </div>
      </div>
    `
    
    const infoWindow = new window.BMap.InfoWindow(content, {
      width: 250,
      height: 150
    })
    
    this.map!.openInfoWindow(infoWindow, point)
  }

  // 获取图层类型中文名称
  private getLayerTypeName(type: LayerType): string {
    const typeNames = {
      [LayerType.CITY]: '城池',
      [LayerType.EVENT]: '事件',
      [LayerType.ROUTE]: '路线',
      [LayerType.TERRITORY]: '疆域',
      [LayerType.UNKNOWN]: '未知'
    }
    return typeNames[type] || '未知'
  }

  // 清除所有图层
  public clearLayers(): void {
    if (!this.map) return
    
    this.overlays.forEach(overlay => {
      // 处理不同类型的覆盖物
      if (typeof overlay === 'object' && overlay.marker) {
        // 有marker和label的组合
        this.map!.removeOverlay(overlay.marker)
        if (overlay.label) {
          this.map!.removeOverlay(overlay.label)
        }
      } else {
        // 单个覆盖物（如线条、多边形）
        this.map!.removeOverlay(overlay)
      }
    })
    this.overlays.clear()
  }

  // 按类型显示/隐藏图层
  public toggleLayerType(layerType: LayerType, visible: boolean): void {
    // 这个方法需要重新获取数据并过滤，暂时简单实现
    console.log(`切换图层类型 ${layerType} 显示状态: ${visible}`)
  }
}

// 西安的经纬度坐标
export const XI_AN_CENTER: BaiduMapPoint = {
  lng: 108.948024,
  lat: 34.263161
} 