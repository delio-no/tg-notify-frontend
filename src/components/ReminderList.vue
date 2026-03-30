<template>
  <div class="flex flex-col h-full">
    <!-- Статистика -->
    <div v-if="reminders.length > 0" class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <div class="bg-secondary-bg rounded-lg px-4 py-2 flex-shrink-0">
        <span class="text-sm text-hint-color">Всего:</span>
        <span class="font-semibold ml-1">{{ reminders.length }}</span>
      </div>
      <div class="bg-green-100 rounded-lg px-4 py-2 flex-shrink-0">
        <span class="text-sm text-green-700">Предстоящих:</span>
        <span class="font-semibold ml-1 text-green-700">{{ upcomingCount }}</span>
      </div>
      <div v-if="overdueCount > 0" class="bg-red-100 rounded-lg px-4 py-2 flex-shrink-0">
        <span class="text-sm text-red-700">Просроченных:</span>
        <span class="font-semibold ml-1 text-red-700">{{ overdueCount }}</span>
      </div>
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
      <!-- Просроченные -->
      <div v-if="overdueReminders.length > 0" class="mb-6">
        <h3 class="text-sm font-medium text-red-500 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Просроченные
        </h3>
        <ReminderItem
          v-for="reminder in overdueReminders"
          :key="reminder.id"
          :reminder="reminder"
          @edit="$emit('edit', reminder)"
          @delete="$emit('delete', reminder.id)"
        />
      </div>

      <!-- Предстоящие -->
      <div v-if="upcomingReminders.length > 0">
        <h3 v-if="overdueReminders.length > 0" class="text-sm font-medium text-hint-color mb-3">
          Предстоящие
        </h3>
        <ReminderItem
          v-for="reminder in upcomingReminders"
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
import { computed } from 'vue'
import ReminderItem from './ReminderItem.vue'

const props = defineProps({
  reminders: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const overdueReminders = computed(() => {
  const now = new Date()
  return props.reminders.filter(r => new Date(r.datetime) < now)
})

const upcomingReminders = computed(() => {
  const now = new Date()
  return props.reminders.filter(r => new Date(r.datetime) >= now)
})

const overdueCount = computed(() => overdueReminders.value.length)
const upcomingCount = computed(() => upcomingReminders.value.length)
</script>
