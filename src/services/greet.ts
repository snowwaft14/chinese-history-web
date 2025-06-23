import { createClient } from '@connectrpc/connect'
import { transport } from './connect'
import { Greeter } from '../connects/src/protos/greet_pb'
import { create } from '@bufbuild/protobuf'
import { HelloRequestSchema, type HelloReply } from '../connects/src/protos/greet_pb'

// 创建gRPC客户端
const client = createClient(Greeter, transport)

export const greetService = {
  /**
   * 调用SayHello服务
   * @param name 用户名字
   * @returns Promise<HelloReply> 问候响应
   */
  async sayHello(name: string): Promise<HelloReply> {
    try {
      // 创建请求对象
      const request = create(HelloRequestSchema, {
        name: name,
      })
      
      // 调用gRPC服务
      const response = await client.sayHello(request)
      
      return response
    } catch (error) {
      console.error('gRPC调用失败:', error)
      throw new Error(`调用SayHello服务失败: ${error}`)
    }
  }
} 