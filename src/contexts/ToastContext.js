import { createContext, useContext, useState } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"

const ToastContext = createContext(undefined)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (title, message, type) => {
    const id = Date.now().toString()
    const newToast = { id, title, message, type }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const getToastColor = (type) => {
    switch (type) {
      case "success":
        return "#10B981"
      case "error":
        return "#EF4444"
      case "warning":
        return "#F59E0B"
      case "info":
        return "#3B82F6"
      default:
        return "#6B7280"
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map((toast) => (
          <Animated.View key={toast.id} style={[styles.toast, { backgroundColor: getToastColor(toast.type) }]}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  toastMessage: {
    color: "white",
    fontSize: 14,
  },
})
