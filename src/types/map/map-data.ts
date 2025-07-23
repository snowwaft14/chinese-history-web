/**
 * 地图展示数据类型定义和常量
 */

// 位置坐标
export interface Position {
  lng: number;
  lat: number;
}

// 地图边界
export interface Bounds {
  southwest: Position;
  northeast: Position;
}

// 标记信息
export interface MarkerInfo {
  id: string;
  position: Position;
  title: string;
  content: string;
  type: string;
  data?: any;
}

// 聚合样式
export interface ClusterStyle {
  url: string;
  size?: [number, number];
  anchor?: [number, number];
  textColor?: string;
  textSize?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

// 聚合选项
export interface ClusterOptions {
  gridSize?: number;
  maxZoom?: number;
  minClusterSize?: number;
  minimumClusterSize?: number;
  zoomOnClick?: boolean;
  averageCenter?: boolean;
  styles?: ClusterStyle[];
  renderClusterMarker?: (context: any) => void;
  renderMarker?: (context: any) => void;
}

// 地图点击回调
export type MapClickCallback = (e: { lnglat: { lng: number; lat: number } }) => void;

// 标记点击回调
export type MarkerClickCallback = (info: MarkerInfo) => void;

// 地图初始化选项
export interface MapInitOptions {
  center: Position;
  zoom?: number;
  viewMode?: '2D' | '3D';
  resizeEnable?: boolean;
  rotateEnable?: boolean;
  pitchEnable?: boolean;
  zoomEnable?: boolean;
  dragEnable?: boolean;
  enableScrollWheelZoom?: boolean;
  mapStyle?: string;
  features?: string[];
  preloadMode?: boolean;
  optimizeRender?: boolean;
}

// 西安中心点坐标
export const XI_AN_CENTER: Position = { lng: 108.9398, lat: 34.3412 };