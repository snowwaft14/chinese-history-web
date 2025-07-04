<template>
  <div :class="containerClass">
    <!-- Collapse 组件 -->
    <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-box shadow-lg">
      <!-- Collapse 标题/触发器 -->
      <input type="checkbox" :checked="isOpen" @change="toggleCollapse" class="peer" />
      <div class="collapse-title text-sm font-medium text-left pr-4">
        <div class="truncate text-lg">
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
              currentPresetName = '';
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
              currentPresetName = '';
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
              currentPresetName = '';
            "
            :checked="selectedTab === 'calendar' && selectedCalendarType === CalendarType.ERA"
          />
          <input
            type="radio"
            name="my_tabs_2"
            class="tab"
            aria-label="时代"
            @click="
              selectedTab = 'periods';
            "
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
            <!-- 阳历选择器 -->
            <GregorianDateSelector
              v-if="selectedCalendarType === CalendarType.GREGORIAN"
              :value="gregorianDateRange.start"
              @update:value="updateGregorianStartDate"
            />
            <!-- 农历选择器 -->
            <LunarDateSelector
              v-else-if="selectedCalendarType === CalendarType.LUNAR"
              :value="lunarDateRange.start"
              @update:value="updateLunarStartDate"
            />
            <!-- 年号选择器 -->
            <EraDateSelector
              v-else-if="selectedCalendarType === CalendarType.ERA"
              :value="eraDateRange.start"
              @update:value="updateEraStartDate"
            />
            
            <!-- 结束日期 -->
            <div class="label">
              <span class="label-text font-medium text-primary">结束日期</span>
            </div>
            <!-- 阳历选择器 -->
            <GregorianDateSelector
              v-if="selectedCalendarType === CalendarType.GREGORIAN"
              :value="gregorianDateRange.end"
              @update:value="updateGregorianEndDate"
            />
            <!-- 农历选择器 -->
            <LunarDateSelector
              v-else-if="selectedCalendarType === CalendarType.LUNAR"
              :value="lunarDateRange.end"
              @update:value="updateLunarEndDate"
            />
            <!-- 年号选择器 -->
            <EraDateSelector
              v-else-if="selectedCalendarType === CalendarType.ERA"
              :value="eraDateRange.end"
              @update:value="updateEraEndDate"
            />
          </div>
        </div>

        <!-- 时代标签页内容 -->
        <div v-else-if="selectedTab === 'periods'" class="pt-2">
          <PeriodSelector
            @period-selected="onPeriodSelected"
          />
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
    name: "DateRangeSelector",
  };
