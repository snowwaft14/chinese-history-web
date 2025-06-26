<template>
  <div class="layer-selector relative">
    <!-- 触发按钮 -->
    <button
      @click="toggleDropdown"
      class="w-full bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 p-4 text-left hover:bg-opacity-100 hover:shadow-2xl transition-all duration-200 flex items-center justify-between min-w-52"
    >
      <div class="flex items-center space-x-3">
        <span class="text-lg">🗂️</span>
        <div>
          <div class="text-sm font-bold text-gray-800">图层类型</div>
          <div class="text-xs text-gray-500">
            {{ selectedSummary }}
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
          {{ modelValue.length }}
        </span>
        <svg
          :class="[
            'w-4 h-4 transition-transform duration-200 text-gray-400',
            isOpen ? 'transform rotate-180' : ''
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- 下拉菜单 -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[8999] overflow-hidden backdrop-blur-sm bg-opacity-95"
      style="z-index: 8999;"
    >
      <!-- 全选/取消全选 -->
      <div class="border-b border-gray-100 p-3">
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              :checked="isAllSelected"
              :indeterminate="isPartiallySelected"
              @change="toggleSelectAll"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-semibold text-gray-700">
              {{ selectAllText }}
            </span>
          </label>
          <span class="text-xs text-gray-500">
            {{ modelValue.length }}/{{ layerOptions.length }}
          </span>
        </div>
      </div>

      <!-- 图层选项列表 -->
      <div class="max-h-64 overflow-y-auto">
        <label
          v-for="option in layerOptions"
          :key="option.value"
          class="flex items-center space-x-3 p-3 hover:bg-blue-50 transition-all duration-150 cursor-pointer group"
        >
          <input
            :checked="modelValue.includes(option.value)"
            @change="toggleLayer(option.value)"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div class="flex items-center space-x-3 flex-1">
            <span class="text-lg">{{ option.icon }}</span>
            <div>
              <div class="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                {{ option.label }}
              </div>
              <div class="text-xs text-gray-500 group-hover:text-blue-600">
                {{ option.description }}
              </div>
            </div>
          </div>
          <div
            v-if="modelValue.includes(option.value)"
            class="w-2 h-2 bg-blue-500 rounded-full"
          ></div>
        </label>
      </div>

      <!-- 底部操作区 -->
      <div class="border-t border-gray-100 p-3 bg-gray-50">
        <div class="flex items-center justify-between">
          <button
            @click="closeDropdown"
            class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            关闭
          </button>
          <button
            @click="applySelection"
            class="px-4 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
          >
            <span>✅</span>
            <span>应用</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-[8998]"
      style="z-index: 8998;"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LayerType } from '@/connects/layer_pb'

// Props
interface Props {
  modelValue: LayerType[]
  layerOptions: {
    value: LayerType
    label: string
    icon: string
    description: string
  }[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: LayerType[]]
  'change': [value: LayerType[]]
}>()

// 响应式数据
const isOpen = ref(false)

// 计算属性
const isAllSelected = computed(() => 
  props.modelValue.length === props.layerOptions.length
)

const isPartiallySelected = computed(() => 
  props.modelValue.length > 0 && props.modelValue.length < props.layerOptions.length
)

const selectAllText = computed(() => {
  if (isAllSelected.value) return '取消全选'
  if (isPartiallySelected.value) return '全选'
  return '全选'
})

const selectedSummary = computed(() => {
  const count = props.modelValue.length
  if (count === 0) return '未选择图层'
  if (count === props.layerOptions.length) return '已选择全部图层'
  
  const selectedLabels = props.layerOptions
    .filter(option => props.modelValue.includes(option.value))
    .map(option => option.label)
  
  if (count <= 2) {
    return selectedLabels.join('、')
  }
  
  return `${selectedLabels.slice(0, 2).join('、')} 等${count}项`
})

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const toggleSelectAll = () => {
  const newValue = isAllSelected.value 
    ? [] 
    : props.layerOptions.map(option => option.value)
  
  emit('update:modelValue', newValue)
}

const toggleLayer = (layerType: LayerType) => {
  const newValue = props.modelValue.includes(layerType)
    ? props.modelValue.filter(type => type !== layerType)
    : [...props.modelValue, layerType]
  
  emit('update:modelValue', newValue)
}

const applySelection = () => {
  emit('change', props.modelValue)
  closeDropdown()
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 自定义复选框样式 */
input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

input[type="checkbox"]:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
}

/* 滚动条样式 */
.layer-selector ::-webkit-scrollbar {
  width: 6px;
}

.layer-selector ::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.layer-selector ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.layer-selector ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 下拉动画 */
.layer-selector .absolute {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 