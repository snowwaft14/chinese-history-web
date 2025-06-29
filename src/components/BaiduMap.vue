<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { MapUtils, XI_AN_CENTER } from "../utils/MapUtils.ts";
  import type { BaiduMapOptions } from "@/models/map";

  const mapContainer = ref<HTMLElement>();
  let mapService: MapUtils | null = null;

  const props = withDefaults(
    defineProps<{
      center?: { lng: number; lat: number };
      zoom?: number;
    }>(),
    {
      center: () => XI_AN_CENTER,
      zoom: 12,
    },
  );

  // 定义事件
  const emit = defineEmits<{
    "map-ready": [service: MapUtils];
  }>();

  onMounted(async () => {
    if (mapContainer.value) {
      mapService = new MapUtils(mapContainer.value);

      const mapOptions: BaiduMapOptions = {
        center: props.center,
        zoom: props.zoom,
        enableScrollWheelZoom: true,
        enableDragging: true,
      };

      try {
        await mapService.initMap(mapOptions);
        console.log("百度地图初始化成功");

        // 触发map-ready事件，传递mapService实例
        emit("map-ready", mapService);
      } catch (error) {
        console.error("百度地图初始化失败:", error);
      }
    }
  });

  onUnmounted(() => {
    mapService = null;
  });
</script>

<style scoped>
  /* 地图容器样式 */
</style>