</script>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from "vue";
  import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb.ts";
  import { type Period, type Dynasty } from "@/connects/dynasty_pb.ts";
  import { create } from "@bufbuild/protobuf";
  import GregorianDateSelector from "./GregorianDateSelector.vue";
  import LunarDateSelector from "./LunarDateSelector.vue";
  import EraDateSelector from "./EraDateSelector.vue";
  import PeriodSelector from "./PeriodSelector.vue";
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
        emperorId: "",
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
        emperorId: "",
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
  
  // 拆分为三个专用的日期范围对象
  const gregorianDateRange = ref({
    start: create(HistoricalDateSchema, {
      calendarType: CalendarType.GREGORIAN,
      year: 755,
      month: 12,
      day: 16,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
    end: create(HistoricalDateSchema, {
      calendarType: CalendarType.GREGORIAN,
      year: 763,
      month: 2,
      day: 17,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
  });

  const lunarDateRange = ref({
    start: create(HistoricalDateSchema, {
      calendarType: CalendarType.LUNAR,
      year: 755,
      month: 11,
      day: 9,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
    end: create(HistoricalDateSchema, {
      calendarType: CalendarType.LUNAR,
      year: 763,
      month: 1,
      day: 30,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
  });

  const eraDateRange = ref({
    start: create(HistoricalDateSchema, {
      calendarType: CalendarType.ERA,
      year: 0,
      month: 11,
      day: 9,
      isLeapMonth: false,
      dynastyName: "唐",
      emperorId: "玄宗",
      eraName: "天宝",
      eraYear: 14,
    }),
    end: create(HistoricalDateSchema, {
      calendarType: CalendarType.ERA,
      year: 0,
      month: 1,
      day: 30,
      isLeapMonth: false,
      dynastyName: "唐",
      emperorId: "唐代宗",
      eraName: "宝应",
      eraYear: 2,
    }),
  });  

  // 快速选择状态：记录当前是否使用快速选择的预设，以及预设名称
  const currentPresetName = ref<string>("");
  
  // 时代选择器的状态：存储选中的时代范围
  const periodDateRange = ref({
    start: create(HistoricalDateSchema, {
      calendarType: CalendarType.GREGORIAN,
      year: 755,
      month: 12,
      day: 16,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
    end: create(HistoricalDateSchema, {
      calendarType: CalendarType.GREGORIAN,
      year: 763,
      month: 2,
      day: 17,
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    }),
    periodName: "",
  });



  // 计算属性
  const isValidRange = computed(() => {
    const currentRange = getCurrentDateRange();
    return (
      HistoricalDateUtils.isValid(currentRange.start) &&
      HistoricalDateUtils.isValid(currentRange.end)
    );
  });

  // 获取当前选中的日期范围
  const getCurrentDateRange = () => {
    // 如果选择的是时代选项卡，返回时代日期范围
    if (selectedTab.value === 'periods') {
      return {
        start: periodDateRange.value.start,
        end: periodDateRange.value.end,
      };
    }

    switch (selectedCalendarType.value) {
      case CalendarType.GREGORIAN:
        return gregorianDateRange.value;
      case CalendarType.LUNAR:
        return lunarDateRange.value;
      case CalendarType.ERA:
        return eraDateRange.value;
      default:
        return gregorianDateRange.value;
    }
  };

  // 根据size计算容器样式类
  const containerClass = computed(() => {
    const sizeMap = {
      sm: "w-[420px]", // 固定 400px
      md: "w-[460px]", // 固定 480px
      lg: "w-[600px]", // 固定 560px
      xl: "w-[640px]", // 固定 640px
    };
    return `date-range-selector relative ${sizeMap[props.size]}`;
  });

  // 根据当前状态获取显示文本
  const getDisplayText = () => {
    const currentRange = getCurrentDateRange();
    return HistoricalDateUtils.getDisplayText(
      currentRange.start,
      currentRange.end,
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

  // 阳历日期更新方法
  const updateGregorianStartDate = (date: HistoricalDate) => {
    gregorianDateRange.value.start = { ...date };
    currentPresetName.value = "";
    emit("update:beginDate", gregorianDateRange.value.start);
  };

  const updateGregorianEndDate = (date: HistoricalDate) => {
    gregorianDateRange.value.end = { ...date };
    currentPresetName.value = "";
    emit("update:endDate", gregorianDateRange.value.end);
  };

  // 农历日期更新方法
  const updateLunarStartDate = (date: HistoricalDate) => {
    lunarDateRange.value.start = { ...date };
    currentPresetName.value = "";
    emit("update:beginDate", lunarDateRange.value.start);
  };

  const updateLunarEndDate = (date: HistoricalDate) => {
    lunarDateRange.value.end = { ...date };
    currentPresetName.value = "";
    emit("update:endDate", lunarDateRange.value.end);
  };

  // 年号日期更新方法
  const updateEraStartDate = (date: HistoricalDate) => {
    eraDateRange.value.start = { ...date };
    currentPresetName.value = "";
    emit("update:beginDate", eraDateRange.value.start);
  };

  const updateEraEndDate = (date: HistoricalDate) => {
    eraDateRange.value.end = { ...date };
    currentPresetName.value = "";
    emit("update:endDate", eraDateRange.value.end);
  };

  // 时代选择器相关方法
  const onPeriodSelected = (period: Period) => {
    applyPeriodRange(period);
  };

  // 应用时代范围
  const applyPeriodRange = (period: Period) => {
    if (!period.start || !period.end) return;

    // 更新时代日期范围
    periodDateRange.value = {
      start: { ...period.start },
      end: { ...period.end },
      periodName: period.name,
    };

    // 设置当前预设名称，用于显示文本
    currentPresetName.value = period.name;
    emit("update:beginDate", period.start);
    emit("update:endDate", period.end);
  };

  const reset = () => {
    const defaultType = CalendarType.GREGORIAN;
    selectedCalendarType.value = defaultType;

    const defaultStart = HistoricalDateUtils.createDefaultDate(defaultType);
    const defaultEnd = HistoricalDateUtils.createDefaultDate(defaultType);

    // 重置对应的日期范围对象
    gregorianDateRange.value = {
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
      const currentRange = getCurrentDateRange();
      emit("apply", currentRange.start, currentRange.end);
    }
  };

  const applyAndClose = () => {
    if (isValidRange.value) {
      const currentRange = getCurrentDateRange();
      emit("apply", currentRange.start, currentRange.end);
      closeCollapse();
    }
  };

  // 监听日历类型变化，更新日期格式
  const updateCalendarType = (newType: CalendarType) => {

    let defaultStart: HistoricalDate = HistoricalDateUtils.createDefaultDate(newType);
    let defaultEnd: HistoricalDate = HistoricalDateUtils.createDefaultDate(newType);

    switch(newType){
      case CalendarType.GREGORIAN:
        defaultStart = { ...gregorianDateRange.value.start, calendarType: CalendarType.GREGORIAN};
        defaultEnd = { ...gregorianDateRange.value.end, calendarType: CalendarType.GREGORIAN};
      break;
      case CalendarType.LUNAR:
        defaultStart = { ...lunarDateRange.value.start, calendarType: CalendarType.LUNAR};
        defaultEnd = { ...lunarDateRange.value.end, calendarType: CalendarType.LUNAR};
      break;
      case CalendarType.ERA:
        defaultStart = { ...eraDateRange.value.start, calendarType: CalendarType.ERA};
        defaultEnd = { ...eraDateRange.value.end, calendarType: CalendarType.ERA};
    }    

    // 切换日历类型时清除预设状态
    currentPresetName.value = "";
    emit("update:beginDate", defaultStart);
    emit("update:endDate", defaultEnd);
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
    // PeriodSelector组件会自己处理朝代数据加载
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
  .date-range-selector {
    z-index: 40;
  }

  /* 自定义collapse样式 */
  .collapse {
    position: relative;
    z-index: 50;
  }
</style>
