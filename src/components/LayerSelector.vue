<template>
  <div class="layer-selector relative w-full max-w-md min-w-52">
    <!-- Collapse 组件 -->
    <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box shadow-lg">
      <!-- Collapse 标题/触发器 -->
      <input type="checkbox" :checked="isOpen" @change="toggleCollapse" class="peer" />
      <div class="collapse-title text-sm font-medium text-left pr-4">
        <div class="flex items-center space-x-3">
          <span class="text-lg">🗂️</span>
          <div>
            <div class="font-bold text-base-content">图层类型</div>
            <div class="text-xs text-base-content/70 truncate">
              {{ selectedSummary }}
            </div>
          </div>
          <div class="ml-auto">
            <span class="badge badge-primary badge-sm">
              {{ modelValue.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Collapse 内容 -->
      <div class="collapse-content">
        <!-- 全选/取消全选 -->
        <div class="card bg-base-200 card-body p-3 mb-3">
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                :checked="isAllSelected"
                :indeterminate="isPartiallySelected"
                @change="toggleSelectAll"
                type="checkbox"
                class="checkbox checkbox-primary"
              />
              <span class="text-sm font-semibold text-base-content">
                {{ selectAllText }}
              </span>
            </label>
            <span class="text-xs text-base-content/70">
              {{ modelValue.length }}/{{ layerOptions.length }}
            </span>
          </div>
        </div>

        <!-- 图层选项列表 -->
        <div class="card bg-base-200 card-body p-3">
          <div class="max-h-64 overflow-y-auto space-y-2">
            <label
              v-for="option in layerOptions"
              :key="option.value"
              class="flex items-center space-x-3 p-3 hover:bg-base-300 transition-all duration-150 cursor-pointer group rounded-lg"
            >
              <input
                :checked="modelValue.includes(option.value)"
                @change="toggleLayer(option.value)"
                type="checkbox"
                class="checkbox checkbox-primary"
              />
              <div class="flex items-center space-x-3 flex-1">
                <span class="text-lg">{{ option.icon }}</span>
                <div>
                  <div class="text-sm font-medium text-base-content">
                    {{ option.label }}
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ option.description }}
                  </div>
                </div>
              </div>
              <div
                v-if="modelValue.includes(option.value)"
                class="w-2 h-2 bg-primary rounded-full"
              ></div>
            </label>
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="card-actions justify-end mt-4 pt-3 border-t border-base-300">
          <button @click="closeCollapse" class="btn btn-ghost btn-sm">关闭</button>
          <button @click="applySelection" class="btn btn-primary btn-sm">
            <span>✅</span>
            <span>应用</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 遮罩层 - 只在打开时显示，点击关闭 -->
  <div v-if="isOpen" @click="closeCollapse" class="fixed inset-0 z-30 bg-black/20"></div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { LayerType } from "@/connects/layer_pb";

  // Props
  interface Props {
    modelValue: LayerType[];
    layerOptions: {
      value: LayerType;
      label: string;
      icon: string;
      description: string;
    }[];
  }

  const props = defineProps<Props>();

  // Emits
  const emit = defineEmits<{
    "update:modelValue": [value: LayerType[]];
    change: [value: LayerType[]];
  }>();

  // 响应式数据
  const isOpen = ref(false);

  // 计算属性
  const isAllSelected = computed(() => props.modelValue.length === props.layerOptions.length);

  const isPartiallySelected = computed(
    () => props.modelValue.length > 0 && props.modelValue.length < props.layerOptions.length,
  );

  const selectAllText = computed(() => {
    if (isAllSelected.value) return "取消全选";
    if (isPartiallySelected.value) return "全选";
    return "全选";
  });

  const selectedSummary = computed(() => {
    const count = props.modelValue.length;
    if (count === 0) return "未选择图层";
    if (count === props.layerOptions.length) return "已选择全部图层";

    const selectedLabels = props.layerOptions
      .filter((option) => props.modelValue.includes(option.value))
      .map((option) => option.label);

    if (count <= 2) {
      return selectedLabels.join("、");
    }

    return `${selectedLabels.slice(0, 2).join("、")} 等${count}项`;
  });

  // 方法
  const toggleCollapse = (event: Event) => {
    const target = event.target as HTMLInputElement;
    isOpen.value = target.checked;
  };

  const closeCollapse = () => {
    isOpen.value = false;
  };

  const toggleSelectAll = () => {
    const newValue = isAllSelected.value ? [] : props.layerOptions.map((option) => option.value);

    emit("update:modelValue", newValue);
  };

  const toggleLayer = (layerType: LayerType) => {
    const newValue = props.modelValue.includes(layerType)
      ? props.modelValue.filter((type) => type !== layerType)
      : [...props.modelValue, layerType];

    emit("update:modelValue", newValue);
  };

  const applySelection = () => {
    emit("change", props.modelValue);
    closeCollapse();
  };

  // 键盘事件处理
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen.value) {
      closeCollapse();
    }
  };

  // 生命周期
  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
</script>

<style scoped>
  /* 滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* 确保组件在合适的层级 */
  .layer-selector {
    z-index: 40;
  }

  /* 自定义collapse样式 */
  .collapse {
    position: relative;
    z-index: 50;
  }
</style>
