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
            @click="selectedCalendarType = CalendarType.GREGORIAN"
            :checked="selectedCalendarType === CalendarType.GREGORIAN"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="农历"
            @click="selectedCalendarType = CalendarType.LUNAR"
            :checked="selectedCalendarType === CalendarType.LUNAR"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="年号"
            @click="selectedCalendarType = CalendarType.ERA"
            :checked="selectedCalendarType === CalendarType.ERA"
          />
        </div>
        <!-- 时间范围选择 -->
        <div class="pt-2">
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

        <!-- 快速选择列表 -->
        <div class="pt-2">
          <div class="card bg-base-200 card-body p-3">
            <div class="label">
              <span class="label-text font-medium text-primary">快速选择</span>
            </div>
            <div class="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              <button
                v-for="preset in presetRanges"
                :key="preset.name"
                @click="applyPresetRange(preset)"
                class="btn btn-ghost btn-sm w-full justify-start text-left p-3 h-auto normal-case"
              >
                <div class="w-full">
                  <div class="font-medium text-base-content mb-1">
                    {{ preset.name }}
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ preset.description }}
                  </div>
                </div>
              </button>
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
  import { type HistoricalDateRange } from "@/models/historical-date";
  import { PERIOD_RANGES } from "@/models/historical-data";
  import { create } from "@bufbuild/protobuf";
  import DateInput from "./DateInput.vue";
  import { HistoricalDateUtils } from "../utils/HistoricalDateUtils.ts";

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
  const selectedCalendarType = ref<CalendarType>(CalendarType.GREGORIAN);
  const dateRange = ref<HistoricalDateRange>({
    start: { ...props.beginDate },
    end: { ...props.endDate },
  });

  // 快速选择状态：记录当前是否使用快速选择的预设，以及预设名称
  const currentPresetName = ref<string>("");

  // 预设时间段 - 转换为新格式
  const presetRanges = computed(() =>
    PERIOD_RANGES.map((period) => {
      // 解析 ISO 日期格式 (例如: "0755-12-16")
      const parseISODate = (dateStr: string) => {
        const parts = dateStr.split("-");
        return {
          year: parseInt(parts[0]),
          month: parseInt(parts[1]),
          day: parseInt(parts[2]),
        };
      };

      const startParts = parseISODate(period.startDate);
      const endParts = parseISODate(period.endDate);

      return {
        name: period.name,
        description: period.description,
        start: create(HistoricalDateSchema, {
          calendarType: CalendarType.GREGORIAN,
          year: startParts.year,
          month: startParts.month,
          day: startParts.day,
          isLeapMonth: false,
          dynastyName: "",
          eraName: "",
          eraYear: 0,
        }),
        end: create(HistoricalDateSchema, {
          calendarType: CalendarType.GREGORIAN,
          year: endParts.year,
          month: endParts.month,
          day: endParts.day,
          isLeapMonth: false,
          dynastyName: "",
          eraName: "",
          eraYear: 0,
        }),
      };
    }),
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

  const applyPresetRange = (preset: any) => {
    // 点击快速选择后收起面板，但不改变纪年方式
    dateRange.value = {
      start: preset.start,
      end: preset.end,
    };
    // 设置当前预设名称，用于显示文本
    currentPresetName.value = preset.name;
    emit("update:beginDate", preset.start);
    emit("update:endDate", preset.end);
    closeCollapse();
    //selectedCalendarType.value = CalendarType.GREGORIAN;
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
  .historical-date-selector {
    z-index: 40;
  }

  /* 自定义collapse样式 */
  .collapse {
    position: relative;
    z-index: 50;
  }
</style>
