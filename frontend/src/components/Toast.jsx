// frontend/src/components/Toast.jsx
// Drop-in replacement for browser alert() — styled dark pill toast
// Usage: <Toast message="Link copied!" /> — auto-dismisses after 2s
// In Dashboard.jsx: use `toast` state instead of alert()

import { useEffect, useState } from 'react'
import '../styles/shared.css'

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return <div className="toast">{message}</div>
}