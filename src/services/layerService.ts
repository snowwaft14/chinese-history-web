import { createClient } from "@connectrpc/connect";
import { LayerService } from "../connects/layer_pb";
import { GetLayersRequestSchema, HistoricalDateSchema, CalendarType } from "../connects/layer_pb";
import type { GetLayersRequest, LayerItem, HistoricalDate } from "../connects/layer_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from './connect'
import type { HistoricalDateRange } from '@/models/historical-date'

// 创建LayerService客户端
const client = createClient(LayerService, transport);

export class LayerServiceClient {
  /**
   * 获取图层数据（基于历史日期范围）
   * @param dateRange 历史日期范围
   * @returns 图层数据响应
   */
  async getLayersByDateRange(dateRange: HistoricalDateRange): Promise<LayerItem[]> {
    try {
      // 创建请求对象
      const request: GetLayersRequest = create(GetLayersRequestSchema, {
        start: dateRange.start,
        end: dateRange.end
      });

      // 调用gRPC服务
      const response = await client.getLayers(request);

      return response.items;
    } catch (error) {
      console.error("获取图层数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取图层数据（简化版本，基于ISO日期字符串）
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   * @returns 图层数据响应
   */
  async getLayers(startDate: string, endDate: string): Promise<LayerItem[]> {
    // 解析 ISO 日期字符串 (例如: "0755-12-16")
    const parseISODate = (dateStr: string) => {
      const parts = dateStr.split('-')
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      }
    }
    
    const startParts = parseISODate(startDate)
    const endParts = parseISODate(endDate)
    
    const dateRange: HistoricalDateRange = {
      start: create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: startParts.year,
        month: startParts.month,
        day: startParts.day,
        isLeapMonth: false,
        eraName: ''
      }),
      end: create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: endParts.year,
        month: endParts.month,
        day: endParts.day,
        isLeapMonth: false,
        eraName: ''
      })
    }
    return this.getLayersByDateRange(dateRange)
  }


}

// 导出单例实例
export const layerServiceClient = new LayerServiceClient(); 