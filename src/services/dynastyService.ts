import { createClient } from "@connectrpc/connect";
import { DynastyService } from "../connects/dynasty_pb";
import {
  type GetDynastiesRequest,
  type FindDynastiesRequest,
  type GetEmperorsRequest,
  type FindEmperorsRequest,
  type GetErasRequest,
  type FindErasRequest,
  type Dynasty,
  type Emperor,
  type EraName,
  GetDynastiesRequestSchema,
  FindDynastiesRequestSchema,
  GetEmperorsRequestSchema,
  FindEmperorsRequestSchema,
  GetErasRequestSchema,
  FindErasRequestSchema,
} from "../connects/dynasty_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建DynastyService客户端
const client = createClient(DynastyService, transport);

export class DynastyServiceClient {
  /**
   * 获取所有朝代
   * @returns 朝代数据响应
   */
  async getAllDynasties(): Promise<Dynasty[]> {
    try {
      const request: GetDynastiesRequest = create(GetDynastiesRequestSchema);
      const response = await client.getDynasties(request);
      return response.dynasties;
    } catch (error) {
      console.error("获取朝代数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找朝代（根据条件）
   * @param criteria 查找条件
   * @returns 朝代数据响应
   */
  async findDynasties(criteria: {
    dynastyId?: string;
    name?: string;
    startYear?: number;
    endYear?: number;
    tags?: string[];
  }): Promise<Dynasty[]> {
    try {
      const request: FindDynastiesRequest = create(FindDynastiesRequestSchema, {
        dynastyId: criteria.dynastyId,
        name: criteria.name,
        startYear: criteria.startYear,
        endYear: criteria.endYear,
        tags: criteria.tags || [],
      });
      const response = await client.findDynasties(request);
      return response.dynasties;
    } catch (error) {
      console.error("查找朝代失败:", error);
      throw error;
    }
  }

  /**
   * 获取单个朝代详情
   * @param dynastyId 朝代ID
   * @returns 朝代详情
   */
  async getDynasty(dynastyId: string): Promise<Dynasty | undefined> {
    const dynasties = await this.findDynasties({ dynastyId });
    return dynasties.length > 0 ? dynasties[0] : undefined;
  }

  /**
   * 获取所有皇帝
   * @returns 皇帝数据响应
   */
  async getAllEmperors(): Promise<Emperor[]> {
    try {
      const request: GetEmperorsRequest = create(GetEmperorsRequestSchema);
      const response = await client.getEmperors(request);
      return response.emperors;
    } catch (error) {
      console.error("获取皇帝数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找皇帝（根据条件）
   * @param criteria 查找条件
   * @returns 皇帝数据响应
   */
  async findEmperors(criteria: {
    emperorId?: string;
    dynastyName?: string;
    name?: string;
    templeName?: string;
  }): Promise<Emperor[]> {
    try {
      const request: FindEmperorsRequest = create(FindEmperorsRequestSchema, {
        emperorId: criteria.emperorId,
        dynastyName: criteria.dynastyName,
        name: criteria.name,
        templeName: criteria.templeName,
      });
      const response = await client.findEmperors(request);
      return response.emperors;
    } catch (error) {
      console.error("查找皇帝失败:", error);
      throw error;
    }
  }

  /**
   * 获取某个朝代下的皇帝
   * @param dynastyName 朝代名称
   * @returns 皇帝数据响应
   */
  async getEmperorsByDynasty(dynastyName: string): Promise<Emperor[]> {
    return this.findEmperors({ dynastyName });
  }

  /**
   * 获取皇帝详情
   * @param emperorId 皇帝ID
   * @returns 皇帝详情
   */
  async getEmperor(emperorId: string): Promise<Emperor | undefined> {
    const emperors = await this.findEmperors({ emperorId });
    return emperors.length > 0 ? emperors[0] : undefined;
  }

  /**
   * 获取所有年号
   * @returns 年号数据响应
   */
  async getAllEras(): Promise<EraName[]> {
    try {
      const request: GetErasRequest = create(GetErasRequestSchema);
      const response = await client.getEras(request);
      return response.eraNames;
    } catch (error) {
      console.error("获取年号数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找年号（根据条件）
   * @param criteria 查找条件
   * @returns 年号数据响应
   */
  async findEras(criteria: {
    dynastyId?: string;
    emperorId?: string;
    eraName?: string;
  }): Promise<EraName[]> {
    try {
      const request: FindErasRequest = create(FindErasRequestSchema, {
        dynastyId: criteria.dynastyId,
        emperorId: criteria.emperorId,
        eraName: criteria.eraName,
      });
      const response = await client.findEras(request);
      return response.eraNames;
    } catch (error) {
      console.error("查找年号失败:", error);
      throw error;
    }
  }

  /**
   * 获取朝代下的所有年号
   * @param dynastyId 朝代ID
   * @returns 年号数据响应
   */
  async getErasByDynasty(dynastyId: string): Promise<EraName[]> {
    return this.findEras({ dynastyId });
  }

  /**
   * 获取皇帝的所有年号
   * @param emperorId 皇帝ID
   * @returns 年号数据响应
   */
  async getErasByEmperor(emperorId: string): Promise<EraName[]> {
    return this.findEras({ emperorId });
  }

  /**
   * 获取特定年号详情
   * @param dynastyId 朝代ID
   * @param eraName 年号名称
   * @returns 年号详情
   */
  async getEraByName(dynastyId: string, eraName: string): Promise<EraName | undefined> {
    const eras = await this.findEras({ dynastyId, eraName });
    return eras.length > 0 ? eras[0] : undefined;
  }
}

// 导出单例实例
export const dynastyServiceClient = new DynastyServiceClient();
