<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="px-4 py-4 border-b border-secondary-bg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">📅 Напоминания</h1>
          <p class="text-sm text-hint-color">Управляйте своими событиями</p>
        </div>
        <div v-if="telegramUser" class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-text font-semibold">
            {{ telegramUser.first_name?.[0] || 'U' }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 py-4 pb-24">
      <ReminderList
        :reminders="store.sortedReminders"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </main>

    <!-- FAB Button -->
    <button
      @click="showForm = true"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-text shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      aria-label="Создать напоминание"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Reminder Form Modal -->
    <ReminderForm
      v-if="showForm"
      :reminder="editingReminder"
      @submit="handleCreate"
      @update="handleUpdate"
      @close="closeForm"
    />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div 
        v-if="toast.show" 
        class="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-secondary-bg shadow-lg text-sm"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRemindersStore } from './stores/reminders'
import ReminderList from './components/ReminderList.vue'
import ReminderForm from './components/ReminderForm.vue'

const store = useRemindersStore()

// Telegram integration
const telegramUser = ref(null)
const tg = ref(null)

// UI State
const showForm = ref(false)
const editingReminder = ref(null)
const toast = reactive({
  show: false,
  message: ''
})

// Computed
const isEditing = computed(() => !!editingReminder.value)

// Methods
const showToast = (message) => {
  toast.message = message
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2500)
}

const handleCreate = (reminderData) => {
  store.addReminder(reminderData)
  closeForm()
  showToast('Напоминание создано!')
}

const handleUpdate = (reminderData) => {
  store.updateReminder(reminderData.id, {
    title: reminderData.title,
    description: reminderData.description,
    datetime: reminderData.datetime
  })
  closeForm()
  showToast('Напоминание обновлено!')
}

const handleEdit = (reminder) => {
  editingReminder.value = reminder
  showForm.value = true
}

const handleDelete = (id) => {
  store.deleteReminder(id)
  showToast('Напоминание удалено')
}

const closeForm = () => {
  showForm.value = false
  editingReminder.value = null
}

// Initialize Telegram Mini App
const initTelegram = () => {
  if (window.Telegram?.WebApp) {
    tg.value = window.Telegram.WebApp
    
    // Apply theme colors
    const themeParams = tg.value.themeParams
    if (themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000')
      document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#3390ec')
      document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff')
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color || '#f0f0f0')
      document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999')
    }
    
    // Expand to full height
    tg.value.expand()
    
    // Enable closing confirmation
    tg.value.enableClosingConfirmation()
    
    // Get user info
    if (tg.value.initDataUnsafe?.user) {
      telegramUser.value = tg.value.initDataUnsafe.user
    }
    
    // Ready signal
    tg.value.ready()
  }
}

onMounted(() => {
  initTelegram()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
