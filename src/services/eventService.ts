import { createClient } from "@connectrpc/connect";
import { EventService } from "../connects/event_pb";
import {
  type GetEventsRequest,
  type FindEventsRequest,
  type Event,
  GetEventsRequestSchema,
  FindEventsRequestSchema,
} from "../connects/event_pb";
import { create } from "@bufbuild/protobuf";
import { transport } from "./connect";

// 创建事件服务客户端
const client = createClient(EventService, transport);

export class EventServiceClient {
  /**
   * 获取所有事件
   * @returns 事件数据响应
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const request = create(GetEventsRequestSchema);
      const response = await client.getEvents(request);
      return response.events;
    } catch (error) {
      console.error("获取事件数据失败:", error);
      throw error;
    }
  }

  /**
   * 查找事件（根据条件）
   * @param criteria 查找条件
   * @returns 事件数据响应
   */
  async findEvents(criteria: {
    eventId?: string;
    name?: string;
    eventType?: any;
    importance?: any;
    startDate?: any;
    endDate?: any;
    eventTypes?: any[];
    tags?: string[];
  }): Promise<Event[]> {
    try {
      const request = create(FindEventsRequestSchema, criteria);
      const response = await client.findEvents(request);
      return response.events;
    } catch (error) {
      console.error("查找事件失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const eventServiceClient = new EventServiceClient();

// 导出事件相关的类型
export * from "../connects/event_pb";