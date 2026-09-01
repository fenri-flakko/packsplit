import { useState, useEffect, useCallback } from 'react'
import { isSameDay } from 'date-fns'

export function useCurrentDate(): Date {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const updateDate = useCallback(() => {
    const now = new Date()
    setCurrentDate((prev) => (isSameDay(prev, now) ? prev : now))
  }, [])

  useEffect(() => {
    const interval = setInterval(updateDate, 60_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateDate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [updateDate])

  return currentDate
}
