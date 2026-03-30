<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        @click.self="$emit('cancel')"
      >
        <div class="bg-background w-full max-w-sm rounded-2xl p-6 shadow-2xl">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
            <p class="text-hint-color text-sm mb-6">{{ message }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-3 rounded-xl bg-secondary-bg font-medium hover:opacity-80 transition-opacity"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              class="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    default: 'Вы уверены?'
  },
  confirmText: {
    type: String,
    default: 'Удалить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
