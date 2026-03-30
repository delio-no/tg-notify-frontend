<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center slide-up">
    <div class="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">
          {{ isEditing ? 'Редактировать' : 'Новое напоминание' }}
        </h2>
        <button 
          @click="$emit('close')"
          class="p-2 rounded-lg hover:bg-secondary-bg transition-colors"
          aria-label="Закрыть"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Модальное окно подтверждения удаления пресета -->
      <ConfirmModal
        v-if="presetToDelete"
        :show="true"
        title="Удалить пресет"
        :message="`Вы уверены, что хотите удалить пресет «${presetToDelete.label}»?`"
        confirm-text="Удалить"
        cancel-text="Отмена"
        @confirm="confirmDeletePreset"
        @cancel="presetToDelete = null"
      />

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Название *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Введите название напоминания"
            class="w-full px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Описание</label>
          <textarea
            v-model="form.description"
            placeholder="Добавьте описание (необязательно)"
            rows="2"
            class="w-full px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Поля для типа "Дата и время" -->
        <div v-if="form.type === 'once'" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-2">Дата</label>
              <input
                v-model="form.date"
                type="date"
                :min="minDate"
                class="w-full px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Время</label>
              <input
                v-model="form.time"
                type="time"
                class="w-full px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Поля для типа "Через..." -->
        <div v-if="form.type === 'relative'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">Через</label>
            <div class="flex gap-2">
              <input
                v-model.number="form.relativeValue"
                type="number"
                min="1"
                max="999"
                class="flex-1 px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <select
                v-model="form.relativeUnit"
                class="w-32 px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option value="minutes">минут</option>
                <option value="hours">часов</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Поля для типа "Каждую неделю" -->
        <div v-if="form.type === 'weekly'" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">День недели</label>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="day in weekdays"
                :key="day.value"
                type="button"
                @click="form.weekday = day.value"
                class="px-2 py-2 rounded-lg text-xs font-medium transition-all"
                :class="form.weekday === day.value 
                  ? 'bg-primary text-primary-text' 
                  : 'bg-secondary-bg hover:bg-secondary-bg/80'"
              >
                {{ day.short }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Время</label>
            <input
              v-model="form.time"
              type="time"
              class="w-full px-4 py-3 rounded-xl bg-secondary-bg border-none focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <!-- Тип напоминания (компактный) -->
        <div class="flex gap-2">
          <button
            type="button"
            @click="form.type = 'once'"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            :class="form.type === 'once' 
              ? 'bg-primary text-primary-text' 
              : 'bg-secondary-bg hover:bg-secondary-bg/80'"
          >
            📅 Дата
          </button>
          <button
            type="button"
            @click="form.type = 'relative'"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            :class="form.type === 'relative' 
              ? 'bg-primary text-primary-text' 
              : 'bg-secondary-bg hover:bg-secondary-bg/80'"
          >
            ⏰ Через...
          </button>
          <button
            type="button"
            @click="form.type = 'weekly'"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            :class="form.type === 'weekly' 
              ? 'bg-primary text-primary-text' 
              : 'bg-secondary-bg hover:bg-secondary-bg/80'"
          >
            🔄 Неделя
          </button>
        </div>

        <!-- Пресеты -->
        <div>
          <label class="block text-xs text-hint-color mb-2">Пресеты</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in allPresets"
              :key="preset.id"
              type="button"
              @click="applyPreset(preset)"
              class="relative px-3 py-1.5 rounded-lg text-sm transition-all"
              :class="isPresetActive(preset) 
                ? 'bg-primary text-primary-text' 
                : 'bg-secondary-bg hover:bg-secondary-bg/80'"
            >
              {{ preset.label }}
              <span
                v-if="!preset.isDefault"
                @click.stop="presetToDelete = preset"
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                ×
              </span>
            </button>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="saveCurrentAsPreset"
            class="px-4 py-3 rounded-xl bg-secondary-bg font-medium hover:opacity-80 transition-opacity"
            :disabled="!form.title.trim()"
            :class="{ 'opacity-50': !form.title.trim() }"
          >
            💾 Сохранить пресет
          </button>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 rounded-xl bg-secondary-bg font-medium hover:opacity-80 transition-opacity"
          >
            Отмена
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-text font-semibold hover:opacity-90 transition-opacity"
          >
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRemindersStore } from '../stores/reminders'
import ConfirmModal from './ConfirmModal.vue'

const store = useRemindersStore()

const props = defineProps({
  reminder: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'close', 'update'])

const isEditing = computed(() => !!props.reminder)
const weekdays = computed(() => store.WEEKDAYS)
const allPresets = computed(() => store.allPresets)
const presetToDelete = ref(null)

