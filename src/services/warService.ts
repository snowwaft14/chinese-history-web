import { createClient } from "@connectrpc/connect";
import { WarService } from "../connects/war_pb";
import {
  type GetWarsRequest,
  type FindWarsRequest,
  type War,
  GetWarsRequestSchema,
  FindWarsRequestSchema,
} from "../connects/war_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建战争服务客户端
const client = createClient(WarService, transport);

export class WarServiceClient {
  /**
   * 获取所有战争
   * @returns 战争数据响应
   */
  async getAllWars(): Promise<War[]> {
    try {
      const request = create(GetWarsRequestSchema);
      const response = await client.getWars(request);
      return response.wars;
    } catch (error) {
      console.error("获取战争数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找战争（根据条件）
   * @param criteria 查找条件
   * @returns 战争数据响应
   */
  async findWars(criteria: {
    warId?: string;
    name?: string;
    warType?: any;
    startDate?: any;
    endDate?: any;
    warTypes?: any[];
    tags?: string[];
  }): Promise<War[]> {
    try {
      const request = create(FindWarsRequestSchema, criteria);
      const response = await client.findWars(request);
      return response.wars;
    } catch (error) {
      console.error("查找战争失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const warServiceClient = new WarServiceClient();

// 导出战争相关的类型
export * from "../connects/war_pb";