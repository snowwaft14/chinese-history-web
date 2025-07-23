# 简化的高德地图图层管理器

## 概述

这是一个大大简化的高德地图图层管理系统，使用高德地图的 `MarkerClusterer` 实现聚合功能。

## 架构

```
ILayerManager (接口)
├── LayerManagerBase (抽象基类) - 用于点图层
│   ├── CityLayerManager (城池)
│   ├── EventLayerManager (事件)
│   ├── WarLayerManager (战争)
│   └── DisasterLayerManager (灾难)
├── TerritoryLayerManager (疆域) - 直接实现接口
└── RouteLayerManager (路线) - 直接实现接口
```

## 使用方法

### 1. 创建图层管理器

```typescript
import { LayerManagerFactory } from '@/utils/amap';
import { LayerType } from '@/connects/layer_pb';

// 创建城池图层管理器
const cityManager = LayerManagerFactory.createLayerManager(map, LayerType.CITY);

// 渲染数据
cityManager.render(layerData);

// 清除图层
cityManager.clear();
```

### 2. 自定义图层管理器

继承 `LayerManagerBase` 并实现两个抽象方法：

```typescript
export class CustomLayerManager extends LayerManagerBase {
  constructor(map: AMap.Map) {
    super(map, LayerType.CUSTOM);
  }

  // 渲染单个标记
  createRenderMarker(): ({ marker }: { marker: AMap.Marker }) => void {
    return ({ marker }) => {
      // 自定义标记样式
      const icon = new AMap.Icon({
        image: 'your-icon-url',
        size: new AMap.Size(24, 24)
      });
      marker.setIcon(icon);
    };
  }

  // 渲染聚合标记
  createRenderClusterMarker(): ({ count, marker }: { count: number; marker: AMap.Marker }) => void {
    return ({ count, marker }) => {
      // 自定义聚合样式
      const icon = new AMap.Icon({
        image: 'your-cluster-icon-url',
        size: new AMap.Size(40, 40)
      });
      marker.setIcon(icon);
    };
  }
}
```

## 特点

1. **极简设计**: 只保留核心功能，删除复杂的错误处理和降级机制
2. **自动聚合**: 点图层自动使用高德地图的聚合功能
3. **类型安全**: 完整的 TypeScript 类型支持
4. **易于扩展**: 简单的继承结构，容易添加新的图层类型

## 数据格式

图层数据需要包含 `geometryJson` 字段，格式为 GeoJSON：

```typescript
interface LayerItem {
  id: string;
  geometryJson: string; // GeoJSON 格式的几何数据
  // 其他字段...
}
```

支持的几何类型：
- `Point`: 点图层（城池、事件、战争、灾难）
- `Polygon`: 面图层（疆域）
- `LineString`: 线图层（路线）

## 注意事项

1. 确保高德地图 API 已正确加载
2. 聚合功能需要高德地图支持 `MarkerClusterer`
3. 图标使用 SVG 格式，通过 base64 编码嵌入