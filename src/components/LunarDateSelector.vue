<template>
  <div class="lunar-date-selector w-full">
    <div class="flex items-center gap-2 w-full">
      <!-- 年份输入 -->
      <div class="flex items-center gap-1">
        <input
          type="number"
          :value="year"
          @input="onYearChange"
          @focus="handleInputFocus"
          placeholder="年"
          min="1"
          :max="3000"
          class="input input-bordered input-sm text-center w-20"
        />
        <span class="text-sm font-medium text-base-content">年</span>
      </div>

      <!-- 月份输入 -->
      <div class="flex items-center gap-1">
        <SearchableSelect
          :model-value="month"
          :options="lunarMonthOptions"
          placeholder="月"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-21"
          @change="onMonthChange"
        />
      </div>

      <!-- 日期输入 -->
      <div class="flex items-center gap-1">
        <SearchableSelect
          :model-value="day"
          :options="lunarDayOptions"
          placeholder="日"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-21"
          @change="onDayChange"
        />
      </div>

      <!-- 闰月选项 -->
      <div class="form-control w-fit">
        <label class="label cursor-pointer p-0 gap-2">
          <input
            type="checkbox"
            v-model="isLeapMonth"
            @change="onLeapMonthChange"
            class="toggle toggle-sm toggle-primary"
          />
          <span class="label-text text-sm">闰月</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { CalendarType, type HistoricalDate, HistoricalDateSchema } from "@/connects/common_pb";
import { create } from "@bufbuild/protobuf";
import { DateInputUtils } from "@/utils/DateInputUtils";
import SearchableSelect from "./SearchableSelect.vue";

// Props
interface Props {
  value: HistoricalDate;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:value": [value: HistoricalDate];
}>();

// 响应式数据
const year = ref<number>();
const month = ref<number>();
const day = ref<number>();
const isLeapMonth = ref(false);

// 农历月份选项
const lunarMonthOptions = computed(() => {
  return DateInputUtils.LUNAR_MONTHS.map((month, index) => ({
    value: index + 1,
    label: month,
    searchValues: [month, (index + 1).toString()],
  }));
});

// 农历日期选项
const lunarDayOptions = computed(() => {
  return DateInputUtils.LUNAR_DAYS.map((day, index) => ({
    value: index + 1,
    label: day,
    searchValues: [day, (index + 1).toString()],
  }));
});

// 处理input获得焦点时自动全选
const handleInputFocus = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement;
  setTimeout(() => {
    input.select();
  }, 0);
};

// 事件处理
const onYearChange = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value);
  year.value = isNaN(value) ? undefined : value;
  updateValue();
};

const onMonthChange = (value: number | undefined) => {
  month.value = value;
  updateValue();
};

const onDayChange = (value: number | undefined) => {
  day.value = value;
  updateValue();
};

const onLeapMonthChange = () => {
  updateValue();
};

// 更新值
const updateValue = () => {
  if (!year.value || year.value <= 0) return;

  const newDate = create(HistoricalDateSchema, {
    calendarType: CalendarType.LUNAR,
    year: year.value,
    month: month.value || 0,
    day: day.value || 0,
    isLeapMonth: isLeapMonth.value,
    dynastyName: "",
    emperorId: "",
    eraName: "",
    eraYear: 0,
  });

  emit("update:value", newDate);
};

// 初始化数据
const initializeData = () => {
  const value = props.value;
  if (!value || value.calendarType !== CalendarType.LUNAR) return;

  year.value = value.year > 0 ? value.year : undefined;
  month.value = value.month || undefined;
  day.value = value.day || undefined;
  isLeapMonth.value = value.isLeapMonth;
};

// 监听props变化
watch(() => props.value, initializeData, { immediate: true });

// 组件挂载时初始化
onMounted(() => {
  initializeData();
});
</script>

<style scoped>
.lunar-date-selector {
  /* 农历选择器样式 */
}
</style> 