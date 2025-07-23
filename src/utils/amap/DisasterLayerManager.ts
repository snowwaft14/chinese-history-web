import { LayerType } from '@/connects/layer_pb';
import { LayerManagerBase } from './LayerManagerBase';

/**
 * 灾难图层管理器 - 简化版本
 */
export class DisasterLayerManager extends LayerManagerBase {
  constructor(map: AMap.Map) {
    super(map, LayerType.DISASTER);
  }

  /**
   * 渲染单个灾难标记
   */
  createRenderMarker(): ({ marker }: { marker: AMap.Marker }) => void {
    return ({ marker }) => {
      try {
        // 创建灾难图标
        const icon = new (window as any).AMap.Icon({
          image: this.createDisasterIconSvg('#fa8c16', 24),
          size: new (window as any).AMap.Size(24, 24),
          anchor: new (window as any).AMap.Pixel(12, 12)
        });

        marker.setIcon(icon);

        // 添加点击事件
        const layerData = (marker as any).getExtData()?.layerData;
        if (layerData) {
          marker.on('click', this.createMarkerClickHandler(layerData));
        }
      } catch (error) {
        console.error('渲染灾难标记失败:', error);
      }
    };
  }

  /**
   * 渲染灾难聚合标记
   */
  createRenderClusterMarker(): ({ count, marker }: { count: number; marker: AMap.Marker }) => void {
    return ({ count, marker }) => {
      try {
        // 根据聚合数量选择颜色和大小
        let color = '#fa8c16';
        let size = 40;
        
        if (count > 50) {
          color = '#d46b08';
          size = 60;
        } else if (count > 10) {
          color = '#fa541c';
          size = 50;
        }

        // 创建聚合图标
        const icon = new (window as any).AMap.Icon({
          image: this.createClusterIconSvg(color, size, count.toString()),
          size: new (window as any).AMap.Size(size, size),
          anchor: new (window as any).AMap.Pixel(size / 2, size / 2)
        });

        marker.setIcon(icon);
      } catch (error) {
        console.error('渲染灾难聚合标记失败:', error);
      }
    };
  }

  /**
   * 创建灾难图标SVG - 使用预定义图标
   */
  private createDisasterIconSvg(color: string, size: number): string {
    // 使用预定义的灾难图标，忽略传入的颜色参数，使用原始设计
    return '/icons/disaster.svg';
  }

  /**
   * 创建单个灾难标记
   */
  createMarker(context: import('./amap').MarkerContext): void {
    try {
      const layerData = context.data[0].extData;
      
      // 创建灾难图标
      const icon = new AMap.Icon({
        image: '/icons/disaster.svg',
        size: new AMap.Size(32, 32),
        imageSize: new AMap.Size(32, 32)
      });

      context.marker.setIcon(icon);
      context.marker.setTitle(layerData.name);

      // 添加点击事件
      context.marker.on('click', this.createMarkerClickHandler(layerData));
    } catch (error) {
      console.error('创建灾难标记失败:', error);
    }
  }

  /**
   * 创建灾难聚合标记
   */
  createClusterMarker(context: import('./amap').MarkerClusterContext): void {
    try {
      const factor = 1;
      const hue = 30; // 橙色色调，适合灾难
      const bgColor = `hsla(${hue}, 80%, 55%, 0.8)`;
      const fontColor = `hsla(${hue}, 100%, 95%, 1)`;
      const borderColor = `hsla(${hue}, 80%, 45%, 1)`;
      const shadowColor = `hsla(${hue}, 80%, 75%, 0.6)`;
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
      console.error('创建灾难聚合标记失败:', error);
    }
  }

  /**
   * 创建聚合图标SVG - 使用预定义图标并叠加数字
   */
  private createClusterIconSvg(color: string, size: number, text: string): string {
    // 使用预定义的聚合图标作为背景，叠加数字文本
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <image href="/icons/disaster_cluster.svg" width="${size}" height="${size}"/>
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="white" font-size="${Math.min(size/3, 14)}" font-weight="bold" stroke="#000" stroke-width="0.5">${text}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svg));
  }
}