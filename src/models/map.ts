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
  addOverlay: (overlay: any) => void;
  removeOverlay: (overlay: any) => void;
  clearOverlays: () => void;
  addEventListener: (event: string, handler: Function) => void;
  openInfoWindow: (infoWindow: any, point: any) => void;
  setMapStyleV2: (style: any) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
}

export interface BaiduMapMarker {
  setIcon: (icon: any) => void;
  setLabel: (label: any) => void;
  addEventListener: (event: string, handler: Function) => void;
}

export interface BaiduMapPolyline {
  setStrokeColor: (color: string) => void;
  setStrokeWeight: (weight: number) => void;
  setStrokeOpacity: (opacity: number) => void;
  addEventListener: (event: string, handler: Function) => void;
}

export interface BaiduMapPolygon {
  setStrokeColor: (color: string) => void;
  setStrokeWeight: (weight: number) => void;
  setStrokeOpacity: (opacity: number) => void;
  setFillColor: (color: string) => void;
  setFillOpacity: (opacity: number) => void;
  addEventListener: (event: string, handler: Function) => void;
}

export interface BaiduMapInfoWindow {
  setContent: (content: string) => void;
  enableMaximize: () => void;
  enableAutoPan: () => void;
}

// 扩展 window 对象以包含百度地图 API
declare global {
  interface Window {
    BMapGL: {
      Map: new (container: string | HTMLElement) => BaiduMapInstance;
      Point: new (lng: number, lat: number) => any;
      Marker: new (point: any, opts?: any) => BaiduMapMarker;
      Polyline: new (points: any[], opts?: any) => BaiduMapPolyline;
      Polygon: new (points: any[], opts?: any) => BaiduMapPolygon;
      InfoWindow: new (content: string, opts?: any) => BaiduMapInfoWindow;
      Icon: new (url: string, size: any) => any;
      Size: new (width: number, height: number) => any;
      Label: new (content: string, opts?: any) => any;
    };
  }
} 