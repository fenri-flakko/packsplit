import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  type Locale,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { DAY_NAMES } from '@/types'

const locale: Locale = es

export function getIsoDayOfWeek(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function getDayName(date: Date): string {
  const isoDay = getIsoDayOfWeek(date)
  return DAY_NAMES[isoDay - 1]
}

export function formatFullDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale })
}

export function formatShortDate(date: Date): string {
  return format(date, 'd MMM', { locale })
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

export function formatWeekRange(start: Date, end: Date): string {
  const startStr = format(start, "d 'de' MMMM", { locale })
  const endStr = format(end, "d 'de' MMMM 'de' yyyy", { locale })
  return `Semana del ${startStr} al ${endStr}`
}

export function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
