import { create } from 'zustand'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

// Store pour gérer les toasts
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    
    set(state => ({ toasts: [...state.toasts, toast] }))
    
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },
  
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },
  
  success: (message) => get().addToast(message, 'success'),
  error: (message) => get().addToast(message, 'error', 5000),
  info: (message) => get().addToast(message, 'info'),
  warning: (message) => get().addToast(message, 'warning', 4000),
}))

// Composant Toast individuel
function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }
  
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
  }
  
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => onClose(), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])
  
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${bgColors[toast.type]} animate-slide-in`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-medium text-gray-900">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Composant conteneur de toasts
export function Toaster() {
  const { toasts, removeToast } = useToastStore()
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Hook personnalisé pour utiliser les toasts facilement
export const useToast = () => {
  const { success, error, info, warning } = useToastStore()
  return { success, error, info, warning }
}
