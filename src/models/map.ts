// 百度地图相关类型定义
export interface BaiduMapOptions {
  center: BaiduMapPoint;
  zoom: number;
  enableScrollWheelZoom?: boolean;
  enableDragging?: boolean;
}

export interface BaiduMapPoint {
  lng: number;
  lat: number;
}

export interface BaiduMapInstance {
  centerAndZoom: (center: any, zoom: number) => void;
  enableScrollWheelZoom: (enable: boolean) => void;
  enableDragging: () => void;
  disableDragging: () => void;
}

// 扩展 window 对象以包含百度地图 API
declare global {
  interface Window {
    BMap: {
      Map: new (container: string | HTMLElement) => BaiduMapInstance;
      Point: new (lng: number, lat: number) => any;
    };
  }
} 