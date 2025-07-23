/**
 * 类型定义统一导出文件
 * 提供所有地图相关类型的统一入口
 */

// 基础数据类型和常量
export type {
  Position,
  Bounds,
  MarkerInfo,
  ClusterStyle,
  ClusterOptions,
  MapClickCallback,
  MarkerClickCallback,
  MapInitOptions
} from './map-data';

export { XI_AN_CENTER } from './map-data';

// 通用地图接口
export type {
  IMapUtils,
  ILayerManager,
  IClusterManager,
  IMapErrorHandler,
  IFallbackManager,
  IMapFactory,
  MapConfig,
  LayerConfig,
  MapState,
  MapEvents
} from './map-interface';