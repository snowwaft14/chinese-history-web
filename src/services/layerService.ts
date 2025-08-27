import { createClient } from "@connectrpc/connect";
import { LayerService } from "../connects/layer_pb";
import { type HistoricalDate, HistoricalDateSchema, CalendarType } from "../connects/common_pb";
import {
  type GetLayersRequest,
  type FindLayersRequest,
  type LayerItem,
  GetLayersRequestSchema,
  FindLayersRequestSchema,
} from "../connects/layer_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建LayerService客户端
const client = createClient(LayerService, transport);

export class LayerServiceClient {
  /**
   * 获取所有图层数据
   * @returns 图层数据响应
   */
  async getAllLayers(): Promise<LayerItem[]> {
    try {
      const request: GetLayersRequest = create(GetLayersRequestSchema);
      const response = await client.getLayers(request);
      return response.items;
    } catch (error) {
      console.error("获取图层数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找图层数据（根据条件）
   * @param criteria 查找条件
   * @returns 图层数据响应
   */
  async findLayers(criteria: {
    start?: HistoricalDate;
    end?: HistoricalDate;
    layerType?: any; // LayerType
    layerTypes?: any[]; // LayerType[]
    itemId?: string;
    name?: string;
    tags?: string[];
  }): Promise<LayerItem[]> {
    try {
      const request: FindLayersRequest = create(FindLayersRequestSchema, {
        start: criteria.start,
        end: criteria.end,
        layerType: criteria.layerType,
        layerTypes: criteria.layerTypes || [],
        itemId: criteria.itemId,
        name: criteria.name,
        tags: criteria.tags || [],
      });
      const response = await client.findLayers(request);
      return response.items;
    } catch (error) {
      console.error("查找图层数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取图层数据（基于历史日期范围）
   * @param start 开始历史日期
   * @param end 结束历史日期
   * @returns 图层数据响应
   */
  async getLayersByDateRange(start: HistoricalDate, end: HistoricalDate): Promise<LayerItem[]> {
    return this.findLayers({ start, end });
  }
}

// 导出单例实例
export const layerServiceClient = new LayerServiceClient();
