/**
 * 地图样式管理器
 * 负责配置和管理高德地图的样式和视觉效果
 */
export class MapStyleManager {
  // 预定义的地图样式
  static readonly STYLE_NORMAL = "amap://styles/normal";
  static readonly STYLE_DARK = "amap://styles/dark";
  static readonly STYLE_LIGHT = "amap://styles/light";
  static readonly STYLE_WHITESMOKE = "amap://styles/whitesmoke";
  static readonly STYLE_FRESH = "amap://styles/fresh";
  static readonly STYLE_GREY = "amap://styles/grey";
  static readonly STYLE_GRAFFITI = "amap://styles/graffiti";
  static readonly STYLE_MACARON = "amap://styles/macaron";
  static readonly STYLE_BLUE = "amap://styles/blue";
  static readonly STYLE_DARKBLUE = "amap://styles/darkblue";
  static readonly STYLE_WINE = "amap://styles/wine";

  // 历史地图专用样式 - 适合历史地图展示的样式
  static readonly STYLE_HISTORY = "amap://styles/whitesmoke";

  static readonly STYLE_CHINESE_HISTORY = "amap://styles/10e86dc6de009bb1d2ff91f085a52b09";

  // 自定义样式配置 - 适合历史地图展示
  static readonly CUSTOM_HISTORY_STYLE = {
    // 自定义样式配置，使用高德地图的自定义样式格式
    // 参考: https://lbs.amap.com/api/javascript-api/guide/map/map-style
    styleJson: [
      {
        // 调整地图整体亮度
        featureType: "all",
        elementType: "all",
        stylers: {
          lightness: 10,
          saturation: -30,
        },
      },
      {
        // 调整水域颜色为浅蓝色
        featureType: "water",
        elementType: "all",
        stylers: {
          color: "#d1e5ff",
        },
      },
      {
        // 调整绿地颜色为浅绿色
        featureType: "green",
        elementType: "all",
        stylers: {
          color: "#e8f5e4",
        },
      },
      {
        // 调整建筑物颜色为浅灰色
        featureType: "building",
        elementType: "all",
        stylers: {
          color: "#f0f0f0",
        },
      },
      {
        // 调整道路颜色为浅灰色
        featureType: "road",
        elementType: "all",
        stylers: {
          color: "#ffffff",
          weight: "1",
        },
      },
      {
        // 调整标签可见性
        featureType: "label",
        elementType: "labels.text.fill",
        stylers: {
          color: "#666666",
        },
      },
    ],
  };

  // 图标样式配置
  static readonly ICON_STYLES = {
    // 城池图标样式
    CITY: {
      normal: {
        url: "/icons/city.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      capital: {
        url: "/icons/capital.png",
        size: [40, 40],
        anchor: [20, 20],
      },
      major: {
        url: "/icons/major-city.png",
        size: [36, 36],
        anchor: [18, 18],
      },
      minor: {
        url: "/icons/minor-city.png",
        size: [28, 28],
        anchor: [14, 14],
      },
    },
    // 事件图标样式
    EVENT: {
      political: {
        url: "/icons/political-event.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      military: {
        url: "/icons/military-event.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      cultural: {
        url: "/icons/cultural-event.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      economic: {
        url: "/icons/economic-event.png",
        size: [32, 32],
        anchor: [16, 16],
      },
    },
    // 战争图标样式
    WAR: {
      battle: {
        url: "/icons/battle.png",
        size: [36, 36],
        anchor: [18, 18],
      },
      siege: {
        url: "/icons/siege.png",
        size: [36, 36],
        anchor: [18, 18],
      },
      campaign: {
        url: "/icons/campaign.png",
        size: [36, 36],
        anchor: [18, 18],
      },
    },
    // 灾难图标样式
    DISASTER: {
      flood: {
        url: "/icons/flood.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      drought: {
        url: "/icons/drought.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      earthquake: {
        url: "/icons/earthquake.png",
        size: [32, 32],
        anchor: [16, 16],
      },
      plague: {
        url: "/icons/plague.png",
        size: [32, 32],
        anchor: [16, 16],
      },
    },
  };

  // 线条样式配置
  static readonly LINE_STYLES = {
    // 路线样式
    ROUTE: {
      trade: {
        strokeColor: "#3366FF",
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      },
      military: {
        strokeColor: "#FF3366",
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      },
      migration: {
        strokeColor: "#33CC66",
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeStyle: "dashed",
      },
    },
  };

  // 多边形样式配置
  static readonly POLYGON_STYLES = {
    // 疆域样式
    TERRITORY: {
      default: {
        strokeColor: "#666666",
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: "#CCCCCC",
        fillOpacity: 0.3,
        strokeStyle: "solid",
      },
    },
  };

  // 聚合样式配置
  static readonly CLUSTER_STYLES = [
    {
      // 小聚合点样式
      url: "/icons/cluster-small.png",
      size: [40, 40],
      anchor: [20, 20],
      textColor: "#FFFFFF",
      textSize: 12,
    },
    {
      // 中聚合点样式
      url: "/icons/cluster-medium.png",
      size: [50, 50],
      anchor: [25, 25],
      textColor: "#FFFFFF",
      textSize: 14,
    },
    {
      // 大聚合点样式
      url: "/icons/cluster-large.png",
      size: [60, 60],
      anchor: [30, 30],
      textColor: "#FFFFFF",
      textSize: 16,
    },
  ];

