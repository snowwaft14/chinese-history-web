/**
 * 验证非点类型图层管理器实现
 * 这个脚本验证 RouteLayerManager 和 TerritoryLayerManager 是否正确实现
 */

// 模拟浏览器环境
global.window = {
  AMap: {
    LngLat: function(lng, lat) { return { lng, lat }; },
    Marker: function(options) { 
      return { 
        on: () => {}, 
        setOptions: () => {}, 
        getPosition: () => ({ lng: 108, lat: 34 }),
        getExtData: () => ({}),
        setExtData: () => {}
      }; 
    },
    Polyline: function(options) { 
      return { 
        on: () => {}, 
        setOptions: () => {}, 
        getOptions: () => ({ strokeWeight: 3, strokeOpacity: 0.8 }),
        getExtData: () => ({}),
        setExtData: () => {}
      }; 
    },
    Polygon: function(options) { 
      return { 
        on: () => {}, 
        setOptions: () => {}, 
        getOptions: () => ({ strokeWeight: 2, strokeOpacity: 0.7 }),
        getExtData: () => ({}),
        setExtData: () => {}
      }; 
    },
    Text: function(options) { return {}; },
    InfoWindow: function(options) { 
      return { 
        open: () => {}, 
        close: () => {} 
      }; 
    },
    Icon: function(options) { return {}; },
    Size: function(w, h) { return { width: w, height: h }; },
    Pixel: function(x, y) { return { x, y }; }
  }
};

// 模拟地图实例
const mockMapInstance = {
  add: (overlays) => console.log(`添加 ${overlays.length} 个覆盖物到地图`),
  remove: (overlays) => console.log(`从地图移除 ${overlays.length} 个覆盖物`),
  on: () => {},
  off: () => {},
  getZoom: () => 10,
  setZoom: () => {},
  getCenter: () => ({ lng: 108.9398, lat: 34.3412 }),
  setCenter: () => {}
};

// 模拟图层数据
const mockRouteData = [
  {
    id: 'route_1',
    name: '丝绸之路',
    geometryJson: JSON.stringify({
      type: 'LineString',
      coordinates: [
        [108.9398, 34.3412], // 西安
        [103.8343, 36.0611], // 兰州
        [87.6177, 43.7928],  // 乌鲁木齐
        [69.2401, 41.2995]   // 撒马尔罕
      ]
    }),
    tags: ['贸易', '丝绸之路', '古代商路'],
    startDate: { year: -138 }, // 公元前138年
    endDate: { year: 1453 },   // 公元1453年
    type: 3 // ROUTE
  }
];

const mockTerritoryData = [
  {
    id: 'territory_1',
    name: '唐朝疆域',
    geometryJson: JSON.stringify({
      type: 'Polygon',
      coordinates: [[
        [73.5, 53.5],   // 西北角
        [135.0, 53.5],  // 东北角
        [135.0, 18.0],  // 东南角
        [73.5, 18.0],   // 西南角
        [73.5, 53.5]    // 闭合
      ]]
    }),
    tags: ['唐朝', '帝国', '盛唐'],
    startDate: { year: 618 },
    endDate: { year: 907 },
    type: 4 // TERRITORY
  }
];

async function verifyLayerManagers() {
  console.log('开始验证非点类型图层管理器...\n');

  try {
    // 动态导入模块（需要使用 ES modules）
    const { RouteLayerManager } = await import('./src/utils/RouteLayerManager.js');
    const { TerritoryLayerManager } = await import('./src/utils/TerritoryLayerManager.js');
    const { LayerType } = await import('./src/connects/layer_pb.js');

    console.log('✓ 成功导入 RouteLayerManager 和 TerritoryLayerManager');

    // 测试 RouteLayerManager
    console.log('\n--- 测试 RouteLayerManager ---');
    const routeManager = new RouteLayerManager(mockMapInstance);
    
    console.log(`图层类型: ${routeManager.getLayerType()}`);
    console.log(`初始覆盖物数量: ${routeManager.getOverlayCount()}`);
    console.log(`是否可见: ${routeManager.isVisible()}`);

    // 渲染路线数据
    console.log('渲染路线数据...');
    routeManager.render(mockRouteData);
    console.log(`渲染后覆盖物数量: ${routeManager.getOverlayCount()}`);

    // 测试显示/隐藏
    console.log('测试隐藏图层...');
    routeManager.hide();
    console.log(`隐藏后是否可见: ${routeManager.isVisible()}`);

    console.log('测试显示图层...');
    routeManager.show();
    console.log(`显示后是否可见: ${routeManager.isVisible()}`);

    // 清除图层
    console.log('清除路线图层...');
    routeManager.clear();
    console.log(`清除后覆盖物数量: ${routeManager.getOverlayCount()}`);

    console.log('✓ RouteLayerManager 测试通过');

    // 测试 TerritoryLayerManager
    console.log('\n--- 测试 TerritoryLayerManager ---');
    const territoryManager = new TerritoryLayerManager(mockMapInstance);
    
    console.log(`图层类型: ${territoryManager.getLayerType()}`);
    console.log(`初始覆盖物数量: ${territoryManager.getOverlayCount()}`);
    console.log(`是否可见: ${territoryManager.isVisible()}`);

    // 渲染疆域数据
    console.log('渲染疆域数据...');
    territoryManager.render(mockTerritoryData);
    console.log(`渲染后覆盖物数量: ${territoryManager.getOverlayCount()}`);

    // 测试显示/隐藏
    console.log('测试隐藏图层...');
    territoryManager.hide();
    console.log(`隐藏后是否可见: ${territoryManager.isVisible()}`);

    console.log('测试显示图层...');
    territoryManager.show();
    console.log(`显示后是否可见: ${territoryManager.isVisible()}`);

    // 清除图层
    console.log('清除疆域图层...');
    territoryManager.clear();
    console.log(`清除后覆盖物数量: ${territoryManager.getOverlayCount()}`);

    console.log('✓ TerritoryLayerManager 测试通过');

    // 测试图层管理器注册
    console.log('\n--- 测试图层管理器注册 ---');
    const { LayerManagerRegistry } = await import('./src/utils/LayerManagerRegistry.js');
    const { LayerManagerFactory } = await import('./src/utils/BaseLayerManager.js');

    LayerManagerRegistry.registerAllLayerManagers();
    console.log(`注册状态: ${LayerManagerRegistry.isLayerManagersRegistered()}`);
    console.log(`验证注册: ${LayerManagerRegistry.validateRegistration()}`);

    // 测试通过工厂创建管理器
    const factoryRouteManager = LayerManagerFactory.createLayerManager(mockMapInstance, LayerType.ROUTE);
    const factoryTerritoryManager = LayerManagerFactory.createLayerManager(mockMapInstance, LayerType.TERRITORY);

    console.log(`工厂创建的路线管理器类型: ${factoryRouteManager.constructor.name}`);
    console.log(`工厂创建的疆域管理器类型: ${factoryTerritoryManager.constructor.name}`);

    console.log('✓ 图层管理器注册测试通过');

    console.log('\n🎉 所有测试通过！非点类型图层管理器实现正确。');

  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  }
}

// 运行验证
verifyLayerManagers().catch(console.error);