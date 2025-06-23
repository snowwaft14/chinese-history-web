import { createGrpcWebTransport } from '@connectrpc/connect-web'

// 创建gRPC-Web传输
export const transport = createGrpcWebTransport({
  // gRPC服务器基地址
  baseUrl: 'https://localhost:5001',
  
  // 使用二进制格式，因为不是所有gRPC-web实现都支持JSON
  useBinaryFormat: true,
  
  // 拦截器数组，可以用于添加认证、日志等功能
  interceptors: [],
  
  // 可选的fetch实现覆盖
  fetch: globalThis.fetch,
  
  // Protobuf JSON序列化选项
  jsonOptions: {
    ignoreUnknownFields: true,
  },
})

// 导出类型供其他模块使用
export type Transport = typeof transport