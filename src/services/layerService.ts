import { createClient } from "@connectrpc/connect";
import { LayerService } from "../connects/layer_pb";
import { type HistoricalDate, HistoricalDateSchema, CalendarType } from "../connects/common_pb";
import {
  type GetLayersRequest,
  type LayerItem,
  GetLayersRequestSchema,
} from "../connects/layer_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建LayerService客户端
const client = createClient(LayerService, transport);

export class LayerServiceClient {
  /**
   * 获取图层数据（基于历史日期范围）
   * @param start 开始历史日期
   * @param end 结束历史日期
   * @returns 图层数据响应
   */
  async getLayersByDateRange(start: HistoricalDate, end: HistoricalDate): Promise<LayerItem[]> {
    try {
      // 创建请求对象
      const request: GetLayersRequest = create(GetLayersRequestSchema, {
        start: start,
        end: end,
      });

      // 调用gRPC服务
      const response = await client.getLayers(request);

      return response.items;
    } catch (error) {
      console.error("获取图层数据失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const layerServiceClient = new LayerServiceClient();
