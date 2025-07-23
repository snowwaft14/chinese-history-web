# 地图类型定义说明

本目录用于统一管理项目中所有地图相关的数据类型和接口，便于前后端、不同地图实现间的解耦和复用。

## 目录结构

```
map/
  ├── map-data.ts        # 地图展示数据结构、常量、回调类型
  ├── map-interface.ts   # 地图操作相关接口、参数、工厂等
  └── index.ts           # 类型统一导出入口
```

## 各文件职责

- **map-data.ts**
  - 只定义地图上展示的数据结构（如 Position、Bounds、MarkerInfo、ClusterStyle、ClusterOptions、MapInitOptions 等）、常量（如 XI_AN_CENTER）、回调类型（如 MapClickCallback、MarkerClickCallback）。
  - 不包含任何地图操作相关接口。

- **map-interface.ts**
  - 只定义与地图操作相关的接口、参数、工厂、管理器等（如 IMapUtils、IMapFactory、ILayerManager、IClusterManager 等）。
  - 所有数据结构类型均从 map-data.ts 导入。

- **index.ts**
  - 统一导出 map-data.ts 和 map-interface.ts 的所有类型和常量，方便外部模块按需引入。

## 如何导入类型

建议统一通过 `@/types/map` 入口导入地图相关类型，例如：

```ts
import type {
  Position,
  MarkerInfo,
  ClusterOptions,
  IMapUtils,
  IMapFactory
} from '@/types/map';

import { XI_AN_CENTER } from '@/types/map';
```

## 示例：定义地图工具类

```ts
import type { IMapUtils, Position, MapInitOptions } from '@/types/map';

class MyMapUtils implements IMapUtils {
  async initializeMap(container: string | HTMLElement, options: MapInitOptions): Promise<void> {
    // ...
  }
  // ... 其它方法实现
}
```

## 维护建议

- 所有地图数据结构、常量、回调类型请统一维护在 map-data.ts。
- 所有地图操作相关接口、参数请统一维护在 map-interface.ts。
- 新增类型后请及时在 index.ts 导出。
- 禁止在其它文件重复定义地图相关类型。

如有疑问请联系地图类型维护人。