<template>
  <Teleport to="body">
    <Transition name="confirm-modal-fade">
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')" />
        <!-- Panel -->
        <div
          class="relative w-full max-w-sm bg-base-100 rounded-2xl shadow-2xl p-6"
        >
          <!-- Icon + Header -->
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :class="iconBg"
            >
              <component :is="icon" class="w-5 h-5" :class="iconColor" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-base-content text-base leading-snug">
                {{ title }}
              </h3>
              <p
                v-if="message"
                class="text-sm text-base-content/50 mt-1 leading-relaxed"
              >
                {{ message }}
              </p>
            </div>
            <button
              @click="$emit('cancel')"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-base-content/40 hover:bg-base-200 transition-colors shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 justify-end mt-5">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 text-sm font-medium rounded-lg text-base-content/70 bg-base-200 hover:bg-base-300 transition-colors"
            >
              {{ cancelLabel }}
            </button>
            <button
              @click="$emit('confirm')"
              class="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
              :class="confirmBtnClass"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { X, AlertTriangle, AlertCircle, LogOut, Info } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
  // 'danger' | 'warning' | 'info' | 'logout'
  variant: { type: String, default: 'danger' },
})

defineEmits(['confirm', 'cancel'])

const icon = computed(() => {
  switch (props.variant) {
    case 'warning':
      return AlertTriangle
    case 'logout':
      return LogOut
    case 'info':
      return Info
    default:
      return AlertTriangle // danger
  }
})

const iconBg = computed(() => ({
  'bg-red-100 dark:bg-red-900/30': props.variant === 'danger',
  'bg-amber-100 dark:bg-amber-900/30': props.variant === 'warning',
  'bg-blue-100 dark:bg-blue-900/30': props.variant === 'info',
  'bg-flame-500/15': props.variant === 'logout',
}))

const iconColor = computed(() => ({
  'text-red-500': props.variant === 'danger',
  'text-amber-500': props.variant === 'warning',
  'text-blue-500': props.variant === 'info',
  'text-flame-500': props.variant === 'logout',
}))

const confirmBtnClass = computed(() => ({
  'bg-red-500 hover:bg-red-600': props.variant === 'danger',
  'bg-amber-500 hover:bg-amber-600': props.variant === 'warning',
  'bg-blue-500 hover:bg-blue-600': props.variant === 'info',
  'bg-flame-500 hover:bg-flame-600 text-white': props.variant === 'logout',
}))
</script>

<style scoped>
.confirm-modal-fade-enter-active,
.confirm-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-modal-fade-enter-from,
.confirm-modal-fade-leave-to {
  opacity: 0;
}
.confirm-modal-fade-enter-from .relative,
.confirm-modal-fade-leave-to .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.confirm-modal-fade-enter-active .relative {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
</style>
