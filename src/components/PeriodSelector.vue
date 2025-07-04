<template>
  <div class="period-selector w-full">
    <div class="card bg-base-200 card-body p-3 h-[360px] flex flex-col">
      <div class="label mb-3 flex-shrink-0">
        <span class="label-text font-medium text-primary">朝代与时代选择</span>
      </div>

      <!-- 左右布局容器 -->
      <div class="flex gap-4 flex-1 min-h-0">
        <!-- 左侧：朝代搜索列表 -->
        <div class="w-1/3 flex flex-col min-h-0">
          <div class="mb-2 flex-shrink-0">
            <SearchableSelect
              :options="dynastyOptions"
              v-model="selectedDynasty"
              @change="onDynastySelected"
              placeholder="搜索朝代..."
              :input-class="'input input-bordered input-sm w-full pr-12'"
            />
          </div>
          <!-- 朝代列表 -->
          <div
            class="flex-1 space-y-1 overflow-y-auto scrollbar-thin border border-base-300 min-h-0"
          >
            <button
              v-for="dynasty in dynasties"
              :key="dynasty.name"
              @click="
                selectedDynasty = dynasty.name;
                onDynastySelected(dynasty.name, { value: dynasty.name, label: dynasty.name });
              "
              :class="[
                'btn btn-ghost btn-sm w-full justify-start text-left p-2 h-auto normal-case',
                selectedDynasty === dynasty.name ? 'bg-primary/10 border-primary/20' : '',
              ]"
            >
              <div class="w-full">
                <div class="font-medium text-sm text-base-content">
                  {{ dynasty.name }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 右侧：时代列表 -->
        <div class="w-2/3 flex flex-col border border-base-300 min-h-0">
          <div
            class="text-sm font-medium text-base-content/70 p-2 border-b border-base-300 flex-shrink-0"
          >
            历史时期
          </div>
          <div class="flex-1 space-y-2 overflow-y-auto scrollbar-thin p-2 min-h-0">
            <button
              v-for="period in currentPeriods"
              :key="period.name"
              @click="onPeriodSelected(period)"
              class="btn btn-ghost btn-sm w-full justify-start text-left p-3 h-auto normal-case"
            >
              <div class="w-full">
                <div class="font-medium text-base-content mb-1">
                  {{ period.name }}
                </div>
                <div class="text-xs text-base-content/70">
                  {{ period.description }}
                </div>
              </div>
            </button>

            <!-- 如果没有选择朝代，显示提示 -->
            <div
              v-if="currentPeriods.length === 0"
              class="text-center text-sm text-base-content/50 py-4"
            >
              请先选择朝代查看对应的历史时期
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { type Period, type Dynasty } from "@/connects/dynasty_pb.ts";
import { type HistoricalDate } from "@/connects/common_pb.ts";
import { dynastyServiceClient } from "@/services/dynastyService.ts";
import SearchableSelect from "./SearchableSelect.vue";



// Emits
const emit = defineEmits<{
  "period-selected": [period: Period];
}>();

// 响应式数据
const dynasties = ref<Dynasty[]>([]);
const selectedDynasty = ref<string>("");
const currentPeriods = ref<Period[]>([]);

// 朝代选项，用于SearchableSelect组件
const dynastyOptions = computed(() =>
  dynasties.value.map((dynasty) => ({
    value: dynasty.name,
    label: dynasty.name,
    searchValues: dynasty.searchValues,
  })),
);

// 方法
const onDynastySelected = async (dynastyName: string, option: any) => {
  console.log("PeriodSelector - 朝代选择事件触发:", dynastyName, option);

  // 查找选中朝代的详细信息
  const selectedDynastyData = dynasties.value.find((d) => d.name === dynastyName);
  if (selectedDynastyData) {
    currentPeriods.value = selectedDynastyData.periods;
    console.log(
      "PeriodSelector - 找到朝代数据:",
      selectedDynastyData.name,
      "时代数量:",
      selectedDynastyData.periods.length,
    );
  } else {
    currentPeriods.value = [];
    console.log("PeriodSelector - 未找到朝代数据:", dynastyName);
  }
};

const onPeriodSelected = (period: Period) => {
  if (!period.start || !period.end) return;

  console.log("PeriodSelector - 时代选择:", period.name);

  // 发射时代选择事件
  emit("period-selected", period);
};

// 加载朝代数据的方法
const loadDynastiesData = async () => {
  try {
    console.log("PeriodSelector - 重新加载朝代数据...");
    dynasties.value = await dynastyServiceClient.getAllDynasties();
    console.log(`PeriodSelector - 成功加载 ${dynasties.value.length} 个朝代`);
  } catch (error) {
    console.error("PeriodSelector - 加载朝代数据失败:", error);
    dynasties.value = [];
  }
};

// 暴露方法给父组件
defineExpose({
  loadDynastiesData,
});

// 生命周期
onMounted(async () => {
  // 初始加载朝代数据
  await loadDynastiesData();
});
</script>

<style scoped>
.period-selector {
  /* 时代选择器样式 */
}

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
</style> 