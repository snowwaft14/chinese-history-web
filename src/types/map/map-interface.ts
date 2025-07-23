// 简化的地图接口定义
import type { LayerItem } from '@/connects/layer_pb';
import { LayerType } from '@/connects/layer_pb';

// 基础数据类型
export interface Position {
  lng: number;
  lat: number;
}

// 图层管理器接口 - 大大简化
export interface ILayerManager {
  render(data: LayerItem[]): void;
  clear(): void;
  getLayerType(): LayerType;
}

