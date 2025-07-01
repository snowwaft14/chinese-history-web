<template>
  <div :class="containerClass">
    <!-- Collapse 组件 -->
    <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box shadow-lg">
      <!-- Collapse 标题/触发器 -->
      <input type="checkbox" :checked="isOpen" @change="toggleCollapse" class="peer" />
      <div class="collapse-title text-sm font-medium text-left pr-4">
        <div class="truncate">
          {{ getDisplayText() }}
        </div>
      </div>

      <!-- Collapse 内容 -->
      <div class="collapse-content">
        <div class="tabs tabs-box">
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="阳历"
            @click="
              selectedTab = 'calendar';
              selectedCalendarType = CalendarType.GREGORIAN;
            "
            :checked="selectedTab === 'calendar' && selectedCalendarType === CalendarType.GREGORIAN"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="农历"
            @click="
              selectedTab = 'calendar';
              selectedCalendarType = CalendarType.LUNAR;
            "
            :checked="selectedTab === 'calendar' && selectedCalendarType === CalendarType.LUNAR"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="年号"
            @click="
              selectedTab = 'calendar';
              selectedCalendarType = CalendarType.ERA;
            "
            :checked="selectedTab === 'calendar' && selectedCalendarType === CalendarType.ERA"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="时代"
            @click="selectedTab = 'periods'"
            :checked="selectedTab === 'periods'"
          />
        </div>
        <!-- 日历标签页内容 -->
        <div v-if="selectedTab === 'calendar'" class="pt-2">
          <!-- 开始日期 -->
          <div class="card bg-base-200 card-body p-3">
            <div class="label">
              <span class="label-text font-medium text-primary">开始日期</span>
            </div>
            <DateInput
              :calendar-type="selectedCalendarType"
              :value="dateRange.start"
              @update:value="updateStartDate"
            />
            <!-- 结束日期 -->
            <div class="label">
              <span class="label-text font-medium text-primary">结束日期</span>
            </div>
            <DateInput
              :calendar-type="selectedCalendarType"
              :value="dateRange.end"
              @update:value="updateEndDate"
            />
          </div>
        </div>

        <!-- 时代标签页内容 -->
        <div v-else-if="selectedTab === 'periods'" class="pt-2">
          <div class="card bg-base-200 card-body p-3">
            <div class="label">
              <span class="label-text font-medium text-primary">朝代与时代选择</span>
            </div>

            <!-- 朝代选择器 -->
            <div class="mb-3">
              <SearchableSelect
                :options="dynastyOptions"
                v-model="selectedDynasty"
                @change="onDynastySelected"
                placeholder="选择朝代..."
                :input-class="'input input-bordered input-sm w-full pr-12'"
              />
            </div>

            <!-- 时代列表 -->
            <div class="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              <button
                v-for="period in currentPeriods"
                :key="period.name"
                @click="applyPeriodRange(period)"
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

        <!-- 操作按钮 -->
        <div class="card-actions justify-end mt-4 pt-3 border-t border-base-300">
          <button @click="reset" class="btn btn-ghost btn-sm">重置</button>
          <button @click="applyAndClose" class="btn btn-primary btn-sm" :disabled="!isValidRange">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 遮罩层 - 只在打开时显示，点击关闭 -->
  <div v-if="isOpen" @click="closeCollapse" class="fixed inset-0 z-30 bg-black/20"></div>
</template>

<script lang="ts">
  export default {
    name: "HistoricalDateSelector",
  };
