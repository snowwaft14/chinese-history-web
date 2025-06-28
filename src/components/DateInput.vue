<template>
  <div :class="['date-input-component', isEraType ? 'min-w-[320px]' : 'min-w-[360px]']">
    <div class="flex flex-col gap-3">
      <!-- 主要输入区域 -->
      <div
        :class="
          isEraType ? 'flex items-center gap-1 flex-nowrap' : 'flex items-center gap-3 flex-wrap'
        "
      >
        <!-- 年号类型：所有字段在同一行 -->
        <template v-if="isEraType">
          <select
            v-model="dynastyName"
            @change="updateDate"
            class="select select-bordered select-sm w-20 text-center text-xs"
          >
            <option disabled value="">朝</option>
            <option v-for="dynasty in dynastyNames" :key="dynasty" :value="dynasty">
              {{ dynasty }}
            </option>
          </select>

          <select
            v-model="eraName"
            @change="updateDate"
            class="select select-bordered select-sm w-20 text-center text-xs"
          >
            <option disabled value="">年号</option>
            <option v-for="era in eras" :key="era.name" :value="era.name">
              {{ era.name }}
            </option>
          </select>

          <input
            type="number"
            v-model="eraYear"
            @input="updateDate"
            placeholder="3"
            min="1"
            max="50"
            class="input input-bordered input-sm w-12 text-center text-xs"
          />
          <span class="text-xs text-base-content whitespace-nowrap">年</span>

          <select
            :value="monthValue"
            @change="onMonthChange"
            class="select select-bordered select-sm w-18 text-center text-xs"
          >
            <option disabled value="">月</option>
            <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>

          <select
            :value="dayValue"
            @change="onDayChange"
            class="select select-bordered select-sm w-18 text-center text-xs"
          >
            <option disabled value="">日</option>
            <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
              {{ day }}
            </option>
          </select>
        </template>

        <!-- 非年号类型：正常布局 -->
        <template v-else>
          <!-- 年份输入 -->
          <div class="flex items-center gap-1">
            <input
              type="number"
              :value="yearValue"
              @input="onYearChange"
              :placeholder="yearPlaceholder"
              :min="yearMin"
              :max="yearMax"
              class="input input-bordered input-sm w-20 text-center"
            />
            <span class="text-sm font-medium text-base-content">年</span>
          </div>

          <!-- 月份输入 -->
          <div class="flex items-center gap-1">
            <input
              v-if="isGregorianType"
              type="number"
              :value="monthValue"
              @input="onMonthChange"
              placeholder="12"
              min="1"
              max="12"
              class="input input-bordered input-sm w-16 text-center"
            />
            <select
              v-else
              :value="monthValue"
              @change="onMonthChange"
              class="select select-bordered select-sm w-20 text-center"
            >
              <option disabled value="">月</option>
              <option v-for="(month, index) in lunarMonths" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
            <span v-if="isGregorianType" class="text-sm font-medium text-base-content">月</span>
          </div>

          <!-- 日期输入 -->
          <div class="flex items-center gap-1">
            <input
              v-if="isGregorianType"
              type="number"
              :value="dayValue"
              @input="onDayChange"
              placeholder="16"
              min="1"
              max="31"
              class="input input-bordered input-sm w-16 text-center"
            />
            <select
              v-else
              :value="dayValue"
              @change="onDayChange"
              class="select select-bordered select-sm w-20 text-center"
            >
              <option disabled value="">日</option>
              <option v-for="(day, index) in lunarDays" :key="index" :value="index + 1">
                {{ day }}
              </option>
            </select>
            <span v-if="isGregorianType" class="text-sm font-medium text-base-content">日</span>
          </div>
        </template>
      </div>

      <!-- 选项区域 -->
      <div class="flex items-center gap-4" v-if="hasOptions">
        <!-- 公元前选项（阳历和农历） -->
        <div v-if="!isEraType" class="form-control w-fit">
          <label class="label cursor-pointer p-0 gap-2">
            <input
              type="checkbox"
              v-model="isBC"
              @change="updateDate"
              class="toggle toggle-sm toggle-primary"
            />
            <span class="label-text text-sm">公元前</span>
          </label>
        </div>

        <!-- 闰月选项（农历和年号） -->
        <div v-if="!isGregorianType" class="form-control w-fit">
          <label class="label cursor-pointer p-0 gap-2">
            <input
              type="checkbox"
              v-model="isLeapMonth"
              @change="updateDate"
              class="toggle toggle-sm toggle-secondary"
            />
            <span class="label-text text-sm">闰月</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import { CalendarType, type HistoricalDate } from "@/connects/common_pb";
  import { DateInputUtils } from "@/utils/DateInputUtils";
  import { ERAS } from "../models/historical-data.ts";

  // Props
  interface Props {
    value: HistoricalDate;
  }

  const props = defineProps<Props>();

  // Emits
  const emit = defineEmits<{
    "update:value": [value: HistoricalDate];
  }>();

  //是否是公元前
  const isBC = ref(false);

  //是否是闰月
  const isLeapMonth = ref(false);

  // 阳历相关响应式数据
  const gregorianYear = ref<number>();
  const gregorianMonth = ref<number>();
  const gregorianDay = ref<number>();

  // 农历相关响应式数据，公元8年 闰 五月初六
  const lunarYear = ref<number>();
  const lunarMonth = ref<number>();
  const lunarDay = ref<number>();

  // 年号相关响应式数据，唐 太宗 贞观 3年 闰 四月 初八
  const dynastyName = ref<string>();
  const emperorId = ref<string>();
  const eraName = ref<string>();
  const eraYear = ref<number>();
  const eraMonth = ref<number>();
  const eraDay = ref<number>();

  // 朝代数据
  const dynastyNames = ref<string[]>([]);

  // 年号数据
  const eraNames = ref<string[]>([]);
  const loadingEras = ref(false);

  // 计算属性
  const eras = computed(() => eraNames.value.map((name) => ({ name })));
  const { lunarMonths, lunarDays } = DateInputUtils.getLunarDate();

  // 类型判断计算属性
  const isGregorianType = computed(() => props.value.calendarType === CalendarType.GREGORIAN);
  const isLunarType = computed(() => props.value.calendarType === CalendarType.LUNAR);
  const isEraType = computed(() => props.value.calendarType === CalendarType.ERA);

  // 是否有选项区域
  const hasOptions = computed(() => !isGregorianType.value || !isEraType.value);

  // 统一的值计算属性
  const yearValue = computed(() => {
    if (isGregorianType.value) return gregorianYear.value;
    if (isLunarType.value) return lunarYear.value;
    return undefined;
  });

  const monthValue = computed(() => {
    if (isGregorianType.value) return gregorianMonth.value;
    if (isLunarType.value) return lunarMonth.value;
    if (isEraType.value) return eraMonth.value;
    return undefined;
  });

  const dayValue = computed(() => {
    if (isGregorianType.value) return gregorianDay.value;
    if (isLunarType.value) return lunarDay.value;
    if (isEraType.value) return eraDay.value;
    return undefined;
  });

  // 年份相关属性
  const yearPlaceholder = computed(() => (isGregorianType.value ? "755" : "755"));
  const yearMin = computed(() => (isGregorianType.value ? 0 : 1));
  const yearMax = computed(() => (isGregorianType.value ? 1840 : 3000));

  // 统一的输入事件处理
  const onYearChange = (event: Event) => {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (isGregorianType.value) {
      gregorianYear.value = value;
    } else if (isLunarType.value) {
      lunarYear.value = value;
    }
    updateDate();
  };

  const onMonthChange = (event: Event) => {
    const value = parseInt((event.target as HTMLInputElement | HTMLSelectElement).value);
    if (isGregorianType.value) {
      gregorianMonth.value = value;
    } else if (isLunarType.value) {
      lunarMonth.value = value;
    } else if (isEraType.value) {
      eraMonth.value = value;
    }
    updateDate();
  };

  const onDayChange = (event: Event) => {
    const value = parseInt((event.target as HTMLInputElement | HTMLSelectElement).value);
    if (isGregorianType.value) {
      gregorianDay.value = value;
    } else if (isLunarType.value) {
      lunarDay.value = value;
    } else if (isEraType.value) {
      eraDay.value = value;
    }
    updateDate();
  };

  // 统一的更新方法
  const updateDate = () => {
    if (isGregorianType.value) {
      updateGregorianDate();
    } else if (isLunarType.value) {
      updateLunarDate();
    } else if (isEraType.value) {
      updateEraDate();
    }
  };

  // 更新方法
  const updateGregorianDate = () => {
    if (!gregorianYear.value || !gregorianMonth.value || !gregorianDay.value) return;

    const year = isBC.value ? -gregorianYear.value : gregorianYear.value;

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.GREGORIAN,
      year: year,
      month: gregorianMonth.value,
      day: gregorianDay.value,
      isLeapMonth: false,
      dynastyName: "",
      eraName: "",
      eraYear: 0,
    };
    emit("update:value", newDate);
  };

  const updateLunarDate = () => {
    if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) return;

    const year = isBC.value ? -lunarYear.value : lunarYear.value;

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.LUNAR,
      year: year,
      month: lunarMonth.value,
      day: lunarDay.value,
      isLeapMonth: isLeapMonth.value,
      dynastyName: "",
      eraName: "",
      eraYear: 0,
    };
    emit("update:value", newDate);
  };

  const updateEraDate = () => {
    if (!eraName.value || !eraYear.value || !eraMonth.value || !eraDay.value || !dynastyName.value)
      return;

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.ERA,
      year: 0, // year 字段不再用于年号年份
      month: eraMonth.value,
      day: eraDay.value,
      isLeapMonth: isLeapMonth.value,
      dynastyName: dynastyName.value,
      eraName: eraName.value,
      eraYear: eraYear.value, // 使用新的 eraYear 字段
    };
    emit("update:value", newDate);
  };

  // 初始化数据
  const initializeData = () => {
    const value = props.value;
    if (!value) return;

    if (value.calendarType === CalendarType.GREGORIAN) {
      isBC.value = value.year < 0;
      gregorianYear.value = Math.abs(value.year);
      gregorianMonth.value = value.month;
      gregorianDay.value = value.day;
    } else if (value.calendarType === CalendarType.LUNAR) {
      isBC.value = value.year < 0;
      lunarYear.value = Math.abs(value.year);
      lunarMonth.value = value.month;
      lunarDay.value = value.day;
      isLeapMonth.value = value.isLeapMonth;
    } else if (value.calendarType === CalendarType.ERA) {
      eraName.value = value.eraName;
      dynastyName.value = value.dynastyName;
      eraYear.value = value.eraYear; // 优先使用 eraYear，如果没有则用 year（向后兼容）
      eraMonth.value = value.month;
      eraDay.value = value.day;
      isLeapMonth.value = value.isLeapMonth;
    }
  };

  // 加载朝代数据
  const loadDynasties = async () => {
    try {
      dynastyNames.value = await DateInputUtils.getDynastyNames();
      console.log("DateInput组件成功加载朝代:", dynastyNames.value);
    } catch (error) {
      console.error("DateInput组件加载朝代失败:", error);
    }
  };

  // 加载年号数据
  const loadEras = async (dynastyNameValue: string) => {
    if (!dynastyNameValue) {
      eraNames.value = [];
      return;
    }

    try {
      loadingEras.value = true;
      eraNames.value = await DateInputUtils.getEraNamesByDynasty(dynastyNameValue);
      console.log(`DateInput组件成功加载朝代 ${dynastyNameValue} 的年号:`, eraNames.value);
    } catch (error) {
      console.error(`DateInput组件加载朝代 ${dynastyNameValue} 的年号失败:`, error);
      eraNames.value = [];
    } finally {
      loadingEras.value = false;
    }
  };

  // 监听modelValue变化
  watch(() => props.value, initializeData, { immediate: true });

  // 监听dynastyName变化，自动加载年号
  watch(dynastyName, (newDynastyName) => {
    if (newDynastyName) {
      loadEras(newDynastyName);
      // 清空当前选中的年号，因为朝代变了
      eraName.value = "";
    } else {
      eraNames.value = [];
    }
  });

  // 组件挂载时加载朝代数据
  onMounted(() => {
    loadDynasties();
    // 如果初始化时已有朝代名称，也要加载对应的年号
    if (dynastyName.value) {
      loadEras(dynastyName.value);
    }
  });
</script>

<style scoped>
  select:disabled {
    cursor: not-allowed;
  }
</style>
