import { createClient } from "@connectrpc/connect";
import { DynastyService } from "../connects/dynasty_pb";
import {
  type GetAllDynastiesRequest,
  type Dynasty,
  GetAllDynastiesRequestSchema,
  type GetEmperorsByDynastyRequest,
  type Emperor,
  GetEmperorsByDynastyRequestSchema,
  type GetErasByDynastyRequest,
  type EraName,
  GetErasByDynastyRequestSchema,
  type GetDynastyByIdRequest,
  GetDynastyByIdRequestSchema,
  type GetEmperorByIdRequest,
  GetEmperorByIdRequestSchema,
  type GetEraByNameRequest,
  GetEraByNameRequestSchema,
} from "../connects/dynasty_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建DynastyService客户端
const client = createClient(DynastyService, transport);

export class DynastyServiceClient {
  /**
   * 获取所有朝代
   * @param includePeriods 是否包含时代信息
   * @returns 朝代数据响应
   */
  async getAllDynasties(includePeriods: boolean = false): Promise<Dynasty[]> {
    try {
      // 创建请求对象
      const request: GetAllDynastiesRequest = create(GetAllDynastiesRequestSchema);

      // 调用gRPC服务
      const response = await client.getAllDynasties(request);

      return response.dynasties;
    } catch (error) {
      console.error("获取朝代数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取某个朝代下的皇帝
   * @param dynastyId 朝代ID
   * @param includeEraNames 是否包含年号信息
   * @returns 皇帝数据响应
   */
  async getEmperorsByDynasty(
    dynastyId: string,
    includeEraNames: boolean = true,
  ): Promise<Emperor[]> {
    try {
      // 创建请求对象
      const request: GetEmperorsByDynastyRequest = create(GetEmperorsByDynastyRequestSchema, {
        dynastyId: dynastyId,
      });

      // 调用gRPC服务
      const response = await client.getEmperorsByDynasty(request);

      return response.emperors;
    } catch (error) {
      console.error("获取皇帝数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取单个朝代详情
   * @param dynastyId 朝代ID
   * @returns 朝代详情
   */
  async getDynasty(dynastyId: string): Promise<Dynasty | undefined> {
    try {
      // 创建请求对象
      const request: GetDynastyByIdRequest = create(GetDynastyByIdRequestSchema, {
        dynastyId: dynastyId,
      });

      // 调用gRPC服务
      const response = await client.getDynastyById(request);

      return response.dynasty;
    } catch (error) {
      console.error("获取朝代详情失败:", error);
      throw error;
    }
  }

  /**
   * 获取朝代下的所有年号
   * @param dynastyName 朝代名称
   * @returns 年号数据响应
   */
  async getErasByDynasty(dynastyName: string): Promise<EraName[]> {
    try {
      // 创建请求对象
      const request: GetErasByDynastyRequest = create(GetErasByDynastyRequestSchema, {
        dynastyId: dynastyName,
      });

      // 调用gRPC服务
      const response = await client.getErasByDynasty(request);

      return response.eraNames;
    } catch (error) {
      console.error("获取年号数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取皇帝详情
   * @param emperorId 皇帝ID
   * @returns 皇帝详情
   */
  async getEmperor(
    emperorId: string,
    includeEraNames: boolean = true,
  ): Promise<Emperor | undefined> {
    try {
      // 创建请求对象
      const request: GetEmperorByIdRequest = create(GetEmperorByIdRequestSchema, {
        emperorId: emperorId,
      });

      // 调用gRPC服务
      const response = await client.getEmperor(request);

      return response.emperor;
    } catch (error) {
      console.error("获取皇帝详情失败:", error);
      throw error;
    }
  }

  /**
   * 获取特定年号详情
   * @param dynastyId 朝代ID
   * @param eraName 年号名称
   * @returns 年号详情
   */
  async getEraByName(dynastyId: string, eraName: string): Promise<EraName | undefined> {
    try {
      // 创建请求对象
      const request: GetEraByNameRequest = create(GetEraByNameRequestSchema, {
        dynastyId: dynastyId,
        eraName: eraName,
      });

      // 调用gRPC服务
      const response = await client.getEraByName(request);

      return response.eraName;
    } catch (error) {
      console.error("获取年号详情失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const dynastyServiceClient = new DynastyServiceClient();
