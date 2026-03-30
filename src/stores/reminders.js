import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Типы уведомлений
export const REMINDER_TYPES = {
  ONCE: 'once',           // Однократное (дата и время)
  RELATIVE: 'relative',   // Относительное (через X времени)
  WEEKLY: 'weekly'        // Повторяющееся (день недели + время)
}

// Относительные интервалы
export const RELATIVE_INTERVALS = [
  { value: 5, unit: 'минут', key: 'minutes' },
  { value: 10, unit: 'минут', key: 'minutes' },
  { value: 15, unit: 'минут', key: 'minutes' },
  { value: 30, unit: 'минут', key: 'minutes' },
  { value: 1, unit: 'час', key: 'hours' },
  { value: 2, unit: 'часа', key: 'hours' },
  { value: 6, unit: 'часов', key: 'hours' },
  { value: 12, unit: 'часов', key: 'hours' },
  { value: 24, unit: 'часов', key: 'hours' },
  { value: 48, unit: 'часов', key: 'hours' },
  { value: 168, unit: 'часов', key: 'hours' } // неделя
]

// Дни недели (начиная с понедельника)
export const WEEKDAYS = [
  { value: 1, label: 'Понедельник', short: 'Пн' },
  { value: 2, label: 'Вторник', short: 'Вт' },
  { value: 3, label: 'Среда', short: 'Ср' },
  { value: 4, label: 'Четверг', short: 'Чт' },
  { value: 5, label: 'Пятница', short: 'Пт' },
  { value: 6, label: 'Суббота', short: 'Сб' },
  { value: 0, label: 'Воскресенье', short: 'Вс' }
]

// Встроенные пресеты
export const DEFAULT_PRESETS = [
  // Разовые (завтра, послезавтра)
  { id: 'default-1', type: 'once', datetime: 'tomorrow-9:00', label: '📅 Завтра, 9:00', isDefault: true },
  { id: 'default-2', type: 'once', datetime: 'tomorrow-10:00', label: '📅 Завтра, 10:00', isDefault: true },
  { id: 'default-3', type: 'once', datetime: 'day-after-9:00', label: '📅 Послезавтра, 9:00', isDefault: true },
  { id: 'default-4', type: 'once', datetime: 'next-monday-9:00', label: '📅 В понедельник, 9:00', isDefault: true },
  // Относительные
  { id: 'default-5', type: 'relative', relativeValue: 10, relativeUnit: 'minutes', label: '⏰ Через 10 мин', isDefault: true },
  { id: 'default-6', type: 'relative', relativeValue: 30, relativeUnit: 'minutes', label: '⏰ Через 30 мин', isDefault: true },
  { id: 'default-7', type: 'relative', relativeValue: 1, relativeUnit: 'hours', label: '⏰ Через 1 час', isDefault: true },
  { id: 'default-8', type: 'relative', relativeValue: 2, relativeUnit: 'hours', label: '⏰ Через 2 часа', isDefault: true },
  { id: 'default-9', type: 'relative', relativeValue: 24, relativeUnit: 'hours', label: '⏰ Через 1 день', isDefault: true },
  // Еженедельные
  { id: 'default-10', type: 'weekly', weekday: 1, time: '09:00', label: '🔄 Каждый пн, 9:00', isDefault: true },
  { id: 'default-11', type: 'weekly', weekday: 5, time: '18:00', label: '🔄 Каждую пт, 18:00', isDefault: true },
  { id: 'default-12', type: 'weekly', weekday: 6, time: '10:00', label: '🔄 Каждую сб, 10:00', isDefault: true },
]

