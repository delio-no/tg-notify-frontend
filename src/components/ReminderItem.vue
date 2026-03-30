<template>
  <div 
    class="bg-secondary-bg rounded-xl p-4 mb-3 fade-in transition-all duration-200 hover:shadow-md"
    :class="{ 'opacity-60': isOverdue && !reminder.completed }"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg">{{ typeIcon }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full" :class="typeBadgeClass">
            {{ typeLabel }}
          </span>
        </div>
        <h3 class="font-semibold text-lg truncate pr-2">{{ reminder.title }}</h3>
        <p v-if="reminder.description" class="text-hint-color text-sm mt-1 line-clamp-2">
          {{ reminder.description }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <svg 
            class="w-4 h-4 text-hint-color flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span 
            class="text-sm"
            :class="isOverdue && !reminder.completed ? 'text-red-500 font-medium' : 'text-hint-color'"
          >
            {{ formattedDate }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center gap-2 flex-shrink-0">
        <button 
          @click="$emit('edit', reminder)"
          class="p-2 rounded-lg hover:bg-background transition-colors"
          aria-label="Редактировать"
        >
          <svg class="w-5 h-5 text-hint-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          @click="showDeleteConfirm = true"
          class="p-2 rounded-lg hover:bg-background transition-colors"
          aria-label="Удалить"
        >
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="Удалить напоминание"
      :message="`Вы уверены, что хотите удалить «${reminder.title}»?`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRemindersStore } from '../stores/reminders'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  reminder: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const store = useRemindersStore()
const showDeleteConfirm = ref(false)

const typeIcon = computed(() => {
  switch (props.reminder.type) {
    case 'relative': return '⏰'
    case 'weekly': return '🔄'
    default: return '📅'
  }
})

const typeLabel = computed(() => {
  switch (props.reminder.type) {
    case 'relative': return 'Через...'
    case 'weekly': return 'Еженедельно'
    default: return 'Разово'
  }
})

const typeBadgeClass = computed(() => {
  switch (props.reminder.type) {
    case 'relative': return 'bg-orange-100 text-orange-700'
    case 'weekly': return 'bg-blue-100 text-blue-700'
    default: return 'bg-green-100 text-green-700'
  }
})

const nextTriggerTime = computed(() => {
  return store.getNextTriggerTime(props.reminder)
})

const isOverdue = computed(() => {
  return nextTriggerTime.value < new Date()
})

const formattedDate = computed(() => {
  const date = nextTriggerTime.value
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  
  const time = date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  switch (props.reminder.type) {
    case 'relative': {
      const value = props.reminder.relativeValue
      const unit = props.reminder.relativeUnit === 'minutes' ? 'минут' : 'часов'
      if (isToday) {
        return `Сегодня, ${time} (через ${value} ${unit})`
      } else if (isTomorrow) {
        return `Завтра, ${time}`
      }
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }) + ` (через ${value} ${unit})`
    }
    
    case 'weekly': {
      const weekday = store.WEEKDAYS.find(d => d.value === date.getDay())
      if (isToday) {
        return `Сегодня, ${weekday?.short || ''} ${time}`
      } else if (isTomorrow) {
        return `Завтра, ${weekday?.short || ''} ${time}`
      }
      return `${weekday?.label || ''}, ${time}`
    }
    
    default: {
      if (isToday) {
        return `Сегодня, ${time}`
      } else if (isTomorrow) {
        return `Завтра, ${time}`
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  }
})

const confirmDelete = () => {
  showDeleteConfirm.value = false
  emit('delete', props.reminder.id)
}
</script>