  // 信息窗口样式配置
  static readonly INFO_WINDOW_STYLE = {
    width: 320,
    height: 200,
    offset: [0, -10],
    closeWhenClickMap: true,
  };

  // 标签样式配置
  static readonly LABEL_STYLE = {
    offset: [0, -30],
    content: "",
    direction: "top",
    style: {
      backgroundColor: "rgba(255,255,255,0.8)",
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: "3px",
      padding: "5px 10px",
      fontSize: "12px",
      fontWeight: "normal",
      color: "#333",
    },
  };

  /**
   * 应用地图样式
   * @param map 高德地图实例
   * @param styleName 样式名称，默认为历史地图样式
   */
  static applyMapStyle(map: any, styleName: string = this.STYLE_HISTORY): void {
    if (!map) {
      console.warn("地图实例不存在，无法应用样式");
      return;
    }

    try {
      // 应用预定义样式
      map.setMapStyle(styleName);
      console.log(`已应用地图样式: ${styleName}`);
    } catch (error) {
      console.error("应用地图样式失败:", error);
    }
  }

  /**
   * 应用自定义地图样式
   * @param map 高德地图实例
   * @param customStyle 自定义样式配置
   */
  static applyCustomMapStyle(map: any, customStyle: any = this.CUSTOM_HISTORY_STYLE): void {
    if (!map) {
      console.warn("地图实例不存在，无法应用自定义样式");
      return;
    }

    try {
      // 应用自定义样式
      map.setMapStyle(customStyle);
      console.log("已应用自定义地图样式");
    } catch (error) {
      console.error("应用自定义地图样式失败:", error);
    }
  }

  /**
   * 获取图标样式
   * @param layerType 图层类型
   * @param subType 子类型
   * @returns 图标样式配置
   */
  static getIconStyle(layerType: string, subType: string = "normal"): any {
    const layerStyles = this.ICON_STYLES[layerType as keyof typeof this.ICON_STYLES];
    if (!layerStyles) {
      return this.ICON_STYLES.CITY.normal; // 默认样式
    }

    return layerStyles[subType as keyof typeof layerStyles] || Object.values(layerStyles)[0];
  }

  /**
   * 获取线条样式
   * @param layerType 图层类型
   * @param subType 子类型
   * @returns 线条样式配置
   */
  static getLineStyle(layerType: string, subType: string = "default"): any {
    const layerStyles = this.LINE_STYLES[layerType as keyof typeof this.LINE_STYLES];
    if (!layerStyles) {
      return this.LINE_STYLES.ROUTE.trade; // 默认样式
    }

    return layerStyles[subType as keyof typeof layerStyles] || Object.values(layerStyles)[0];
  }

  /**
   * 获取多边形样式
   * @param layerType 图层类型
   * @param subType 子类型
   * @returns 多边形样式配置
   */
  static getPolygonStyle(layerType: string, subType: string = "default"): any {
    const layerStyles = this.POLYGON_STYLES[layerType as keyof typeof this.POLYGON_STYLES];
    if (!layerStyles) {
      return this.POLYGON_STYLES.TERRITORY.default; // 默认样式
    }

    return layerStyles[subType as keyof typeof layerStyles] || Object.values(layerStyles)[0];
  }

  /**
   * 获取聚合样式
   * @returns 聚合样式配置数组
   */
  static getClusterStyles(): any[] {
    return this.CLUSTER_STYLES;
  }

  /**
   * 获取信息窗口样式
   * @returns 信息窗口样式配置
   */
  static getInfoWindowStyle(): any {
    return this.INFO_WINDOW_STYLE;
  }

  /**
   * 获取标签样式
   * @param content 标签内容
   * @returns 标签样式配置
   */
  static getLabelStyle(content: string): any {
    const style = { ...this.LABEL_STYLE };
    style.content = content;
    return style;
  }

  /**
   * 创建信息窗口内容
   * @param title 标题
   * @param content 内容
   * @param type 类型
   * @param timeRange 时间范围
   * @param tags 标签
   * @returns HTML内容
   */
  static createInfoWindowContent(
    title: string,
    content: string,
    type: string,
    timeRange?: string,
    tags?: string[]
  ): string {
    // 创建与原百度地图相同样式的信息窗口内容
    return `
      <div class="info-window">
        <div class="info-header">
          <h3 class="info-title">${title}</h3>
          <span class="info-type">${type}</span>
        </div>
        <div class="info-content">
          <p>${content}</p>
          ${timeRange ? `<p class="info-time">时间范围: ${timeRange}</p>` : ""}
          ${
            tags && tags.length > 0
              ? `<div class="info-tags">
                  ${tags.map((tag) => `<span class="info-tag">${tag}</span>`).join("")}
                </div>`
              : ""
          }
        </div>
        <style>
          .info-window {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 10px;
            max-width: 300px;
          }
          .info-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-title {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .info-type {
            font-size: 12px;
            color: #666;
            background-color: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
          }
          .info-content {
            font-size: 14px;
            line-height: 1.5;
            color: #444;
          }
          .info-time {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
          }
          .info-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 8px;
          }
          .info-tag {
            font-size: 12px;
            color: #3366cc;
            background-color: #e6f0ff;
            padding: 2px 6px;
            border-radius: 3px;
          }
        </style>
      </div>
    `;
  }
}