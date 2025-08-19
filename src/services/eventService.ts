import { createPromiseClient } from "@connectrpc/connect";
import { EventService } from "../connects/event_pb";
import { transport } from "./connect";

// 创建事件服务客户端
export const eventService = createPromiseClient(EventService, transport);

// 导出事件相关的类型
export * from "../connects/event_pb";