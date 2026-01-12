import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-CI', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    farmer: 'Paysan',
    consumer: 'Consommateur',
    transporter: 'Transporteur',
    merchant: 'Commerçant',
    processor: 'Transformateur',
    cooperative: 'Coopérative',
    association: 'Association',
    union: 'Union',
    federation: 'Fédération',
    interprofession: 'Interprofession',
    independent: 'Indépendant',
    admin: 'Administrateur',
    strategic_actor: 'Acteur Stratégique',
  }
  return labels[role] || role
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    in_delivery: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    completed: 'Terminée',
    failed: 'Échouée',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-secondary text-white',
    confirmed: 'bg-accent text-white',
    preparing: 'bg-accent text-white',
    in_delivery: 'bg-primary text-white',
    delivered: 'bg-success text-white',
    cancelled: 'bg-destructive text-white',
    completed: 'bg-success text-white',
    failed: 'bg-destructive text-white',
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}
