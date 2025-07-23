import { LayerType, type LayerItem } from "@/connects/layer_pb";
import { LayerManagerBase } from "./LayerManagerBase";

/**
 * 城池图层管理器 - 简化版本
 */
export class CityLayerManager extends LayerManagerBase {
  constructor(map: AMap.Map) {
    super(map, LayerType.CITY);
  }

  /**
   * 创建单个城池标记
   */
  createMarker(context: import("./amap").MarkerContext): void {
    try {
      const layerData = context.data[0].extData;

      // 创建城池图标
      const icon = new AMap.Icon({
        image: "/icons/city.svg",
        size: new AMap.Size(32, 32),
        imageSize: new AMap.Size(32, 32),
      });

      context.marker.setIcon(icon);
      context.marker.setTitle(layerData.name);

      // 添加点击事件
      context.marker.on("click", this.createMarkerClickHandler(layerData));
    } catch (error) {
      console.error("创建城池标记失败:", error);
    }
  }

  /**
   * 创建城池聚合标记
   */
  createClusterMarker(context: import("./amap").MarkerClusterContext): void {
    try {
      const factor = 1;
      const hue = 180 - factor * 180;
      const bgColor = `hsla(${hue}, 100%, 40%, 0.7)`;
      const fontColor = `hsla(${hue}, 100%, 90%, 1)`;
      const borderColor = `hsla(${hue}, 100%, 40%, 1)`;
      const shadowColor = `hsla(${hue}, 100%, 90%, 1)`;
      const size = 40;

      const htmlContent = `
        <div style="
          background-color: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border: solid 1px ${borderColor};
          border-radius: ${size / 2}px;
          box-shadow: 0 0 5px ${shadowColor};
          line-height: ${size}px;
          color: ${fontColor};
          font-size: 14px;
          text-align: center;
          font-weight: bold;
        ">
          ${context.count}
        </div>
      `;

      context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
      context.marker.setContent(htmlContent);
    } catch (error) {
      console.error("创建城池聚合标记失败:", error);
    }
  }
}
