import { createPromiseClient } from "@connectrpc/connect";
import { WarService } from "../connects/war_pb";
import { transport } from "./connect";

// 创建战争服务客户端
export const warService = createPromiseClient(WarService, transport);

// 导出战争相关的类型
export * from "../connects/war_pb";