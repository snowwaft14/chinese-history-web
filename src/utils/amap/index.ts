// 简化的图层管理器导出
export { LayerManagerBase } from './LayerManagerBase';
export { CityLayerManager } from './CityLayerManager';
export { EventLayerManager } from './EventLayerManager';
export { WarLayerManager } from './WarLayerManager';
export { DisasterLayerManager } from './DisasterLayerManager';
export { TerritoryLayerManager } from './TerritoryLayerManager';
export { RouteLayerManager } from './RouteLayerManager';

// 图层管理器工厂
import { LayerType } from '@/connects/layer_pb';
import type { ILayerManager } from '@/types/map/map-interface';
import { CityLayerManager } from './CityLayerManager';
import { EventLayerManager } from './EventLayerManager';
import { WarLayerManager } from './WarLayerManager';
import { DisasterLayerManager } from './DisasterLayerManager';
import { TerritoryLayerManager } from './TerritoryLayerManager';
import { RouteLayerManager } from './RouteLayerManager';

/**
 * 图层管理器工厂 - 简化版本
 */
export class LayerManagerFactory {
  /**
   * 创建图层管理器
   */
  static createLayerManager(map: AMap.Map, layerType: LayerType): ILayerManager {
    switch (layerType) {
      case LayerType.CITY:
        return new CityLayerManager(map);
      case LayerType.EVENT:
        return new EventLayerManager(map);
      case LayerType.WAR:
        return new WarLayerManager(map);
      case LayerType.DISASTER:
        return new DisasterLayerManager(map);
      case LayerType.TERRITORY:
        return new TerritoryLayerManager(map);
      case LayerType.ROUTE:
        return new RouteLayerManager(map);
      default:
        throw new Error(`不支持的图层类型: ${layerType}`);
    }
  }

  /**
   * 获取支持的图层类型
   */
  static getSupportedLayerTypes(): LayerType[] {
    return [
      LayerType.CITY,
      LayerType.EVENT,
      LayerType.WAR,
      LayerType.DISASTER,
      LayerType.TERRITORY,
      LayerType.ROUTE
    ];
  }
}