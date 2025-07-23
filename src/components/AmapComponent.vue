<template>
  <div ref="mapContainer" class="w-full h-full relative">
    <MapLoadingIndicator :loading="isLoading" :message="loadingMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { AmapAdapter } from "../utils/AMapUtils.ts";

import { MapStyleManager } from "../utils/amap/MapStyleManager.ts";
import MapLoadingIndicator from "./MapLoadingIndicator.vue";
import type { Position, MapInitOptions } from "@/types/map";
import {XI_AN_CENTER} from "@/types/map";


const mapContainer = ref<HTMLElement>();
let mapService: AmapAdapter | null = null;
const isLoading = ref(true);
const loadingMessage = ref("正在加载地图...");

const props = withDefaults(
  defineProps<{
    center?: Position;
    zoom?: number;
  }>(),
  {
    center: () => XI_AN_CENTER,
    zoom: 12,
  },
);

// 定义事件
const emit = defineEmits<{
  "map-ready": [service: AmapAdapter];
  "loading-status": [status: boolean, message: string];
}>();

// 预加载图标资源
const preloadMapIcons = () => {

  loadingMessage.value = "正在预加载图标资源...";

  // 预加载所有图标
  const iconTypes = ['CITY', 'EVENT', 'WAR', 'DISASTER'];
  const iconPromises: Promise<void>[] = [];

  iconTypes.forEach(type => {
    const iconStyles = MapStyleManager.ICON_STYLES[type as keyof typeof MapStyleManager.ICON_STYLES];
    if (iconStyles) {
      Object.values(iconStyles).forEach(style => {
        if (style && typeof style === 'object' && 'url' in style) {
          const img = new Image();
          const promise = new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // 即使加载失败也继续
          });
          img.src = style.url as string;
          iconPromises.push(promise);
        }
      });
    }
  });

  // 预加载聚合图标
  MapStyleManager.CLUSTER_STYLES.forEach(style => {
    if (style && typeof style === 'object' && 'url' in style) {
      const img = new Image();
      const promise = new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      img.src = style.url as string;
      iconPromises.push(promise);
    }
  });

  return Promise.all(iconPromises);
};

// 初始化地图
const initializeMap = async () => {
  if (!mapContainer.value) return;

  try {
    isLoading.value = true;
    loadingMessage.value = "正在初始化地图...";
    emit("loading-status", true, loadingMessage.value);

    mapService = new AmapAdapter();

    // 预加载图标资源
    await preloadMapIcons();

    const mapOptions: MapInitOptions = {
      center: props.center,
      zoom: props.zoom,
      enableScrollWheelZoom: true,
      dragEnable: true,
      viewMode: "2D",
      mapStyle: MapStyleManager.STYLE_CHINESE_HISTORY,
    };

    loadingMessage.value = "正在加载地图...";
    emit("loading-status", true, loadingMessage.value);

    // 使用新的初始化方法，直接使用高德地图适配器
    await mapService.initializeMap(mapContainer.value, mapOptions);
    console.log("高德地图初始化成功");

    // 获取地图实例
    const map = mapService.getMap();

    // 应用地图样式
    loadingMessage.value = "正在应用地图样式...";
    emit("loading-status", true, loadingMessage.value);


    // 触发map-ready事件，传递mapService实例
    isLoading.value = false;
    loadingMessage.value = "";
    emit("loading-status", false, "");
    emit("map-ready", mapService);
  } catch (error) {
    console.error("高德地图初始化失败:", error);
    isLoading.value = false;
    loadingMessage.value = "地图加载失败，请刷新重试";
    emit("loading-status", false, loadingMessage.value);
  }
};

onMounted(async () => {
  await initializeMap();
});

onUnmounted(() => {
  if (mapService) {
    mapService.destroy();
    mapService = null;
  }
});
</script>

<style scoped>
/* 地图容器样式 */
.amap-logo {
  display: none !important;
  /* 隐藏Logo，仅用于开发环境 */
}

.amap-copyright {
  display: none !important;
  /* 隐藏版权信息，仅用于开发环境 */
}
</style>