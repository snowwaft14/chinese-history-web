import type {
  BaiduMapOptions,
  BaiduMapPoint,
  BaiduMapInstance,
} from "@/models/map";
import { LayerType, type LayerItem } from "@/connects/layer_pb";
import * as Cluster from '@bmapgl-plugin/cluster';

// 图标配置接口
interface LayerIconConfig {
  url: string;              // 图标URL
  size: [number, number];   // 图标大小 [宽, 高]
  anchor?: [number, number]; // 锚点位置 [x, y]
}

// 各类型图层的图标配置
const LAYER_ICONS: Record<LayerType, LayerIconConfig> = {
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

export class MapUtils {
  private map: BaiduMapInstance | null = null;
  private container: string | HTMLElement;
  private overlays: Map<string, any> = new Map(); // 存储图层覆盖物
  private clusterViews: Map<LayerType, Cluster.View> = new Map(); // 存储各类型的聚合视图
  private apiLoadCheckInterval: number | null = null; // API加载检查定时器

  constructor(container: string | HTMLElement) {
    this.container = container;
    // 将实例添加到全局对象，供信息窗口按钮调用
    (window as any).mapUtils = this;
  }

  // 等待百度地图API加载完成
  private waitForBaiduMapAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果API已经加载，直接返回
      if (this.isBaiduMapAPIReady()) {
        resolve();
        return;
      }

      console.log("等待百度地图API加载...");

      // 优先使用事件监听方式
      const handleBaiduMapReady = () => {
        if (this.isBaiduMapAPIReady()) {
          console.log("百度地图API通过事件监听加载完成");
          window.removeEventListener('baiduMapReady', handleBaiduMapReady);
          if (this.apiLoadCheckInterval) {
            clearInterval(this.apiLoadCheckInterval);
            this.apiLoadCheckInterval = null;
          }
          resolve();
        }
      };

      // 监听百度地图API加载完成事件
      window.addEventListener('baiduMapReady', handleBaiduMapReady);

      // 同时使用轮询作为备用方案
      let attempts = 0;
      const maxAttempts = 60; // 最多等待30秒（60 * 500ms）

      this.apiLoadCheckInterval = window.setInterval(() => {
        attempts++;

        if (this.isBaiduMapAPIReady()) {
          console.log("百度地图API通过轮询检测加载完成");
          window.removeEventListener('baiduMapReady', handleBaiduMapReady);
          if (this.apiLoadCheckInterval) {
            clearInterval(this.apiLoadCheckInterval);
            this.apiLoadCheckInterval = null;
          }
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error("百度地图API加载超时");
          window.removeEventListener('baiduMapReady', handleBaiduMapReady);
          if (this.apiLoadCheckInterval) {
            clearInterval(this.apiLoadCheckInterval);
            this.apiLoadCheckInterval = null;
          }
          reject(new Error("百度地图API加载超时，请检查网络连接或API密钥"));
        }
      }, 500);
    });
  }

  // 检查百度地图API是否完全准备就绪
  private isBaiduMapAPIReady(): boolean {
    try {
      // 检查基本的BMapGL对象
      if (typeof window.BMapGL === "undefined") {
        return false;
      }

      // 检查必要的构造函数是否存在
      const requiredClasses = ['Map', 'Point', 'Marker', 'Icon', 'Size', 'Label', 'InfoWindow', 'Polyline', 'Polygon'];
      for (const className of requiredClasses) {
        if (typeof (window.BMapGL as any)[className] === "undefined") {
          console.warn(`百度地图API类 ${className} 未加载`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("检查百度地图API状态时发生错误:", error);
      return false;
    }
  }

  // 初始化地图
  public async initMap(options: BaiduMapOptions): Promise<BaiduMapInstance> {
    try {
      // 检查百度地图API是否已加载，如果没有则简单等待
      if (typeof window.BMapGL === "undefined") {
        console.log("百度地图API尚未加载，等待加载完成...");
        // 简单等待，最多3秒
        let attempts = 0;
        const maxAttempts = 6; // 6 * 500ms = 3秒

        while (typeof window.BMapGL === "undefined" && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        if (typeof window.BMapGL === "undefined") {
          throw new Error("百度地图API加载失败，请检查网络连接或API密钥");
        }
      }

      // 创建地图实例
      this.map = new window.BMapGL.Map(this.container);

      // 创建中心点
      const center = new window.BMapGL.Point(options.center.lng, options.center.lat);

      // 设置地图中心和缩放级别
      this.map.centerAndZoom(center, options.zoom);

      // 设置地图样式（可选）
      try {
        this.map.setMapStyleV2({
          styleId: '82dbe3c84f659f887770cdc9904ad1ed'
        });
      } catch (styleError) {
        console.warn("设置地图样式失败，使用默认样式:", styleError);
      }

      // 启用滚轮缩放
      if (options.enableScrollWheelZoom !== false) {
        this.map.enableScrollWheelZoom(true);
      }

      // 启用拖拽
      if (options.enableDragging !== false) {
        this.map.enableDragging();
      }

      console.log("地图初始化成功");
      return this.map;
    } catch (error) {
      const errorMessage = `地图初始化失败: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // 获取地图实例
  public getMap(): BaiduMapInstance | null {
    return this.map;
  }

  // 设置地图中心点
  public setCenter(point: BaiduMapPoint): void {
    if (this.map) {
      const center = new window.BMapGL.Point(point.lng, point.lat);
      this.map.centerAndZoom(center, 12);
    }
  }

  // 渲染图层数据
  public renderLayers(layers: LayerItem[]): void {
    if (!this.map) return;

    console.log(`开始渲染图层，共 ${layers.length} 个图层`);

    // 清除之前的图层
    this.clearLayers();

    // 按图层类型分组
    const layersByType = this.groupLayersByType(layers);
    console.log(`图层分组完成，共 ${layersByType.size} 种类型`);

    // 处理点类型图层，使用聚合功能
    this.renderPointLayersWithClustering(layersByType);

    // 处理非点类型图层，直接渲染
    this.renderNonPointLayers(layersByType);

    console.log("图层渲染完成");
  }

  // 按图层类型分组
  private groupLayersByType(layers: LayerItem[]): Map<LayerType, LayerItem[]> {
    const grouped = new Map<LayerType, LayerItem[]>();

    layers.forEach(layer => {
      if (!grouped.has(layer.type)) {
        grouped.set(layer.type, []);
      }
      grouped.get(layer.type)!.push(layer);
    });

    return grouped;
  }

  // 渲染点类型图层，使用聚合功能
  private renderPointLayersWithClustering(layersByType: Map<LayerType, LayerItem[]>): void {
    const pointLayerTypes = [LayerType.CITY, LayerType.EVENT, LayerType.WAR, LayerType.DISASTER];

    pointLayerTypes.forEach(layerType => {
      const layersOfType = layersByType.get(layerType);
      if (layersOfType && layersOfType.length > 0) {
        try {
          console.log(`开始渲染点类型图层：${layerType}，共 ${layersOfType.length} 个图层`);
          this.renderPointLayerWithCluster(layerType, layersOfType);
        } catch (error) {
          console.error(`聚合渲染失败，降级到直接渲染 ${layerType}:`, error);
          // 降级处理：直接渲染标记
          this.fallbackToDirectMarkers(layersOfType);
        }
      }
    });
  }

  // 渲染非点类型图层
  private renderNonPointLayers(layersByType: Map<LayerType, LayerItem[]>): void {
    const nonPointLayerTypes = [LayerType.ROUTE, LayerType.TERRITORY];

    nonPointLayerTypes.forEach(layerType => {
      const layersOfType = layersByType.get(layerType);
      if (layersOfType && layersOfType.length > 0) {
        layersOfType.forEach(layer => {
          try {
            console.log(`开始渲染非点类型图层：${layer.type} - ${layer.name}`);
            this.renderLayer(layer);
          } catch (error) {
            console.error(`渲染图层失败 ${layer.name}:`, error);
          }
        });
      }
    });
  }

  // 为特定类型的点图层创建聚合渲染
  private renderPointLayerWithCluster(layerType: LayerType, layers: LayerItem[]): void {
    if (!this.map) return;

    // 首先检查是否支持聚合功能
    if (!this.isClusteringSupported()) {
      console.warn(`聚合功能不可用，降级到直接渲染标记 ${layerType}`);
      this.fallbackToDirectMarkers(layers);
      return;
    }

    try {
      // 创建或获取该类型的聚合视图
      if (!this.clusterViews.has(layerType)) {
        console.log(`为图层类型 ${layerType} 创建新的聚合视图`);
        const clusterView = this.createClusterView(layerType);
        this.clusterViews.set(layerType, clusterView);
      }

      const clusterView = this.clusterViews.get(layerType)!;

      // 转换为GeoJSON格式
      const geoJSONFeatures = this.convertToGeoJSONFeatures(layers);

      if (geoJSONFeatures.length > 0) {
        console.log(`为图层类型 ${layerType} 设置 ${geoJSONFeatures.length} 个GeoJSON特征`);

        // 设置聚合数据
        clusterView.setData(geoJSONFeatures);

        // 存储聚合视图以便后续清理
        this.overlays.set(`cluster_${layerType}`, clusterView);

        console.log(`图层类型 ${layerType} 聚合渲染完成`);
      } else {
        console.warn(`图层类型 ${layerType} 没有有效的点数据`);
      }
    } catch (error) {
      console.error(`创建聚合视图失败 ${layerType}:`, error);
      // 降级处理：直接渲染标记
      this.fallbackToDirectMarkers(layers);
    }
  }

  // 检查是否支持聚合功能
  private isClusteringSupported(): boolean {
    try {
      // 检查百度地图API是否完全加载
      if (!this.isBaiduMapAPIReady()) {
        console.warn("百度地图WebGL API未完全加载");
        return false;
      }

      // 检查聚合插件是否可用
      if (typeof Cluster === "undefined" || typeof Cluster.View === "undefined") {
        console.warn("聚合插件未加载或不可用");
        return false;
      }

      // 检查地图实例是否存在
      if (!this.map) {
        console.warn("地图实例未初始化");
        return false;
      }

      // 不再进行测试创建，因为这可能会触发错误
      // 如果所有基础检查都通过，则认为支持聚合功能
      console.log("聚合功能基础检查通过");
      return true;
    } catch (error) {
      console.error("检查聚合功能支持时发生错误:", error);
      return false;
    }
  }

  // 降级处理：当聚合失败时直接渲染标记
  private fallbackToDirectMarkers(layers: LayerItem[]): void {
    console.log(`执行降级处理，直接渲染 ${layers.length} 个标记`);

    layers.forEach(layer => {
      try {
        this.renderLayer(layer);
      } catch (error) {
        console.error(`降级渲染图层失败 ${layer.name}:`, error);
      }
    });
  }

  // 渲染单个图层
  private renderLayer(layer: LayerItem): void {
    if (!this.map) return;

    const geoData = JSON.parse(layer.geometryJson);

    switch (layer.type) {
      case LayerType.CITY:
        this.renderCityLayer(layer, geoData);
        break;
      case LayerType.EVENT:
        this.renderEventLayer(layer, geoData);
        break;
      case LayerType.ROUTE:
        this.renderRouteLayer(layer, geoData);
        break;
      case LayerType.TERRITORY:
        this.renderTerritoryLayer(layer, geoData);
        break;
      case LayerType.WAR:
        this.renderWarLayer(layer, geoData);
        break;
      case LayerType.DISASTER:
        this.renderDisasterLayer(layer, geoData);
        break;
    }
  }

  // 创建自定义图标标记
  private createCustomMarker(layer: LayerItem, point: any): any {
    const iconConfig = LAYER_ICONS[layer.type] || LAYER_ICONS[LayerType.DEFAULT];

    try {
      // 创建图标对象
      const icon = new window.BMapGL.Icon(
        iconConfig.url,
        new window.BMapGL.Size(iconConfig.size[0], iconConfig.size[1])
      );

      // 设置锚点
      if (iconConfig.anchor) {
        icon.setAnchor(new window.BMapGL.Size(iconConfig.anchor[0], iconConfig.anchor[1]));
      }

      // 创建标记
      const marker = new window.BMapGL.Marker(point, { icon });

      // 添加图标加载失败的错误处理
      const img = new Image();
      img.onload = () => {
        // 图标加载成功，无需额外处理
        console.log(`图标加载成功: ${iconConfig.url}`);
      };
      img.onerror = () => {
        console.warn(`图标加载失败，切换到默认图标: ${iconConfig.url}`);
        // 图标加载失败时使用默认图标
        const defaultIconConfig = LAYER_ICONS[LayerType.DEFAULT];
        const defaultIcon = new window.BMapGL.Icon(
          defaultIconConfig.url,
          new window.BMapGL.Size(defaultIconConfig.size[0], defaultIconConfig.size[1])
        );
        if (defaultIconConfig.anchor) {
          defaultIcon.setAnchor(new window.BMapGL.Size(defaultIconConfig.anchor[0], defaultIconConfig.anchor[1]));
        }
        marker.setIcon(defaultIcon);
      };
      img.src = iconConfig.url;

      return marker;
    } catch (error) {
      console.error(`创建自定义图标失败，使用默认标记:`, error);
      // 创建图标失败时使用默认标记
      try {
        const defaultIconConfig = LAYER_ICONS[LayerType.DEFAULT];
        const defaultIcon = new window.BMapGL.Icon(
          defaultIconConfig.url,
          new window.BMapGL.Size(defaultIconConfig.size[0], defaultIconConfig.size[1])
        );
        if (defaultIconConfig.anchor) {
          defaultIcon.setAnchor(new window.BMapGL.Size(defaultIconConfig.anchor[0], defaultIconConfig.anchor[1]));
        }
        return new window.BMapGL.Marker(point, { icon: defaultIcon });
      } catch (fallbackError) {
        console.error(`创建默认图标也失败，使用系统默认标记:`, fallbackError);
        // 最后的降级处理：使用系统默认标记
        return new window.BMapGL.Marker(point);
      }
    }
  }

  // 创建聚合视图管理系统
  private createClusterView(layerType: LayerType): Cluster.View {
    if (!this.map) {
      throw new Error("地图实例未初始化");
    }

    // 简单检查百度地图API是否可用
    if (typeof window.BMapGL === "undefined") {
      throw new Error("百度地图WebGL API未加载，无法创建聚合视图");
    }

    try {
      console.log(`正在为图层类型 ${layerType} 创建聚合视图`);

      // 获取该图层类型的图标配置
      const iconConfig = LAYER_ICONS[layerType] || LAYER_ICONS[LayerType.DEFAULT];

      // 创建聚合视图实例
      const cluster = new Cluster.View(this.map);

      // 尝试配置自定义图标样式
      try {
        // 检查聚合插件是否支持样式配置
        if (typeof (cluster as any).setStyles === 'function') {
          // 配置单个点的样式（未聚合时）
          (cluster as any).setStyles({
            marker: {
              icon: {
                url: iconConfig.url,
                size: iconConfig.size,
                anchor: iconConfig.anchor || [iconConfig.size[0] / 2, iconConfig.size[1]]
              }
            },
            // 配置聚合点的样式
            cluster: {
              radius: 20,
              backgroundColor: this.getClusterBackgroundColor(layerType),
              borderColor: this.getClusterBorderColor(layerType),
              textColor: '#fff',
              textSize: 12
            }
          });
          console.log(`为图层类型 ${layerType} 设置自定义样式成功`);
        } else {
          console.warn(`聚合插件不支持setStyles方法，将使用默认样式 ${layerType}`);
        }
      } catch (styleError) {
        console.warn(`设置聚合样式失败 ${layerType}:`, styleError);
      }

      // 验证聚合视图是否创建成功
      if (!cluster || typeof cluster.setData !== 'function') {
        throw new Error("聚合视图创建失败或API不兼容");
      }

      // 设置聚合事件监听器
      try {
        cluster.on(Cluster.ClusterEvent.CLICK, (e: any) => {
          console.log('聚合点被点击:', e);
          this.handleClusterClick(e);
        });

        cluster.on(Cluster.ClusterEvent.MOUSE_OVER, (e: any) => {
          console.log('鼠标悬停在聚合点:', e);
          // 可以在这里添加悬停效果，比如改变聚合点样式
        });

        cluster.on(Cluster.ClusterEvent.MOUSE_OUT, (e: any) => {
          console.log('鼠标离开聚合点:', e);
          // 可以在这里移除悬停效果
        });

        cluster.on(Cluster.ClusterEvent.CHANGE, (e: any) => {
          console.log('聚合状态变化:', e);
          // 可以在这里处理聚合状态变化的逻辑
        });

        console.log(`聚合视图 ${layerType} 创建成功，事件监听器已设置`);
      } catch (eventError) {
        console.warn(`设置聚合视图事件监听器失败 ${layerType}:`, eventError);
        // 即使事件监听器设置失败，聚合视图仍然可以使用
      }

      return cluster;
    } catch (error) {
      console.error(`创建聚合视图失败 ${layerType}:`, error);
      throw new Error(`无法为图层类型 ${layerType} 创建聚合视图: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 判断图层是否为点类型
  private isPointLayer(layer: LayerItem): boolean {
    try {
      const geoData = JSON.parse(layer.geometryJson);
      return geoData.type === "Point";
    } catch (error) {
      console.error(`解析图层几何数据失败 ${layer.name}:`, error);
      return false;
    }
  }

  // 将LayerItem转换为GeoJSON Feature格式
  private convertToGeoJSONFeatures(layers: LayerItem[]): any[] {
    const features: any[] = [];

    layers.forEach(layer => {
      if (this.isPointLayer(layer)) {
        try {
          const geoData = JSON.parse(layer.geometryJson);
          if (geoData.type === "Point") {
            // 获取该图层类型的图标配置
            const iconConfig = LAYER_ICONS[layer.type] || LAYER_ICONS[LayerType.DEFAULT];
            
            const feature = {
              type: "Feature",
              properties: {
                layerId: layer.id,
                layerName: layer.name,
                layerType: layer.type,
                startDate: layer.startDate,
                endDate: layer.endDate,
                tags: layer.tags,
                // 添加原始图层对象的引用，方便后续处理
                originalLayer: layer,
                // 添加自定义图标信息
                icon: {
                  url: iconConfig.url,
                  size: iconConfig.size,
                  anchor: iconConfig.anchor || [iconConfig.size[0] / 2, iconConfig.size[1]]
                }
              },
              geometry: {
                coordinates: geoData.coordinates,
                type: "Point"
              }
            };
            features.push(feature);
          }
        } catch (error) {
          console.error(`转换图层为GeoJSON失败 ${layer.name}:`, error);
        }
      }
    });

    console.log(`转换完成，共生成 ${features.length} 个GeoJSON Feature`);
    return features;
  }

  // 处理聚合点击事件
  private handleClusterClick(e: any): void {
    if (!this.map) return;

    try {
      console.log('处理聚合点击事件:', e);
      console.log('事件对象的属性:', Object.keys(e));

      // 尝试获取聚合点的位置信息
      let clusterCenter: any = null;
      let point: any = null;

      // 尝试不同的方式获取聚合点中心位置
      try {
        if (typeof e.getCenter === 'function') {
          clusterCenter = e.getCenter();
          console.log('通过getCenter()获取中心点:', clusterCenter);
        } else if (e.center) {
          clusterCenter = e.center;
          console.log('通过center属性获取中心点:', clusterCenter);
        } else if (e.position) {
          clusterCenter = e.position;
          console.log('通过position属性获取中心点:', clusterCenter);
        } else if (e.target && e.target.center) {
          clusterCenter = e.target.center;
          console.log('通过target.center获取中心点:', clusterCenter);
        } else if (e.target && e.target.position) {
          clusterCenter = e.target.position;
          console.log('通过target.position获取中心点:', clusterCenter);
        }

        if (clusterCenter) {
          // 创建百度地图点对象
          if (clusterCenter.lng !== undefined && clusterCenter.lat !== undefined) {
            point = new window.BMapGL.Point(clusterCenter.lng, clusterCenter.lat);
          } else if (clusterCenter.longitude !== undefined && clusterCenter.latitude !== undefined) {
            point = new window.BMapGL.Point(clusterCenter.longitude, clusterCenter.latitude);
          } else if (Array.isArray(clusterCenter) && clusterCenter.length >= 2) {
            point = new window.BMapGL.Point(clusterCenter[0], clusterCenter[1]);
          }
        }
      } catch (centerError) {
        console.warn('获取聚合点中心位置失败:', centerError);
      }

      // 尝试获取聚合点包含的所有点
      let clusterData: any[] = [];
      try {
        // 尝试不同的方法获取聚合数据
        if (typeof e.getData === 'function') {
          clusterData = e.getData();
          console.log('通过getData()获取聚合数据:', clusterData);
        } else if (typeof e.getMarkers === 'function') {
          clusterData = e.getMarkers();
          console.log('通过getMarkers()获取聚合数据:', clusterData);
        } else if (e.data) {
          clusterData = e.data;
          console.log('通过data属性获取聚合数据:', clusterData);
        } else if (e.markers) {
          clusterData = e.markers;
          console.log('通过markers属性获取聚合数据:', clusterData);
        } else if (e.target && e.target.data) {
          clusterData = e.target.data;
          console.log('通过target.data获取聚合数据:', clusterData);
        } else if (e.target && e.target.markers) {
          clusterData = e.target.markers;
          console.log('通过target.markers获取聚合数据:', clusterData);
        }
      } catch (dataError) {
        console.warn('无法获取聚合数据:', dataError);
      }

      console.log('最终获取的聚合数据:', clusterData);

      if (point && clusterData && clusterData.length > 0) {
        // 如果聚合点只包含一个点，直接显示该点的信息
        if (clusterData.length === 1) {
          const feature = clusterData[0];
          if (feature.properties && feature.properties.originalLayer) {
            this.showLayerInfo(feature.properties.originalLayer, point);
          }
        } else {
          // 如果聚合点包含多个点，显示聚合信息或放大地图
          this.showClusterInfo(clusterData, point);
        }
      } else if (point) {
        // 如果有位置信息但没有聚合数据，尝试放大地图到聚合点位置
        console.log('没有聚合数据，放大地图到聚合点位置');
        this.zoomToPoint(point);
      } else {
        console.warn('无法获取聚合点位置信息，跳过处理');
      }
    } catch (error) {
      console.error('处理聚合点击事件失败:', error);
      console.log('尝试简单的地图放大操作');

      // 最后的降级处理：简单放大地图
      try {
        if (typeof this.map.getZoom === 'function') {
          const currentZoom = this.map.getZoom();
          this.map.setZoom(currentZoom + 1);
        }
      } catch (fallbackError) {
        console.error('降级处理也失败:', fallbackError);
      }
    }
  }

  // 放大到指定点位置的辅助方法
  private zoomToPoint(point: any): void {
    try {
      let currentZoom = 10;
      if (typeof this.map!.getZoom === 'function') {
        currentZoom = this.map!.getZoom();
      }
      this.map!.centerAndZoom(point, currentZoom + 2);
    } catch (error) {
      console.error('放大到指定点失败:', error);
    }
  }

  // 显示聚合点信息
  private showClusterInfo(clusterData: any[], point: any): void {
    if (!this.map) return;

    // 统计聚合点中各类型图层的数量
    const typeCount: Record<string, number> = {};
    const layerNames: string[] = [];

    clusterData.forEach(feature => {
      if (feature.properties) {
        const typeName = this.getLayerTypeName(feature.properties.layerType);
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;

        if (layerNames.length < 5) { // 最多显示5个图层名称
          layerNames.push(feature.properties.layerName);
        }
      }
    });

    // 构建信息窗口内容
    let content = `
      <div class="cluster-info-window">
        <h3>聚合点信息</h3>
        <p><strong>包含点数：</strong>${clusterData.length}</p>
        <div class="type-statistics">
          <strong>类型统计：</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
    `;

    Object.entries(typeCount).forEach(([type, count]) => {
      content += `<li>${type}: ${count}个</li>`;
    });

    content += `
          </ul>
        </div>
    `;

    if (layerNames.length > 0) {
      content += `
        <div class="layer-names">
          <strong>包含图层：</strong>
          <p style="margin: 5px 0; font-size: 12px;">${layerNames.join(', ')}${layerNames.length < clusterData.length ? '...' : ''}</p>
        </div>
      `;
    }

    content += `
        <div class="mt-2">
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm" onclick="window.mapUtils?.zoomToCluster(${point.lng}, ${point.lat})">
            放大查看
          </button>
        </div>
      </div>
    `;

    const infoWindow = new window.BMapGL.InfoWindow(content, {
      width: 280,
      height: 200,
    });

    this.map.openInfoWindow(infoWindow, point);
  }

  // 放大到聚合点位置（供信息窗口按钮调用）
  public zoomToCluster(lng: number, lat: number): void {
    if (!this.map) return;

    const point = new window.BMapGL.Point(lng, lat);
    // 获取当前缩放级别，如果无法获取则使用默认值
    let currentZoom = 10;
    try {
      if (typeof this.map!.getZoom === 'function') {
        currentZoom = this.map!.getZoom();
      }
    } catch (zoomError) {
      console.warn('无法获取当前缩放级别，使用默认值:', zoomError);
    }
    this.map.centerAndZoom(point, currentZoom + 2);
  }

  // 渲染城池图层（点标注）- 仅用于降级处理
  private renderCityLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "Point") {
      const [lng, lat] = geoData.coordinates;
      const point = new window.BMapGL.Point(lng, lat);
      const marker = this.createCustomMarker(layer, point);

      // 设置城池标签
      const label = new window.BMapGL.Label(layer.name, {
        offset: new window.BMapGL.Size(20, -10),
        position: point,
      });
      label.setStyle({
        color: "#333",
        backgroundColor: "#FFE4B5",
        border: "1px solid #B8860B",
        borderRadius: "3px",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "bold",
      });

      // 添加点击事件
      marker.addEventListener("click", () => {
        this.showLayerInfo(layer, point);
      });

      // 将标签绑定到标记上，这样聚合时标签也会一起处理
      marker.setLabel(label);

      // 直接添加标记到地图（仅在降级处理时使用）
      this.map!.addOverlay(marker);
      this.overlays.set(layer.id, { marker, label });
    }
  }

  // 渲染事件图层 - 仅用于降级处理
  private renderEventLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "Point") {
      const [lng, lat] = geoData.coordinates;
      const point = new window.BMapGL.Point(lng, lat);
      const marker = this.createCustomMarker(layer, point);

      // 设置事件标签
      const label = new window.BMapGL.Label(layer.name, {
        offset: new window.BMapGL.Size(20, -10),
        position: point,
      });
      label.setStyle({
        color: "#fff",
        backgroundColor: "#DC143C",
        border: "1px solid #8B0000",
        borderRadius: "3px",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "bold",
      });

      // 添加点击事件
      marker.addEventListener("click", () => {
        this.showLayerInfo(layer, point);
      });

      // 将标签绑定到标记上，这样聚合时标签也会一起处理
      marker.setLabel(label);

      // 直接添加标记到地图（仅在降级处理时使用）
      this.map!.addOverlay(marker);
      this.overlays.set(layer.id, { marker, label });
    }
  }

  // 渲染路线图层
  private renderRouteLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "LineString") {
      const points = geoData.coordinates.map(
        ([lng, lat]: [number, number]) => new window.BMapGL.Point(lng, lat),
      );

      const polyline = new window.BMapGL.Polyline(points, {
        strokeColor: "#FF6B35",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      });

      // 添加点击事件
      polyline.addEventListener("click", (e: any) => {
        this.showLayerInfo(layer, e.point);
      });

      this.map!.addOverlay(polyline);
      this.overlays.set(layer.id, polyline);
    }
  }

  // 渲染疆域图层
  private renderTerritoryLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "Polygon") {
      const coordinates = geoData.coordinates[0]; // 取第一个环
      const points = coordinates.map(
        ([lng, lat]: [number, number]) => new window.BMapGL.Point(lng, lat),
      );

      const polygon = new window.BMapGL.Polygon(points, {
        strokeColor: "#2E86AB",
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: "#A23B72",
        fillOpacity: 0.3,
      });

      // 添加点击事件
      polygon.addEventListener("click", (e: any) => {
        this.showLayerInfo(layer, e.point);
      });

      this.map!.addOverlay(polygon);
      this.overlays.set(layer.id, polygon);
    }
  }

  // 渲染战争图层 - 仅用于降级处理
  private renderWarLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "Point") {
      const [lng, lat] = geoData.coordinates;
      const point = new window.BMapGL.Point(lng, lat);
      const marker = this.createCustomMarker(layer, point);

      const label = new window.BMapGL.Label(layer.name, {
        offset: new window.BMapGL.Size(20, -10),
        position: point,
      });
      label.setStyle({
        color: "#fff",
        backgroundColor: "#8B0000", // 深红色
        border: "1px solid #B22222",
        borderRadius: "3px",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "bold",
      });

      marker.addEventListener("click", () => {
        this.showLayerInfo(layer, point);
      });

      // 将标签绑定到标记上，这样聚合时标签也会一起处理
      marker.setLabel(label);

      // 直接添加标记到地图（仅在降级处理时使用）
      this.map!.addOverlay(marker);
      this.overlays.set(layer.id, { marker, label });
    }
  }

  // 渲染灾难图层 - 仅用于降级处理
  private renderDisasterLayer(layer: LayerItem, geoData: any): void {
    if (geoData.type === "Point") {
      const [lng, lat] = geoData.coordinates;
      const point = new window.BMapGL.Point(lng, lat);
      const marker = this.createCustomMarker(layer, point);

      const label = new window.BMapGL.Label(layer.name, {
        offset: new window.BMapGL.Size(20, -10),
        position: point,
      });
      label.setStyle({
        color: "#333",
        backgroundColor: "#FFD700", // 金色
        border: "1px solid #DAA520",
        borderRadius: "3px",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "bold",
      });

      marker.addEventListener("click", () => {
        this.showLayerInfo(layer, point);
      });

      // 将标签绑定到标记上，这样聚合时标签也会一起处理
      marker.setLabel(label);

      // 直接添加标记到地图（仅在降级处理时使用）
      this.map!.addOverlay(marker);
      this.overlays.set(layer.id, { marker, label });
    }
  }

  // 显示图层信息窗口
  private showLayerInfo(layer: LayerItem, point: any): void {
    const content = `
      <div class="layer-info-window">
        <h3>${layer.name}</h3>
        <p><strong>类型：</strong>${this.getLayerTypeName(layer.type)}</p>
        <p><strong>时间：</strong>${layer.startDate} - ${layer.endDate}</p>
        <p><strong>标签：</strong>${layer.tags.join(", ")}</p>
        <div class="mt-2">
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm" onclick="alert('查看详情功能待实现')">
            查看详情
          </button>
        </div>
      </div>
    `;

    const infoWindow = new window.BMapGL.InfoWindow(content, {
      width: 250,
      height: 150,
    });

    this.map!.openInfoWindow(infoWindow, point);
  }

  // 获取图层类型中文名称
  private getLayerTypeName(type: LayerType): string {
    const typeNames = {
      [LayerType.DEFAULT]: "默认",
      [LayerType.CITY]: "城池",
      [LayerType.EVENT]: "事件",
      [LayerType.ROUTE]: "路线",
      [LayerType.TERRITORY]: "疆域",
      [LayerType.WAR]: "战争",
      [LayerType.DISASTER]: "灾难",
    };
    return typeNames[type] || "未知";
  }

  // 清除所有图层
  public clearLayers(): void {
    if (!this.map) return;

    console.log(`开始清除图层，当前存储的覆盖物数量: ${this.overlays.size}，聚合视图数量: ${this.clusterViews.size}`);

    // 清除聚合视图
    this.clusterViews.forEach((clusterView, layerType) => {
      try {
        console.log(`正在清除聚合视图 ${layerType}`);

        // 首先清除聚合视图的数据
        clusterView.setData([]);

        // 移除所有事件监听器
        try {
          if (typeof (clusterView as any).off === 'function') {
            (clusterView as any).off(Cluster.ClusterEvent.CLICK);
            (clusterView as any).off(Cluster.ClusterEvent.MOUSE_OVER);
            (clusterView as any).off(Cluster.ClusterEvent.MOUSE_OUT);
            (clusterView as any).off(Cluster.ClusterEvent.CHANGE);
          }
        } catch (offError) {
          console.warn(`移除聚合视图事件监听器失败 ${layerType}:`, offError);
        }

        // 尝试销毁聚合视图（不同版本的API可能不同）
        try {
          if (typeof (clusterView as any).destroy === 'function') {
            (clusterView as any).destroy();
            console.log(`聚合视图 ${layerType} 已通过destroy方法销毁`);
          } else if (typeof (clusterView as any).remove === 'function') {
            (clusterView as any).remove();
            console.log(`聚合视图 ${layerType} 已通过remove方法移除`);
          } else if (typeof (clusterView as any).clear === 'function') {
            (clusterView as any).clear();
            console.log(`聚合视图 ${layerType} 已通过clear方法清除`);
          } else if (typeof (clusterView as any).dispose === 'function') {
            (clusterView as any).dispose();
            console.log(`聚合视图 ${layerType} 已通过dispose方法释放`);
          } else {
            console.warn(`聚合视图 ${layerType} 没有找到合适的销毁方法`);
          }
        } catch (destroyError) {
          console.warn(`销毁聚合视图失败 ${layerType}:`, destroyError);
        }
      } catch (error) {
        console.error(`清除聚合视图失败 ${layerType}:`, error);
      }
    });

    // 清空聚合视图映射
    this.clusterViews.clear();
    console.log("所有聚合视图已清除");

    // 清除存储的覆盖物
    this.overlays.forEach((overlay, id) => {
      try {
        console.log(`正在清除覆盖物 ${id}`);

        // 处理聚合视图类型的覆盖物（从overlays中移除聚合视图引用）
        if (id.startsWith('cluster_')) {
          console.log(`移除聚合视图覆盖物引用 ${id}`);
          return; // 聚合视图已在上面处理，这里只需要移除引用
        }

        // 处理不同类型的覆盖物
        if (overlay && typeof overlay === "object") {
          // 检查是否是组合覆盖物（marker + label）
          if (overlay.marker && overlay.label) {
            console.log(`清除组合覆盖物 ${id}: marker + label`);
            this.map!.removeOverlay(overlay.marker);
            this.map!.removeOverlay(overlay.label);
          } else if (overlay.marker) {
            console.log(`清除覆盖物 ${id}: 只有marker`);
            this.map!.removeOverlay(overlay.marker);
          } else if (overlay.label) {
            console.log(`清除覆盖物 ${id}: 只有label`);
            this.map!.removeOverlay(overlay.label);
          } else {
            // 单个覆盖物（如线条、多边形）
            console.log(`清除单个覆盖物 ${id}`);
            this.map!.removeOverlay(overlay);
          }
        } else if (overlay) {
          // 直接的覆盖物对象
          console.log(`清除直接覆盖物 ${id}`);
          this.map!.removeOverlay(overlay);
        }
      } catch (error) {
        console.error(`清除覆盖物失败 ${id}:`, error);
      }
    });

    // 清空覆盖物映射
    this.overlays.clear();
    console.log("所有覆盖物已清除");

    // 通过百度地图API清除所有覆盖物（备用方案，确保没有遗漏）
    try {
      this.map!.clearOverlays();
      console.log("通过百度地图API清除所有覆盖物");
    } catch (error) {
      console.error("通过API清除所有覆盖物失败:", error);
    }

    console.log("图层清除完成");
  }

  // 按类型显示/隐藏图层
  public toggleLayerType(layerType: LayerType, visible: boolean): void {
    // 这个方法需要重新获取数据并过滤，暂时简单实现
    console.log(`切换图层类型 ${layerType} 显示状态: ${visible}`);
  }

  // 获取聚合点背景颜色
  private getClusterBackgroundColor(layerType: LayerType): string {
    const colors = {
      [LayerType.DEFAULT]: "#666666",
      [LayerType.CITY]: "#FFE4B5",
      [LayerType.EVENT]: "#DC143C",
      [LayerType.ROUTE]: "#FF6B35",
      [LayerType.TERRITORY]: "#2E86AB",
      [LayerType.WAR]: "#8B0000",
      [LayerType.DISASTER]: "#FFD700",
    };
    return colors[layerType] || colors[LayerType.DEFAULT];
  }

  // 获取聚合点边框颜色
  private getClusterBorderColor(layerType: LayerType): string {
    const colors = {
      [LayerType.DEFAULT]: "#333333",
      [LayerType.CITY]: "#B8860B",
      [LayerType.EVENT]: "#8B0000",
      [LayerType.ROUTE]: "#CC5500",
      [LayerType.TERRITORY]: "#1E5F7A",
      [LayerType.WAR]: "#B22222",
      [LayerType.DISASTER]: "#DAA520",
    };
    return colors[layerType] || colors[LayerType.DEFAULT];
  }
}

// 西安的经纬度坐标
export const XI_AN_CENTER: BaiduMapPoint = {
  lng: 108.948024,
  lat: 34.263161,
};