export const useRemindersStore = defineStore('reminders', () => {
  // Состояние
  const reminders = ref([])
  const customPresets = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Загрузка напоминаний из localStorage
  const loadReminders = () => {
    try {
      const saved = localStorage.getItem('tg_reminders')
      if (saved) {
        reminders.value = JSON.parse(saved)
      }
      const savedPresets = localStorage.getItem('tg_custom_presets')
      if (savedPresets) {
        customPresets.value = JSON.parse(savedPresets)
      }
    } catch (e) {
      console.error('Ошибка загрузки:', e)
      error.value = 'Не удалось загрузить данные'
    }
  }

  // Сохранение пользовательских пресетов
  const saveCustomPresets = () => {
    try {
      localStorage.setItem('tg_custom_presets', JSON.stringify(customPresets.value))
    } catch (e) {
      console.error('Ошибка сохранения пресетов:', e)
    }
  }

  // Сохранение напоминаний в localStorage
  const saveReminders = () => {
    try {
      localStorage.setItem('tg_reminders', JSON.stringify(reminders.value))
    } catch (e) {
      console.error('Ошибка сохранения напоминаний:', e)
      error.value = 'Не удалось сохранить напоминания'
    }
  }

  // Добавление пользовательского пресета
  const addCustomPreset = (preset) => {
    const newPreset = {
      id: 'custom-' + Date.now(),
      ...preset,
      isDefault: false
    }
    customPresets.value.push(newPreset)
    saveCustomPresets()
    return newPreset
  }

  // Удаление пользовательского пресета
  const deleteCustomPreset = (id) => {
    const index = customPresets.value.findIndex(p => p.id === id)
    if (index !== -1) {
      customPresets.value.splice(index, 1)
      saveCustomPresets()
      return true
    }
    return false
  }

  // Получение всех пресетов
  const allPresets = computed(() => {
    return [...DEFAULT_PRESETS, ...customPresets.value]
  })

  // Вычисление следующего времени срабатывания
  const getNextTriggerTime = (reminder) => {
    const now = new Date()
    
    switch (reminder.type) {
      case REMINDER_TYPES.ONCE:
        return new Date(reminder.datetime)
        
      case REMINDER_TYPES.RELATIVE: {
        const triggerTime = new Date(reminder.createdAt)
        const value = reminder.relativeValue
        const unit = reminder.relativeUnit
        
        if (unit === 'minutes') {
          triggerTime.setMinutes(triggerTime.getMinutes() + value)
        } else if (unit === 'hours') {
          triggerTime.setHours(triggerTime.getHours() + value)
        }
        return triggerTime
      }
        
      case REMINDER_TYPES.WEEKLY: {
        const [hours, minutes] = (reminder.time || '09:00').split(':').map(Number)
        const next = new Date()
        next.setHours(hours, minutes, 0, 0)
        
        const targetDay = reminder.weekday
        const currentDay = next.getDay()
        
        // Находим следующий нужный день недели
        let daysUntilTarget = targetDay - currentDay
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7
        }
        
        next.setDate(next.getDate() + daysUntilTarget)
        return next
      }
      
      default:
        return new Date(reminder.datetime)
    }
  }

  // Вычисление datetime для пресета
  const getPresetDatetime = (preset) => {
    const now = new Date()
    
    switch (preset.type) {
      case 'once': {
        if (preset.datetime === 'tomorrow-9:00') {
          const date = new Date(now)
          date.setDate(date.getDate() + 1)
          date.setHours(9, 0, 0, 0)
          return date.toISOString()
        }
        if (preset.datetime === 'tomorrow-10:00') {
          const date = new Date(now)
          date.setDate(date.getDate() + 1)
          date.setHours(10, 0, 0, 0)
          return date.toISOString()
        }
        if (preset.datetime === 'day-after-9:00') {
          const date = new Date(now)
          date.setDate(date.getDate() + 2)
          date.setHours(9, 0, 0, 0)
          return date.toISOString()
        }
        if (preset.datetime === 'next-monday-9:00') {
          const date = new Date(now)
          date.setHours(9, 0, 0, 0)
          const currentDay = date.getDay()
          let daysUntilMonday = 1 - currentDay
          if (daysUntilMonday <= 0) daysUntilMonday += 7
          date.setDate(date.getDate() + daysUntilMonday)
          return date.toISOString()
        }
        return preset.datetime
      }
      default:
        return null
    }
  }

  // Создание нового напоминания
  const addReminder = (reminder) => {
    const newReminder = {
      id: Date.now().toString(),
      title: reminder.title,
      description: reminder.description || '',
      type: reminder.type || REMINDER_TYPES.ONCE,
      datetime: reminder.datetime || null,
      relativeValue: reminder.relativeValue || 30,
      relativeUnit: reminder.relativeUnit || 'minutes',
      weekday: reminder.weekday !== undefined ? reminder.weekday : 1,
      time: reminder.time || '09:00',
      createdAt: new Date().toISOString(),
      completed: false
    }
    reminders.value.push(newReminder)
    saveReminders()
    return newReminder
  }

  // Обновление напоминания
  const updateReminder = (id, updates) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value[index] = { ...reminders.value[index], ...updates }
      saveReminders()
      return reminders.value[index]
    }
    return null
  }

  // Удаление напоминания
  const deleteReminder = (id) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
      saveReminders()
      return true
    }
    return false
  }

  // Получение напоминания по ID
  const getReminderById = (id) => {
    return reminders.value.find(r => r.id === id)
  }

  // Отсортированные напоминания (по времени следующего срабатывания)
  const sortedReminders = computed(() => {
    return [...reminders.value].sort((a, b) => {
      return getNextTriggerTime(a) - getNextTriggerTime(b)
    })
  })

  // Предстоящие напоминания
  const upcomingReminders = computed(() => {
    const now = new Date()
    return sortedReminders.value.filter(r => getNextTriggerTime(r) >= now)
  })

  // Просроченные напоминания
  const overdueReminders = computed(() => {
    const now = new Date()
    return sortedReminders.value.filter(r => getNextTriggerTime(r) < now)
  })

  // Инициализация
  loadReminders()

  return {
    // Состояние
    reminders,
    customPresets,
    isLoading,
    error,
    // Computed
    sortedReminders,
    upcomingReminders,
    overdueReminders,
    allPresets,
    // Константы
    REMINDER_TYPES,
    RELATIVE_INTERVALS,
    WEEKDAYS,
    DEFAULT_PRESETS,
    // Методы
    loadReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    getReminderById,
    getNextTriggerTime,
    getPresetDatetime,
    addCustomPreset,
    deleteCustomPreset
  }
})
