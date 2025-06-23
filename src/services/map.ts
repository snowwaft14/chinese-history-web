import type { BaiduMapOptions, BaiduMapPoint, BaiduMapInstance } from '@/models/map'

export class MapService {
  private map: BaiduMapInstance | null = null
  private container: string | HTMLElement
  
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
}

// 西安的经纬度坐标
export const XI_AN_CENTER: BaiduMapPoint = {
  lng: 108.948024,
  lat: 34.263161
} 