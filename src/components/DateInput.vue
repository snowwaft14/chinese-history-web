<template>
  <div class="date-input-component w-full">
    <!-- 年号类型：响应式布局，充分利用可用空间 -->
    <template v-if="isEraType">
      <div class="flex flex-wrap items-center gap-1 w-full">
        <SearchableSelect
          v-model="dynastyName"
          :options="dynastyOptions"
          placeholder="朝代"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-18"
          @change="onDynastyChange"
          @expand="onDynastyExpand"
        />

        <SearchableSelect
          v-model="emperorId"
          :options="emperorOptions"
          placeholder="皇帝"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-27"
          @change="onEmperorChange"
        />

        <SearchableSelect
          v-model="eraName"
          :options="eraOptions"
          placeholder="年号"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-24"
          @change="onEraChange"
        />

        <SearchableSelect
          v-model="eraYear"
          :options="eraYearOptions"
          placeholder="年"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-24"
          @change="onEraYearChange"
        />

        <SearchableSelect
          :model-value="monthValue"
          :options="lunarMonthOptions"
          placeholder="月"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-18"
          @change="onMonthChange"
        />

        <SearchableSelect
          :model-value="dayValue"
          :options="lunarDayOptions"
          placeholder="日"
          value-key="value"
          label-key="label"
          search-key="searchValues"
          input-class="input input-bordered input-sm text-left text-xs w-18"
          @change="onDayChange"
        />
      </div>
    </template>

    <!-- 非年号类型：响应式布局 -->
    <template v-else>
      <div class="flex items-center gap-2 w-full">
        <!-- 年份输入 -->
        <div class="flex items-center gap-1">
          <input
            type="number"
            :value="yearValue"
            @input="onYearChange"
            @focus="handleInputFocus"
            placeholder="年"
            min="1"
            :max="yearMax"
            class="input input-bordered input-sm text-center w-20"
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
            @focus="handleInputFocus"
            placeholder="月"
            min="1"
            max="12"
            class="input input-bordered input-sm text-center w-20"
          />
          <SearchableSelect
            v-else
            :model-value="monthValue"
            :options="lunarMonthOptions"
            placeholder="月"
            value-key="value"
            label-key="label"
            search-key="searchValues"
            input-class="input input-bordered input-sm text-left text-xs w-21"
            @change="onMonthChange"
          />
          <span v-if="isGregorianType" class="text-sm font-medium text-base-content">月</span>
        </div>

        <!-- 日期输入 -->
        <div class="flex items-center gap-1">
          <input
            v-if="isGregorianType"
            type="number"
            :value="dayValue"
            @input="onDayChange"
            @focus="handleInputFocus"
            placeholder="日"
            min="1"
            max="31"
            class="input input-bordered input-sm text-center flex-1 w-20"
          />
          <SearchableSelect
            v-else
            :model-value="dayValue"
            :options="lunarDayOptions"
            placeholder="日"
            value-key="value"
            label-key="label"
            search-key="searchValues"
            input-class="input input-bordered input-sm text-left text-xs w-21"
            @change="onDayChange"
          />
          <span v-if="isGregorianType" class="text-sm font-medium text-base-content">日</span>
        </div>
      </div>
    </template>
  </div>

  <!-- 选项区域 -->
  <div class="flex items-center gap-4" v-if="hasOptions">
    <!-- 公元前选项（仅阳历） -->
    <div v-if="isGregorianType" class="form-control w-fit">
      <label class="label cursor-pointer p-0 gap-2">
        <input
          type="checkbox"
          v-model="isBC"
          @change="onBCChange"
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
          @change="onLeapMonthChange"
          class="toggle toggle-sm toggle-primary"
        />
        <span class="label-text text-sm">闰月</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import { CalendarType, type HistoricalDate } from "@/connects/common_pb";
  import type { Dynasty, EraName, Emperor } from "@/connects/dynasty_pb";
  import { DateInputUtils } from "@/utils/DateInputUtils";
  import { GlobalCacheInstances } from "@/utils/GlobalCacheInstances";
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

  // 朝代数据 - 使用全局缓存
  const dynasties = ref<Dynasty[]>([]);
  // 皇帝数据 - 使用全局缓存
  const emperors = ref<Emperor[]>([]);
  const loadingEmperors = ref(false);

  // 年号数据 - 使用全局缓存
  const eras = ref<EraName[]>([]);
  const loadingEras = ref(false);

  // 当前选中的年号详情 - 使用全局缓存
  const currentEraDetail = ref<EraName | null>(null);

  // 计算属性
  const { lunarMonths, lunarDays } = DateInputUtils.getLunarDate();

  // 农历年份选项（支持公元前后）
  const lunarYearOptions = computed(() => {
    const options = [];
    for (let year = 1; year <= 3000; year++) {
      options.push({
        value: year,
        label: year.toString(),
        searchValues: [year.toString()],
      });
    }
    return options;
  });

  // 农历月份选项
  const lunarMonthOptions = computed(() => {
    return lunarMonths.value.map((month, index) => ({
      value: index + 1,
      label: month,
      searchValues: [month, (index + 1).toString()],
    }));
  });

  // 农历日期选项
  const lunarDayOptions = computed(() => {
    return lunarDays.value.map((day, index) => ({
      value: index + 1,
      label: day,
      searchValues: [day, (index + 1).toString()],
    }));
  });

  // 年号年份选项
  const eraYearOptions = computed(() => {
    if (!eraName.value || !dynastyName.value || !currentEraDetail.value) {
      return [];
    }

    // 如果有年号详情，根据实际时间范围生成选项
    if (currentEraDetail.value.startDate && currentEraDetail.value.endDate) {
      const startYear = currentEraDetail.value.startDate.year;
      const endYear = currentEraDetail.value.endDate.year;

      // 计算年号持续的年数
      const yearCount = endYear - startYear + 1;

      console.log(`年号 ${eraName.value} 的时间范围: ${startYear}-${endYear}年，共${yearCount}年`);

      return DateInputUtils.generateEraYearOptions(eraName.value, startYear, endYear);
    }

    // 降级方案：使用默认的1-61年
    const options = [];
    for (let year = 1; year <= 61; year++) {
      const chineseYear = DateInputUtils.numberToEraYear(year, eraName.value);
      options.push({
        value: year,
        label: chineseYear,
        searchValues: [year.toString(), chineseYear, chineseYear.replace(/[年载]$/, "")],
      });
    }
    return options;
  });

  // SearchableSelect的选项数据 - 直接使用完整对象，保留searchValues
  const dynastyOptions = computed(() =>
    dynasties.value.map((dynasty) => ({
      value: dynasty.name,
      label: dynasty.name,
      searchValues: dynasty.searchValues,
    })),
  );

  const emperorOptions = computed(() =>
    emperors.value.map((emperor) => ({
      value: emperor.id,
      label: emperor.id,
      searchValues: emperor.searchValues,
    })),
  );

  const eraOptions = computed(() =>
    eras.value.map((era) => ({
      value: era.name,
      label: era.name,
      searchValues: era.searchValues,
    })),
  );

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
  const yearMax = computed(() => (isBC.value ? 4000 : 1839));

  // 处理input获得焦点时自动全选
  const handleInputFocus = (event: FocusEvent) => {
    const input = event.target as HTMLInputElement;
    // 使用setTimeout确保focus事件完成后再选择文本
    setTimeout(() => {
      input.select();
    }, 0);
  };

  // 统一的输入事件处理
  const onYearChange = async (eventOrValue: Event | number | undefined) => {
    let value: number | undefined;

    if (typeof eventOrValue === "number") {
      // 来自SearchableSelect的change事件
      value = eventOrValue;
    } else if (eventOrValue === undefined || eventOrValue === null) {
      // 来自SearchableSelect的清除事件
      value = undefined;
    } else if (eventOrValue && typeof eventOrValue === "object" && "target" in eventOrValue) {
      // 来自input的input事件
      value = parseInt((eventOrValue.target as HTMLInputElement).value);
    } else {
      console.warn("onYearChange: 未知的参数类型", eventOrValue);
      return;
    }

    if (isGregorianType.value) {
      gregorianYear.value = value;
    } else if (isLunarType.value) {
      lunarYear.value = value;
    }
    await updateDate();
  };

  // SearchableSelect事件处理
  const onDynastyExpand = async () => {
    console.log("朝代下拉框展开，重新加载朝代数据...");
    await loadDynasties();
  };

  const onDynastyChange = async (value: string | undefined) => {
    dynastyName.value = value || ""; // 将undefined转换为空字符串
    emperorId.value = ""; // 清空皇帝选择
    eraName.value = ""; // 清空年号选择
    eraYear.value = undefined; // 清空年号年份
    eraMonth.value = undefined; // 清空年号月份
    eraDay.value = undefined; // 清空年号日期

    await updateDate();

    // 加载该朝代的皇帝列表（使用全局缓存）
    if (value) {
      try {
        loadingEmperors.value = true;
        emperors.value = await GlobalCacheInstances.getEmperorsByDynasty(value);
        console.log(
          `DateInput组件成功从缓存加载朝代 ${value} 的皇帝:`,
          emperors.value.map((e) => e.id),
        );
      } catch (error) {
        console.error(`DateInput组件加载朝代 ${value} 的皇帝失败:`, error);
        emperors.value = [];
      } finally {
        loadingEmperors.value = false;
      }
    } else {
      emperors.value = [];
    }
  };

  const onEmperorChange = async (value: string | undefined) => {
    emperorId.value = value || ""; // 将undefined转换为空字符串
    eraName.value = ""; // 清空年号选择
    eraYear.value = undefined; // 清空年号年份
    eraMonth.value = undefined; // 清空年号月份
    eraDay.value = undefined; // 清空年号日期

    await updateDate();

    // 加载该皇帝的年号（使用全局缓存）
    if (value) {
      try {
        loadingEras.value = true;
        eras.value = await GlobalCacheInstances.getErasByEmperor(value);
        console.log(
          `DateInput组件成功从缓存加载皇帝 ${value} 的年号:`,
          eras.value.map((e) => e.name),
        );
      } catch (error) {
        console.error(`DateInput组件加载皇帝 ${value} 的年号失败:`, error);
        eras.value = [];
      } finally {
        loadingEras.value = false;
      }
    } else {
      eras.value = [];
    }
  };

  const onEraChange = async (value: string | undefined) => {
    eraName.value = value || ""; // 将undefined转换为空字符串
    eraYear.value = undefined; // 清空年号年份
    eraMonth.value = undefined; // 清空年号月份
    eraDay.value = undefined; // 清空年号日期

    await updateDate();

    // 获取年号详情，用于计算年份范围（使用全局缓存）
    if (value && dynastyName.value) {
      try {
        console.log(`开始从缓存获取年号 ${value} 的详情...`);
        currentEraDetail.value = await GlobalCacheInstances.getEraDetail(dynastyName.value, value);

        if (currentEraDetail.value) {
          console.log(`成功从缓存获取年号 ${value} 的详情:`, {
            name: currentEraDetail.value.name,
            startDate: currentEraDetail.value.startDate,
            endDate: currentEraDetail.value.endDate,
            note: currentEraDetail.value.note,
          });
        } else {
          console.warn(`未找到年号 ${value} 的详情`);
        }
      } catch (error) {
        console.error(`获取年号 ${value} 详情失败:`, error);
        currentEraDetail.value = null;
      }
    } else {
      currentEraDetail.value = null;
    }
  };

  const onEraYearChange = async (value: number | undefined) => {
    eraYear.value = value;
    await updateDate();
  };

  const onBCChange = async () => {
    await updateDate();
  };

  const onLeapMonthChange = async () => {
    await updateDate();
  };

  const onMonthChange = async (eventOrValue: Event | number | undefined) => {
    let value: number | undefined;

    if (typeof eventOrValue === "number") {
      // 来自SearchableSelect的change事件
      value = eventOrValue;
    } else if (eventOrValue === undefined || eventOrValue === null) {
      // 来自SearchableSelect的清除事件
      value = undefined;
    } else if (eventOrValue && typeof eventOrValue === "object" && "target" in eventOrValue) {
      // 来自input/select的change事件
      value = parseInt((eventOrValue.target as HTMLInputElement | HTMLSelectElement).value);
    } else {
      console.warn("onMonthChange: 未知的参数类型", eventOrValue);
      return;
    }

    if (isGregorianType.value) {
      gregorianMonth.value = value;
      // 如果没有设置日期，清空日期（让用户可以选择不完整的日期）
      if (!gregorianDay.value) {
        gregorianDay.value = undefined;
      }
    } else if (isLunarType.value) {
      lunarMonth.value = value;
      // 如果没有设置日期，清空日期
      if (!lunarDay.value) {
        lunarDay.value = undefined;
      }
    } else if (isEraType.value) {
      eraMonth.value = value;
      // 如果没有设置日期，清空日期
      if (!eraDay.value) {
        eraDay.value = undefined;
      }
    }
    await updateDate();
  };

  const onDayChange = async (eventOrValue: Event | number | undefined) => {
    let value: number | undefined;

    if (typeof eventOrValue === "number") {
      // 来自SearchableSelect的change事件
      value = eventOrValue;
    } else if (eventOrValue === undefined || eventOrValue === null) {
      // 来自SearchableSelect的清除事件
      value = undefined;
    } else if (eventOrValue && typeof eventOrValue === "object" && "target" in eventOrValue) {
      // 来自input/select的change事件
      value = parseInt((eventOrValue.target as HTMLInputElement | HTMLSelectElement).value);
    } else {
      console.warn("onDayChange: 未知的参数类型", eventOrValue);
      return;
    }

    if (isGregorianType.value) {
      gregorianDay.value = value;
    } else if (isLunarType.value) {
      lunarDay.value = value;
    } else if (isEraType.value) {
      eraDay.value = value;
    }
    await updateDate();
  };

  // 统一的更新方法
  const updateDate = async () => {
    if (isGregorianType.value) {
      updateGregorianDate();
    } else if (isLunarType.value) {
      updateLunarDate();
    } else if (isEraType.value) {
      await updateEraDate();
    }
  };

  // 更新方法
  const updateGregorianDate = () => {
    if (!gregorianYear.value) return; // 只要有年份就可以创建公历日期

    const year = isBC.value ? -gregorianYear.value : gregorianYear.value;

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.GREGORIAN,
      year: year,
      month: gregorianMonth.value || 0, // 0表示未选择月份，格式化时会显示为1月
      day: gregorianDay.value || 0, // 0表示未选择日期，格式化时会显示为1日
      isLeapMonth: false,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    };
    emit("update:value", newDate);
  };

  const updateLunarDate = () => {
    if (!lunarYear.value) return; // 只要有年份就可以创建农历日期

    const year = isBC.value ? -lunarYear.value : lunarYear.value;

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.LUNAR,
      year: year,
      month: lunarMonth.value || 0, // 0表示未选择月份，格式化时会显示为正月
      day: lunarDay.value || 0, // 0表示未选择日期，格式化时会显示为初一
      isLeapMonth: isLeapMonth.value,
      dynastyName: "",
      emperorId: "",
      eraName: "",
      eraYear: 0,
    };
    emit("update:value", newDate);
  };

  const updateEraDate = async () => {
    // 只要有朝代名称就可以创建基本的年号日期
    if (!dynastyName.value || !emperorId.value) return;

    let newEraName = eraName.value;
    if (!eraName.value) {
      const eras = await GlobalCacheInstances.getErasByEmperor(emperorId.value);
      if (eras && eras.length > 0) {
        newEraName = eras[0].name;
      }
    }

    const newDate: HistoricalDate = {
      ...props.value,
      calendarType: CalendarType.ERA,
      year: 0, // year 字段不再用于年号年份
      month: eraMonth.value || 0,
      day: eraDay.value || 0,
      isLeapMonth: isLeapMonth.value,
      dynastyName: dynastyName.value,
      emperorId: emperorId.value,
      eraName: newEraName || "",
      eraYear: eraYear.value || 0,
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
      emperorId.value = value.emperorId;
      eraYear.value = value.eraYear; // 优先使用 eraYear，如果没有则用 year（向后兼容）
      eraMonth.value = value.month;
      eraDay.value = value.day;
      isLeapMonth.value = value.isLeapMonth;
    }
  };

  // 加载朝代数据（使用全局缓存）
  const loadDynasties = async () => {
    try {
      dynasties.value = await GlobalCacheInstances.getAllDynasties();
      console.log(
        "DateInput组件成功从缓存加载朝代:",
        dynasties.value.map((d) => d.name),
      );
    } catch (error) {
      console.error("DateInput组件加载朝代失败:", error);
    }
  };

  // 监听modelValue变化
  //watch(() => props.value, initializeData, { immediate: true });

  // 监听dynastyName变化，自动加载皇帝
  watch(dynastyName, (newDynastyName) => {
    if (newDynastyName) {
      onDynastyChange(newDynastyName);
    } else {
      emperors.value = [];
      eras.value = [];
    }
  });

  // 监听emperorId变化，自动加载年号
  watch(emperorId, (newEmperorId) => {
    if (newEmperorId) {
      onEmperorChange(newEmperorId);
    } else {
      eras.value = [];
    }
  });

  // 组件挂载时加载朝代数据
  onMounted(() => {
    loadDynasties();
    // 如果初始化时已有朝代名称，也要加载对应的皇帝
    if (dynastyName.value) {
      onDynastyChange(dynastyName.value);
    }
  });
</script>

<style scoped>
  select:disabled {
    cursor: not-allowed;
  }
</style>
