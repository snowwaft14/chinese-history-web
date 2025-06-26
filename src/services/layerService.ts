import { createClient } from "@connectrpc/connect";
import { LayerService } from "../connects/layer_pb";
import { GetLayersRequestSchema, HistoricalDateSchema, LayerType, CalendarType } from "../connects/layer_pb";
import type { GetLayersRequest, LayerItem, HistoricalDate as ProtoHistoricalDate } from "../connects/layer_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from './connect'
import type { HistoricalDate, HistoricalDateRange } from '@/models/historical-date'

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
      // 转换历史日期到proto格式
      const startProto = this.convertToProtoDate(dateRange.start)
      const endProto = this.convertToProtoDate(dateRange.end)

      // 创建请求对象
      const request: GetLayersRequest = create(GetLayersRequestSchema, {
        start: startProto,
        end: endProto
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
    const dateRange: HistoricalDateRange = {
      start: {
        calendarType: CalendarType.GREGORIAN,
        isoDate: startDate
      },
      end: {
        calendarType: CalendarType.GREGORIAN,
        isoDate: endDate
      }
    }
    return this.getLayersByDateRange(dateRange)
  }

  /**
   * 将本地历史日期转换为proto格式
   */
  private convertToProtoDate(date: HistoricalDate): ProtoHistoricalDate {
    return create(HistoricalDateSchema, {
      calendarType: date.calendarType as any,
      eraName: date.eraName || '',
      eraYear: date.eraYear || 0,
      eraMonth: date.eraMonth || 0,
      eraDay: date.eraDay || 0,
      dynasty: date.dynasty || '',
      period: date.period || '',
      isoDate: date.isoDate || '',
      lunarDate: date.lunarDate || ''
    })
  }
}

// 导出单例实例
export const layerServiceClient = new LayerServiceClient(); 