const confirmDeletePreset = () => {
  if (presetToDelete.value) {
    store.deleteCustomPreset(presetToDelete.value.id)
    presetToDelete.value = null
  }
}

const isPresetActive = (preset) => {
  if (preset.type !== form.value.type) return false
  
  switch (preset.type) {
    case 'once':
      if (!form.value.date || !form.value.time) return false
      return `${form.value.date}T${form.value.time}` === store.getPresetDatetime(preset)?.slice(0, 16)
    case 'relative':
      return form.value.relativeValue === preset.relativeValue && form.value.relativeUnit === preset.relativeUnit
    case 'weekly':
      return form.value.weekday === preset.weekday && form.value.time === preset.time
    default:
      return false
  }
}

const applyPreset = (preset) => {
  form.value.type = preset.type
  form.value.title = preset.label || ''
  
  switch (preset.type) {
    case 'once':
      const datetime = store.getPresetDatetime(preset)
      if (datetime) {
        form.value.date = datetime.split('T')[0]
        form.value.time = datetime.split('T')[1].slice(0, 5)
      }
      form.value.relativeValue = 30
      form.value.relativeUnit = 'minutes'
      form.value.weekday = 1
      break
      
    case 'relative':
      form.value.relativeValue = preset.relativeValue
      form.value.relativeUnit = preset.relativeUnit
      form.value.date = ''
      form.value.time = ''
      form.value.weekday = 1
      break
      
    case 'weekly':
      form.value.weekday = preset.weekday
      form.value.time = preset.time
      form.value.date = ''
      form.value.relativeValue = 30
      form.value.relativeUnit = 'minutes'
      break
  }
}

const saveCurrentAsPreset = () => {
  if (!form.value.title.trim()) {
    return
  }
  
  let presetData = {
    type: form.value.type,
    label: form.value.title.trim()
  }
  
  switch (form.value.type) {
    case 'once':
      presetData.datetime = `${form.value.date}T${form.value.time}`
      break
    case 'relative':
      presetData.relativeValue = form.value.relativeValue
      presetData.relativeUnit = form.value.relativeUnit
      break
    case 'weekly':
      presetData.weekday = form.value.weekday
      presetData.time = form.value.time
      break
  }
  
  store.addCustomPreset(presetData)
}

const form = ref({
  title: '',
  description: '',
  type: 'relative',
  date: '',
  time: '',
  relativeValue: 30,
  relativeUnit: 'minutes',
  weekday: 1
})

const minDate = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

const initForm = () => {
  if (props.reminder) {
    form.value = {
      title: props.reminder.title,
      description: props.reminder.description || '',
      type: props.reminder.type || 'once',
      date: props.reminder.datetime ? new Date(props.reminder.datetime).toISOString().split('T')[0] : '',
      time: props.reminder.time || props.reminder.datetime ? new Date(props.reminder.datetime).toTimeString().slice(0, 5) : '09:00',
      relativeValue: props.reminder.relativeValue || 30,
      relativeUnit: props.reminder.relativeUnit || 'minutes',
      weekday: props.reminder.weekday !== undefined ? props.reminder.weekday : 1
    }
  } else {
    const defaultDate = new Date()
    defaultDate.setHours(defaultDate.getHours() + 1)
    defaultDate.setMinutes(0)
    form.value = {
      title: '',
      description: '',
      type: 'relative',
      date: defaultDate.toISOString().split('T')[0],
      time: defaultDate.toTimeString().slice(0, 5),
      relativeValue: 30,
      relativeUnit: 'minutes',
      weekday: 1
    }
  }
}

onMounted(() => {
  initForm()
})

watch(() => props.reminder, () => {
  initForm()
}, { immediate: true })

const handleSubmit = () => {
  if (!form.value.title.trim()) {
    return
  }

  let reminderData = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    type: form.value.type
  }

  switch (form.value.type) {
    case 'once':
      if (!form.value.date || !form.value.time) return
      reminderData.datetime = new Date(`${form.value.date}T${form.value.time}`).toISOString()
      reminderData.time = form.value.time
      break
      
    case 'relative':
      reminderData.relativeValue = form.value.relativeValue
      reminderData.relativeUnit = form.value.relativeUnit
      break
      
    case 'weekly':
      reminderData.weekday = form.value.weekday
      reminderData.time = form.value.time
      reminderData.datetime = null
      break
  }

  if (isEditing.value) {
    emit('update', { id: props.reminder.id, ...reminderData })
  } else {
    emit('submit', reminderData)
  }
}
</script>
