<template>
  <div class="flex flex-col h-full">
    <!-- Фильтрация -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        @click="filter = 'all'"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0', filter === 'all' ? 'bg-blue-500 text-white' : 'bg-secondary-bg text-hint-color']"
      >
        Всего ({{ reminders.length }})
      </button>
      <button
        @click="filter = 'upcoming'"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0', filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-secondary-bg text-hint-color']"
      >
        Активные ({{ upcomingCount }})
      </button>
      <button
        @click="filter = 'completed'"
        :class="['px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0', filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-secondary-bg text-hint-color']"
      >
        Выполненные ({{ completedCount }})
      </button>
    </div>

    <!-- Пустое состояние -->
    <div 
      v-if="reminders.length === 0" 
      class="flex flex-col items-center justify-center flex-1 text-center py-12 px-4"
    >
      <div class="w-24 h-24 mb-6 text-hint-color">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-2">Нет напоминаний</h3>
      <p class="text-hint-color mb-6">Создайте своё первое напоминание, нажав кнопку ниже</p>
    </div>

    <!-- Список напоминаний -->
    <div v-else class="flex-1 overflow-y-auto -mx-4 px-4">
      <!-- Все напоминания -->
      <div v-if="filter === 'all'">
        <div v-if="upcomingReminders.length > 0" class="mb-6">
          <h3 class="text-sm font-medium text-hint-color mb-3">Предстоящие</h3>
          <ReminderItem
            v-for="reminder in upcomingReminders"
            :key="reminder.id"
            :reminder="reminder"
            @edit="$emit('edit', reminder)"
            @delete="$emit('delete', reminder.id)"
          />
        </div>
        
        <div v-if="completedReminders.length > 0">
          <h3 class="text-sm font-medium text-green-500 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Выполненные
          </h3>
          <ReminderItem
            v-for="reminder in completedReminders"
            :key="reminder.id"
            :reminder="reminder"
            @edit="$emit('edit', reminder)"
            @delete="$emit('delete', reminder.id)"
          />
        </div>
      </div>
      
      <!-- Только предстоящие -->
      <div v-else-if="filter === 'upcoming'">
        <ReminderItem
          v-for="reminder in upcomingReminders"
          :key="reminder.id"
          :reminder="reminder"
          @edit="$emit('edit', reminder)"
          @delete="$emit('delete', reminder.id)"
        />
      </div>
      
      <!-- Только выполненные -->
      <div v-else-if="filter === 'completed'">
        <ReminderItem
          v-for="reminder in completedReminders"
          :key="reminder.id"
          :reminder="reminder"
          @edit="$emit('edit', reminder)"
          @delete="$emit('delete', reminder.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ReminderItem from './ReminderItem.vue'

const props = defineProps({
  reminders: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const filter = ref('all')

const completedReminders = computed(() => {
  return props.reminders.filter(r => r.completed)
})

const upcomingReminders = computed(() => {
  const now = new Date()
  return props.reminders.filter(r => !r.completed)
})

const completedCount = computed(() => completedReminders.value.length)
const upcomingCount = computed(() => upcomingReminders.value.length)
</script>
