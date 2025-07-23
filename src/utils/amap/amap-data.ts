// 这个文件可以删除，因为类型定义应该统一从 @/types/index.ts 导入
// 只保留高德地图特定的配置常量
import { LayerType } from '@/connects/layer_pb';
import type { Position, ClusterStyle } from '@/types/map';
import type {
  IconConfig,
  LineStyle,
  PolygonStyle
} from './amap';

// Re-export data types from amap.d.ts
export type { 
  LayerData, 
  CityData, 
  EventData, 
  WarData, 
  DisasterData, 
  RouteData, 
  TerritoryData 
} from './amap';

// 高德地图图层图标配置
export const AMAP_LAYER_ICONS: Record<LayerType, IconConfig> = {
  [LayerType.DEFAULT]: {
    url: "/icons/default.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.CITY]: {
    url: "/icons/city.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.EVENT]: {
    url: "/icons/event.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.WAR]: {
    url: "/icons/war.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.DISASTER]: {
    url: "/icons/disaster.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.TERRITORY]: {
    url: "/icons/territory.svg",
    size: [32, 32],
    anchor: [16, 32]
  },
  [LayerType.ROUTE]: {
    url: "/icons/route.svg",
    size: [32, 32],
    anchor: [16, 32]
  }
};

// 高德地图图层样式配置
export const AMAP_LAYER_STYLES = {
  [LayerType.CITY]: {
    label: {
      color: "#333",
      backgroundColor: "#FFE4B5",
      border: "1px solid #B8860B",
      borderRadius: "3px",
      padding: "2px 5px",
      fontSize: "12px",
      fontWeight: "bold"
    }
  },
  [LayerType.EVENT]: {
    label: {
      color: "#fff",
      backgroundColor: "#DC143C",
      border: "1px solid #8B0000",
      borderRadius: "3px",
      padding: "2px 5px",
      fontSize: "12px",
      fontWeight: "bold"
    }
  },
  [LayerType.WAR]: {
    label: {
      color: "#fff",
      backgroundColor: "#8B0000",
      border: "1px solid #B22222",
      borderRadius: "3px",
      padding: "2px 5px",
      fontSize: "12px",
      fontWeight: "bold"
    }
  },
  [LayerType.DISASTER]: {
    label: {
      color: "#333",
      backgroundColor: "#FFD700",
      border: "1px solid #DAA520",
      borderRadius: "3px",
      padding: "2px 5px",
      fontSize: "12px",
      fontWeight: "bold"
    }
  },
  [LayerType.ROUTE]: {
    line: {
      strokeColor: "#FF6B35",
      strokeWeight: 4,
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    } as LineStyle
  },
  [LayerType.TERRITORY]: {
    polygon: {
      strokeColor: "#2E86AB",
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: "#A23B72",
      fillOpacity: 0.3,
      strokeStyle: 'solid'
    } as PolygonStyle
  }
};

// 高德地图聚合样式配置
export const AMAP_CLUSTER_STYLES: Record<LayerType, ClusterStyle[]> = {
  [LayerType.CITY]: [
    {
      url: "/icons/cluster-city-small.svg",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#fff",
      textSize: 12,
      backgroundColor: "#FFE4B5",
      borderColor: "#B8860B",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-city-medium.svg",
      size: [50, 50],
      anchor: [25, 25],
      textColor: "#fff",
      textSize: 14,
      backgroundColor: "#DEB887",
      borderColor: "#8B7355",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-city-large.svg",
      size: [60, 60],
      anchor: [30, 30],
      textColor: "#fff",
      textSize: 16,
      backgroundColor: "#CD853F",
      borderColor: "#8B5A2B",
      borderWidth: 2
    }
  ],
  [LayerType.EVENT]: [
    {
      url: "/icons/cluster-event-small.svg",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#fff",
      textSize: 12,
      backgroundColor: "#DC143C",
      borderColor: "#8B0000",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-event-medium.svg",
      size: [50, 50],
      anchor: [25, 25],
      textColor: "#fff",
      textSize: 14,
      backgroundColor: "#B22222",
      borderColor: "#8B0000",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-event-large.svg",
      size: [60, 60],
      anchor: [30, 30],
      textColor: "#fff",
      textSize: 16,
      backgroundColor: "#8B0000",
      borderColor: "#654321",
      borderWidth: 2
    }
  ],
  [LayerType.WAR]: [
    {
      url: "/icons/cluster-war-small.svg",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#fff",
      textSize: 12,
      backgroundColor: "#8B0000",
      borderColor: "#B22222",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-war-medium.svg",
      size: [50, 50],
      anchor: [25, 25],
      textColor: "#fff",
      textSize: 14,
      backgroundColor: "#A0522D",
      borderColor: "#8B4513",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-war-large.svg",
      size: [60, 60],
      anchor: [30, 30],
      textColor: "#fff",
      textSize: 16,
      backgroundColor: "#8B4513",
      borderColor: "#654321",
      borderWidth: 2
    }
  ],
  [LayerType.DISASTER]: [
    {
      url: "/icons/cluster-disaster-small.svg",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#333",
      textSize: 12,
      backgroundColor: "#FFD700",
      borderColor: "#DAA520",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-disaster-medium.svg",
      size: [50, 50],
      anchor: [25, 25],
      textColor: "#333",
      textSize: 14,
      backgroundColor: "#DAA520",
      borderColor: "#B8860B",
      borderWidth: 2
    },
    {
      url: "/icons/cluster-disaster-large.svg",
      size: [60, 60],
      anchor: [30, 30],
      textColor: "#333",
      textSize: 16,
      backgroundColor: "#B8860B",
      borderColor: "#8B6914",
      borderWidth: 2
    }
  ],
  [LayerType.DEFAULT]: [
    {
      url: "/icons/cluster-default-small.svg",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#fff",
      textSize: 12,
      backgroundColor: "#666",
      borderColor: "#333",
      borderWidth: 2
    }
  ],
  [LayerType.ROUTE]: [], // 路线图层不使用聚合
  [LayerType.TERRITORY]: [] // 疆域图层不使用聚合
};

