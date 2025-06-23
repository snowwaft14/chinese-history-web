import { createClient } from "@connectrpc/connect";
import { LayerService } from "../connects/layer_pb";
import { GetLayersRequestSchema, GetLayersResponseSchema, LayerType } from "../connects/layer_pb";
import type { GetLayersRequest, GetLayersResponse, LayerItem } from "../connects/layer_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from './connect'

// 创建LayerService客户端
const client = createClient(LayerService, transport);

export class LayerServiceClient {
  /**
   * 获取图层数据
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   * @param layerTypes 图层类型列表
   * @returns 图层数据响应
   */
  async getLayers(
    startDate: string,
    endDate: string,
    layerTypes: LayerType[]
  ): Promise<LayerItem[]> {
    try {
      // 创建请求对象
      const request: GetLayersRequest = create(GetLayersRequestSchema, {
        startDate,
        endDate,
        layerTypes,
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
   * 获取所有图层类型的数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 图层数据
   */
  async getAllLayers(startDate: string, endDate: string): Promise<LayerItem[]> {
    return this.getLayers(startDate, endDate, [
      LayerType.CITY,
      LayerType.EVENT,
      LayerType.TERRITORY,
      LayerType.ROUTE
    ]);
  }
}

// 导出单例实例
export const layerServiceClient = new LayerServiceClient(); 