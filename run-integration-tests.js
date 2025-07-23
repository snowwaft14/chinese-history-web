/**
 * 高德地图集成测试运行脚本
 * 
 * 此脚本用于运行地图相关的集成测试，包括：
 * 1. 地图初始化和配置流程测试
 * 2. 图层渲染和交互功能测试
 * 3. 用户交互场景测试
 * 4. 错误场景和降级处理测试
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 测试文件路径
const integrationTestsDir = path.join(__dirname, 'src/integration-tests');
const testFiles = [
  'map-integration.test.ts',
  'map-e2e.test.ts'
];

// 检查测试文件是否存在
testFiles.forEach(file => {
  const filePath = path.join(integrationTestsDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`错误: 测试文件不存在: ${filePath}`);
    process.exit(1);
  }
});

console.log('开始运行高德地图集成测试...');
console.log('='.repeat(50));

try {
  // 运行集成测试
  execSync(`npx vitest run src/integration-tests/map-integration.test.ts src/integration-tests/map-e2e.test.ts --run`, {
    stdio: 'inherit'
  });
  
  console.log('='.repeat(50));
  console.log('✅ 集成测试完成');
} catch (error) {
  console.error('❌ 集成测试失败:', error.message);
  process.exit(1);
}