// 高德地图默认配置
export const AMAP_DEFAULT_CONFIG = {
  version: "2.0",
  plugins: [
    "AMap.Scale",
    "AMap.ToolBar", 
    "AMap.ControlBar",
    "AMap.MarkerCluster",
    "AMap.Geocoder",
    "AMap.InfoWindow"
  ],
  defaultCenter: { lng: 108.9398, lat: 34.3412 } as Position, // 西安
  defaultZoom: 6,
  minZoom: 3,
  maxZoom: 18,
  mapStyle: "amap://styles/normal", // 标准样式
  viewMode: "3D" as const,
  features: ["bg", "road", "building", "point"],
  resizeEnable: true,
  rotateEnable: true,
  pitchEnable: true,
  zoomEnable: true,
  dragEnable: true
};

// 高德地图聚合默认配置
export const AMAP_CLUSTER_DEFAULT_OPTIONS = {
  gridSize: 60,
  maxZoom: 15,
  minimumClusterSize: 2,
  zoomOnClick: true,
  averageCenter: true
};

// GeoJSON Feature 转换接口
export interface AmapGeoJSONFeature {
  type: "Feature";
  properties: {
    layerId: string;
    layerName: string;
    layerType: LayerType;
    startDate: string;
    endDate: string;
    tags: string[];
    originalLayer: any;
    icon?: IconConfig;
    style?: any;
  };
  geometry: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: number[] | number[][] | number[][][];
  };
}

// 高德地图图层类型名称映射
export const AMAP_LAYER_TYPE_NAMES: Record<LayerType, string> = {
  [LayerType.DEFAULT]: "默认",
  [LayerType.CITY]: "城池",
  [LayerType.EVENT]: "事件",
  [LayerType.WAR]: "战争",
  [LayerType.DISASTER]: "灾难",
  [LayerType.ROUTE]: "路线",
  [LayerType.TERRITORY]: "疆域"
};

// 高德地图聚合背景色配置
export const AMAP_CLUSTER_BACKGROUND_COLORS: Record<LayerType, string> = {
  [LayerType.CITY]: "#FFE4B5",
  [LayerType.EVENT]: "#DC143C",
  [LayerType.WAR]: "#8B0000",
  [LayerType.DISASTER]: "#FFD700",
  [LayerType.DEFAULT]: "#666",
  [LayerType.ROUTE]: "#FF6B35",
  [LayerType.TERRITORY]: "#2E86AB"
};

// 高德地图聚合边框色配置
export const AMAP_CLUSTER_BORDER_COLORS: Record<LayerType, string> = {
  [LayerType.CITY]: "#B8860B",
  [LayerType.EVENT]: "#8B0000",
  [LayerType.WAR]: "#B22222",
  [LayerType.DISASTER]: "#DAA520",
  [LayerType.DEFAULT]: "#333",
  [LayerType.ROUTE]: "#CC5429",
  [LayerType.TERRITORY]: "#1E5F7A"
};

// 高德地图错误类型
export enum AmapErrorType {
  INIT_FAILED = "INIT_FAILED",
  API_LOAD_FAILED = "API_LOAD_FAILED",
  RENDER_FAILED = "RENDER_FAILED",
  CLUSTER_FAILED = "CLUSTER_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  INVALID_PARAMS = "INVALID_PARAMS"
}

// 高德地图错误信息
export interface AmapError extends Error {
  type: AmapErrorType;
  code?: string;
  details?: any;
}