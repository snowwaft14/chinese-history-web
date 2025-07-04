<template>
  <div class="era-date-selector w-full">
    <!-- 年号类型：响应式布局，充分利用可用空间 -->
    <div class="flex flex-wrap items-center gap-1 w-full">
      <SearchableSelect
        v-model="dynastyName"
        :options="dynastyOptions"
        placeholder="朝代"
        value-key="value"
        label-key="label"
        search-key="searchValues"
        input-class="input input-bordered input-sm text-left text-xs w-24"
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
        input-class="input input-bordered input-sm text-left text-xs w-28"
        @change="onEmperorChange"
      />

      <SearchableSelect
        v-model="eraName"
        :options="eraOptions"
        placeholder="年号"
        value-key="value"
        label-key="label"
        search-key="searchValues"
        input-class="input input-bordered input-sm text-left text-xs w-26"
        @change="onEraChange"
      />      
    </div>

    <div class="flex flex-wrap items-center gap-1 w-full pt-2">
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
        :model-value="month"
        :options="lunarMonthOptions"
        placeholder="月"
        value-key="value"
        label-key="label"
        search-key="searchValues"
        input-class="input input-bordered input-sm text-left text-xs w-28"
        @change="onMonthChange"
      />

      <SearchableSelect
        :model-value="day"
        :options="lunarDayOptions"
        placeholder="日"
        value-key="value"
        label-key="label"
        search-key="searchValues"
        input-class="input input-bordered input-sm text-left text-xs w-26"
        @change="onDayChange"
      />

      <!-- 闰月选项 -->
      <div class="form-control w-fit">
        <label class="label cursor-pointer">
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
import type { Dynasty, EraName, Emperor } from "@/connects/dynasty_pb";
import { create } from "@bufbuild/protobuf";
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

// 响应式数据
const dynastyName = ref<string>();
const emperorId = ref<string>();
const eraName = ref<string>();
const eraYear = ref<number>();
const month = ref<number>();
const day = ref<number>();
const isLeapMonth = ref(false);

// 朝代数据 - 使用全局缓存
const dynasties = ref<Dynasty[]>([]);
// 皇帝数据 - 使用全局缓存
const emperors = ref<Emperor[]>([]);
// 年号数据 - 使用全局缓存
const eras = ref<EraName[]>([]);

const isLoading = ref(false);

// 当前选中的年号详情 - 使用全局缓存
const currentEraDetail = ref<EraName | null>(null);

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

  return DateInputUtils.generateEraYearOptions(eraName.value, 1, 62);
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

// 事件处理
const onDynastyExpand = async () => {
  console.log("朝代下拉框展开，重新加载朝代数据...");
  await loadDynasties();
};

const onDynastyChange = async (value: string | undefined) => {
  dynastyName.value = value || "";
  emperorId.value = "";
  eraName.value = "";
  eraYear.value = undefined;

  updateValue();

  // 加载该朝代的皇帝列表（使用全局缓存）
  if (value) {
    try {
      isLoading.value = true;
      emperors.value = await GlobalCacheInstances.getEmperorsByDynasty(value);
      console.log(
        `EraDateSelector组件成功从缓存加载朝代 ${value} 的皇帝:`,
        emperors.value.map((e) => e.id),
      );
    } catch (error) {
      console.error(`EraDateSelector组件加载朝代 ${value} 的皇帝失败:`, error);
      emperors.value = [];
    } finally {
      isLoading.value = false;
    }
  } else {
    emperors.value = [];
  }
};

const onEmperorChange = async (value: string | undefined) => {
  emperorId.value = value || "";
  eraName.value = "";
  eraYear.value = undefined;

  updateValue();

  // 加载该皇帝的年号（使用全局缓存）
  if (value) {
    try {
      isLoading.value = true;
      eras.value = await GlobalCacheInstances.getErasByEmperor(value);
      console.log(
        `EraDateSelector组件成功从缓存加载皇帝 ${value} 的年号:`,
        eras.value.map((e) => e.name),
      );
    } catch (error) {
      console.error(`EraDateSelector组件加载皇帝 ${value} 的年号失败:`, error);
      eras.value = [];
    } finally {
        isLoading.value = false;
    }
  } else {
    eras.value = [];
  }
};

const onEraChange = async (value: string | undefined) => {
  eraName.value = value || "";
  eraYear.value = undefined;

  updateValue();

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
const updateValue = async () => {
  // 只要有朝代名称就可以创建基本的年号日期
  if (!dynastyName.value || !emperorId.value) return;

  let newEraName = eraName.value;
  if (!eraName.value) {
    const eras = await GlobalCacheInstances.getErasByEmperor(emperorId.value);
    if (eras && eras.length > 0) {
      newEraName = eras[0].name;
    }
  }

  const newDate = create(HistoricalDateSchema, {
    calendarType: CalendarType.ERA,
    year: 0, // year 字段不再用于年号年份
    month: month.value || 0,
    day: day.value || 0,
    isLeapMonth: isLeapMonth.value,
    dynastyName: dynastyName.value,
    emperorId: emperorId.value,
    eraName: newEraName || "",
    eraYear: eraYear.value || 0,
  });

  emit("update:value", newDate);
};

// 初始化数据
const initializeData = () => {
  const value = props.value;
  if (!value || value.calendarType !== CalendarType.ERA) return;

  dynastyName.value = value.dynastyName;
  emperorId.value = value.emperorId;
  eraName.value = value.eraName;
  eraYear.value = value.eraYear;
  month.value = value.month || undefined;
  day.value = value.day || undefined;
  isLeapMonth.value = value.isLeapMonth;
};

// 加载朝代数据（使用全局缓存）
const loadDynasties = async () => {
  try {
    dynasties.value = await GlobalCacheInstances.getAllDynasties();
    console.log(
      "EraDateSelector组件成功从缓存加载朝代:",
      dynasties.value.map((d) => d.name),
    );
  } catch (error) {
    console.error("EraDateSelector组件加载朝代失败:", error);
  }
};

// 监听props变化
watch(() => props.value, initializeData, { immediate: true });

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
.era-date-selector {
  /* 年号选择器样式 */
}
</style> 