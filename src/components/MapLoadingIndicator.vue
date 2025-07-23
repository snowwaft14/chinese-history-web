<template>
  <div v-if="loading" class="map-loading-indicator">
    <div class="spinner"></div>
    <div class="loading-text">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  message?: string;
}>();
</script>

<style scoped>
.map-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 12px;
}

.loading-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>