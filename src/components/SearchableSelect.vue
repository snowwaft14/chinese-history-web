<template>
  <div class="relative" ref="containerRef">
    <!-- 输入框区域 -->
    <div class="relative" ref="inputWrapperRef">
      <input
        ref="inputRef"
        v-model="searchQuery"
        @focus="handleFocus"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        :class="inputClass"
        class="p-1"
        autocomplete="off"
      />

      <!-- 清空按钮 -->
      <button
        v-if="searchQuery && allowClear"
        @click="clearSelection"
        class="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      <!-- 下拉箭头 -->
      <button
        @click="toggleDropdown"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
      >
        <svg
          :class="['w-4 h-4 transition-transform', showDropdown ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- 下拉列表 - 使用 Teleport 移动到 body -->
  <Teleport to="body">
    <div
      v-if="showDropdown"
      ref="dropdownRef"
      :style="dropdownStyle"
      class="fixed z-[9999] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      <!-- 搜索结果为空时的提示 -->
      <div v-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-500 text-sm">
        {{ noDataText }}
      </div>

      <!-- 选项列表 -->
      <div
        v-for="(option, index) in filteredOptions"
        :key="getOptionKey(option)"
        @click="selectOption(option)"
        :class="[
          'px-3 py-2 cursor-pointer text-sm transition-colors',
          index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100',
          isSelected(option) ? 'bg-blue-50 text-blue-600' : '',
        ]"
        v-html="highlightText(getOptionLabel(option))"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

  // Props定义
  interface Props {
    modelValue?: any;
    options: any[];
    placeholder?: string;
    valueKey?: string;
    labelKey?: string;
    searchKey?: string; // 指定搜索值的属性名
    allowClear?: boolean;
    disabled?: boolean;
    noDataText?: string;
    inputClass?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: "请选择",
    valueKey: "value",
    labelKey: "label",
    searchKey: "searchValues", // 默认使用 searchValues
    allowClear: true,
    disabled: false,
    noDataText: "无匹配数据",
    inputClass: "input input-bordered input-sm w-full pr-12",
  });

  // Emits定义
  const emit = defineEmits<{
    "update:modelValue": [value: any];
    change: [value: any, option: any];
    expand: []; // 新增展开事件
  }>();

  // 响应式数据
  const searchQuery = ref("");
  const showDropdown = ref(false);
  const highlightedIndex = ref(-1);
  const containerRef = ref<HTMLElement>();
  const inputRef = ref<HTMLInputElement>();
  const inputWrapperRef = ref<HTMLElement>();
  const dropdownRef = ref<HTMLElement>();
  const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

  // 生成搜索文本 - 优先使用动态指定的搜索值属性
  const generateSearchText = (option: any): string => {
    const label = getOptionLabel(option);

    // 如果提供了搜索值属性，优先使用
    if (
      option &&
      typeof option === "object" &&
      props.searchKey &&
      option[props.searchKey] &&
      Array.isArray(option[props.searchKey])
    ) {
      const searchValues = option[props.searchKey].join("|");
      return `${label}|${searchValues}`.toLowerCase();
    }

    // 降级方案：如果没有搜索值属性，只使用原文
    return label.toLowerCase();
  };

  // 获取选项的值
  const getOptionValue = (option: any): any => {
    return typeof option === "object" ? option[props.valueKey] : option;
  };

  // 获取选项的标签
  const getOptionLabel = (option: any): string => {
    return typeof option === "object" ? option[props.labelKey] : String(option);
  };

  // 获取选项的唯一键
  const getOptionKey = (option: any): string => {
    return String(getOptionValue(option));
  };

  // 判断选项是否被选中
  const isSelected = (option: any): boolean => {
    return getOptionValue(option) === props.modelValue;
  };

  // 过滤选项
  const filteredOptions = computed(() => {
    if (!searchQuery.value.trim()) {
      return props.options;
    }

    const query = searchQuery.value.toLowerCase().trim();

    return props.options.filter((option) => {
      const searchText = generateSearchText(option);
      return searchText.includes(query);
    });
  });

  // 下拉框样式计算
  const dropdownStyle = computed(() => ({
    top: `${dropdownPosition.value.top}px`,
    left: `${dropdownPosition.value.left}px`,
    width: `${dropdownPosition.value.width}px`,
  }));

  // 更新下拉框位置
  const updateDropdownPosition = () => {
    if (!inputWrapperRef.value) return;

    const rect = inputWrapperRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 4, // 4px间距
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  };

  // 高亮匹配文本 - 简化版本（专注前端职责）
  const highlightText = (text: string): string => {
    if (!searchQuery.value.trim()) {
      return text;
    }

    const query = searchQuery.value.toLowerCase().trim();

    // 直接字符匹配高亮
    if (text.toLowerCase().includes(query)) {
      const regex = new RegExp(`(${query})`, "gi");
      return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }

    // 如果没有直接匹配，说明是通过后端searchValues匹配的，
    // 这种情况下简单高亮整个文本或不高亮，避免复杂的拼音处理
    return text;
  };

  // 选择选项
  const selectOption = (option: any) => {
    const value = getOptionValue(option);
    const label = getOptionLabel(option);

    searchQuery.value = label;
    showDropdown.value = false;
    highlightedIndex.value = -1;

    emit("update:modelValue", value);
    emit("change", value, option);
  };

  // 清空选择
  const clearSelection = () => {
    searchQuery.value = "";
    showDropdown.value = false;
    highlightedIndex.value = -1;

    emit("update:modelValue", undefined);
    emit("change", undefined, null);
  };

  // 处理输入框获得焦点
  const handleFocus = () => {
    const wasOpen = showDropdown.value;
    showDropdown.value = true;
    // 更新下拉框位置
    nextTick(() => {
      updateDropdownPosition();
      inputRef.value?.select();
    });
    
    // 如果是从关闭状态变为展开状态，触发展开事件
    if (!wasOpen) {
      emit("expand");
    }
  };

  // 切换下拉状态
  const toggleDropdown = () => {
    if (props.disabled) return;
    const wasOpen = showDropdown.value;
    showDropdown.value = !showDropdown.value;

    if (showDropdown.value) {
      // 点击展开时清空搜索查询，显示所有选项
      searchQuery.value = "";
      nextTick(() => {
        updateDropdownPosition();
        inputRef.value?.focus();
      });
      
      // 如果是从关闭状态变为展开状态，触发展开事件
      if (!wasOpen) {
        emit("expand");
      }
    }
  };

  // 键盘事件处理
  const handleKeydown = (event: KeyboardEvent) => {
    if (!showDropdown.value) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        showDropdown.value = true;
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredOptions.value.length - 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
          selectOption(filteredOptions.value[highlightedIndex.value]);
        }
        break;
      case "Escape":
        showDropdown.value = false;
        highlightedIndex.value = -1;
        inputRef.value?.blur();
        break;
    }
  };

  // 点击外部关闭下拉框
  const handleClickOutside = (event: Event) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
      showDropdown.value = false;
      highlightedIndex.value = -1;
    }
  };

  // 处理窗口大小变化和滚动
  const handleResize = () => {
    if (showDropdown.value) {
      updateDropdownPosition();
    }
  };

  const handleScroll = () => {
    if (showDropdown.value) {
      updateDropdownPosition();
    }
  };

  // 监听modelValue变化，更新显示文本
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue === undefined || newValue === "") {
        searchQuery.value = "";
      } else {
        const option = props.options.find((opt) => getOptionValue(opt) === newValue);
        if (option) {
          searchQuery.value = getOptionLabel(option);
        }
      }
    },
    { immediate: true },
  );

  // 重置高亮索引
  watch(filteredOptions, () => {
    highlightedIndex.value = -1;
  });

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true); // 使用捕获模式监听所有滚动事件
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", handleScroll, true);
  });
</script>

<style scoped>
  /* 确保下拉框在其他元素之上 */
  .relative {
    position: relative;
  }

  /* 标记样式 */
  :deep(mark) {
    background-color: #fef3c7;
    padding: 0;
    border-radius: 2px;
  }
</style>
