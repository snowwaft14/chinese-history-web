// 高德地图类型定义文件
// 基于 @amap/amap-jsapi-types 扩展自定义类型

/// <reference types="@amap/amap-jsapi-types" />

import type {
  Position,
  Bounds,
  MapInitOptions,
  MarkerInfo,
  ClusterStyle,
  ClusterOptions
} from '../../types/map';
export type {
  Position,
  Bounds,
  MapInitOptions,
  MarkerInfo,
  ClusterStyle,
  ClusterOptions
};

import {LayerItem} from '../../connects/layer_pb'

// 高德地图聚合器接口
export interface AmapMarkerCluster {
  addMarkers(markers: AMap.Marker[]): void;
  removeMarkers(markers: AMap.Marker[]): void;
  clearMarkers(): void;
  getClusters(): any[];
  setMap(map: AMap.Map | null): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

// 事件回调类型
export type MapClickCallback = (event: { lnglat: any }) => void;
export type MarkerClickCallback = (marker: any) => void;
export type ClusterClickCallback = (cluster: any) => void;

// 图层数据基础接口
export interface LayerData {
  id: string;
  position: { lng: number; lat: number };
  title: string;
  content: string;
  type: string;
  timeRange?: string;
  tags?: string[];
  style?: any;
}

// 城池数据接口
export interface CityData extends LayerData {
  population?: number;
  importance: 'capital' | 'major' | 'minor';
  dynasty?: string;
}

// 事件数据接口
export interface EventData extends LayerData {
  eventType: 'political' | 'military' | 'cultural' | 'economic';
  participants?: string[];
  impact?: string;
}

// 战争数据接口
export interface WarData extends LayerData {
  warType: 'battle' | 'siege' | 'campaign';
  casualties?: number;
  outcome?: string;
  commanders?: string[];
}

// 灾难数据接口
export interface DisasterData extends LayerData {
  disasterType: 'flood' | 'drought' | 'earthquake' | 'plague';
  severity: 'minor' | 'major' | 'catastrophic';
  affectedArea?: string;
}

// 路线数据接口
export interface RouteData {
  id: string;
  path: { lng: number; lat: number }[];
  title: string;
  routeType: 'trade' | 'military' | 'migration';
  style?: any;
  description?: string;
}

// 疆域数据接口
export interface TerritoryData {
  id: string;
  boundary: { lng: number; lat: number }[];
  title: string;
  dynasty: string;
  period: string;
  style?: any;
  capital?: { lng: number; lat: number };
}

// 图标配置
export interface IconConfig {
  url: string;
  size: [number, number];
  anchor?: [number, number];
}

// 线条样式
export interface LineStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  strokeStyle?: 'solid' | 'dashed';
}

// 多边形样式
export interface PolygonStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeStyle?: 'solid' | 'dashed';
}

export interface MarkerContext {
  count: number;
  marker: AMap.Marker;
  data: ClusterContextData[];
  indexs?: number[];
}

export interface MarkerClusterContext {
  count: number;
  marker: AMap.Marker;
  clusterData: ClusterContextData[];
  indexs?: number[];
}

export interface ClusterContextData
{
  extData: LayerItem;
  lnglat: [number, number];
}

// 扩展 window 对象以包含高德地图 API
declare global {
  interface Window {
    AMap: typeof AMap;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

// Export AMap namespace for use in other modules
export { AMap };