</script>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from "vue";
  import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb.ts";
  import { type Period, type Dynasty } from "@/connects/dynasty_pb.ts";
  import { create } from "@bufbuild/protobuf";
  import DateInput from "./DateInput.vue";
  import SearchableSelect from "./SearchableSelect.vue";
  import { HistoricalDateUtils } from "../utils/HistoricalDateUtils.ts";
  import { dynastyServiceClient } from "@/services/dynastyService.ts";

  // Props
  interface Props {
    beginDate?: HistoricalDate;
    endDate?: HistoricalDate;
    size?: "sm" | "md" | "lg" | "xl";
  }

  const props = withDefaults(defineProps<Props>(), {
    beginDate: () =>
      create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: 755,
        month: 12,
        day: 16,
        isLeapMonth: false,
        dynastyName: "",
        eraName: "",
        eraYear: 0,
      }),
    endDate: () =>
      create(HistoricalDateSchema, {
        calendarType: CalendarType.GREGORIAN,
        year: 755,
        month: 12,
        day: 16,
        isLeapMonth: false,
        dynastyName: "",
        eraName: "",
        eraYear: 0,
      }),
    size: "lg",
  });

  // Emits
  const emit = defineEmits<{
    "update:beginDate": [value: HistoricalDate];
    "update:endDate": [value: HistoricalDate];
    apply: [beginDate: HistoricalDate, endDate: HistoricalDate];
  }>();

  // 响应式数据
  const isOpen = ref(false);
  const selectedTab = ref<"calendar" | "periods">("calendar");
  const selectedCalendarType = ref<CalendarType>(CalendarType.GREGORIAN);
  const dateRange = ref({
    start: { ...props.beginDate },
    end: { ...props.endDate },
  });

  // 快速选择状态：记录当前是否使用快速选择的预设，以及预设名称
  const currentPresetName = ref<string>("");

  // 朝代和时代相关数据
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

  // 计算属性
  const isValidRange = computed(() => {
    return (
      HistoricalDateUtils.isValid(dateRange.value.start) &&
      HistoricalDateUtils.isValid(dateRange.value.end)
    );
  });

  // 根据size计算容器样式类
  const containerClass = computed(() => {
    const sizeMap = {
      sm: "max-w-md min-w-[320px]", // 320px ~ 448px
      md: "max-w-lg min-w-[400px]", // 400px ~ 512px
      lg: "max-w-2xl min-w-[480px]", // 480px ~ 672px
      xl: "max-w-4xl min-w-[600px]", // 600px ~ 896px
    };
    return `historical-date-selector relative w-full ${sizeMap[props.size]}`;
  });

  // 根据当前状态获取显示文本
  const getDisplayText = () => {
    return HistoricalDateUtils.getDisplayText(
      dateRange.value.start,
      dateRange.value.end,
      selectedCalendarType.value,
      currentPresetName.value,
    );
  };

  // 方法
  const toggleCollapse = (event: Event) => {
    const target = event.target as HTMLInputElement;
    isOpen.value = target.checked;
  };

  const closeCollapse = () => {
    isOpen.value = false;
  };

  const updateStartDate = (date: HistoricalDate) => {
    dateRange.value.start = { ...date, calendarType: selectedCalendarType.value };
    // 手动修改日期时清除预设状态
    currentPresetName.value = "";
    emit("update:beginDate", dateRange.value.start);
  };

  const updateEndDate = (date: HistoricalDate) => {
    dateRange.value.end = { ...date, calendarType: selectedCalendarType.value };
    // 手动修改日期时清除预设状态
    currentPresetName.value = "";
    emit("update:endDate", dateRange.value.end);
  };

  // 朝代选择处理
  const onDynastySelected = async (dynastyName: string, option: any) => {
    console.log("朝代选择事件触发:", dynastyName, option);

    // 查找选中朝代的详细信息
    const selectedDynastyData = dynasties.value.find((d) => d.name === dynastyName);
    if (selectedDynastyData) {
      currentPeriods.value = selectedDynastyData.periods;
      console.log(
        "找到朝代数据:",
        selectedDynastyData.name,
        "时代数量:",
        selectedDynastyData.periods.length,
      );
    } else {
      currentPeriods.value = [];
      console.log("未找到朝代数据:", dynastyName);
    }
  };

  // 应用时代范围
  const applyPeriodRange = (period: Period) => {
    if (!period.start || !period.end) return;

    // 应用选中的时代日期范围
    dateRange.value = {
      start: period.start,
      end: period.end,
    };
    // 设置当前预设名称，用于显示文本
    currentPresetName.value = period.name;

    // 根据时代的日期类型设置纪年方式并切换到日历标签页
    selectedCalendarType.value = period.start.calendarType;
    selectedTab.value = "calendar";

    emit("update:beginDate", period.start);
    emit("update:endDate", period.end);
    closeCollapse();
  };

  const reset = () => {
    const defaultType = CalendarType.GREGORIAN;
    selectedCalendarType.value = defaultType;
    const defaultStart = HistoricalDateUtils.createDefaultDate(defaultType);
    const defaultEnd = HistoricalDateUtils.createDefaultDate(defaultType);

    dateRange.value = {
      start: defaultStart,
      end: defaultEnd,
    };

    // 重置时清除预设状态
    currentPresetName.value = "";
    emit("update:beginDate", defaultStart);
    emit("update:endDate", defaultEnd);
  };

  const apply = () => {
    if (isValidRange.value) {
      emit("apply", dateRange.value.start, dateRange.value.end);
    }
  };

  const applyAndClose = () => {
    if (isValidRange.value) {
      emit("apply", dateRange.value.start, dateRange.value.end);
      closeCollapse();
    }
  };

  // 监听日历类型变化，更新日期格式
  const updateCalendarType = (newType: CalendarType) => {
    const defaultStart = HistoricalDateUtils.createDefaultDate(newType);
    const defaultEnd = HistoricalDateUtils.createDefaultDate(newType);

    dateRange.value = {
      start: { ...defaultStart, calendarType: newType },
      end: { ...defaultEnd, calendarType: newType },
    };

    // 切换日历类型时清除预设状态
    currentPresetName.value = "";
    emit("update:beginDate", dateRange.value.start);
    emit("update:endDate", dateRange.value.end);
  };

  // 键盘事件处理
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen.value) {
      closeCollapse();
    }
  };

  // 生命周期
  watch(selectedCalendarType, updateCalendarType);

  onMounted(async () => {
    document.addEventListener("keydown", handleKeydown);

    // 加载朝代数据
    try {
      dynasties.value = await dynastyServiceClient.getAllDynasties();
    } catch (error) {
      console.error("加载朝代数据失败:", error);
    }
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
  .historical-date-selector {
    z-index: 40;
  }

  /* 自定义collapse样式 */
  .collapse {
    position: relative;
    z-index: 50;
  }
</style>
