export type UserRole =
  | "farmer"
  | "consumer"
  | "transporter"
  | "merchant"
  | "processor"
  | "cooperative"
  | "association"
  | "union"
  | "federation"
  | "interprofession"
  | "independent"
  | "admin"
  | "strategic_actor"
  | "USER"

export type AffiliationStatus = "independent" | "affiliated"

export type InstitutionType =
  | "cooperative"
  | "association"
  | "union"
  | "federation"
  | "interprofession"

export type StrategicActorType =
  | "exporter"
  | "major_buyer"
  | "institution"
  | "ministry"
  | "public_project"
  | "parapublic_project"

export interface Filiere {
  id: string
  libelle: string
  status: number
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Institution {
  id: string
  name: string
  agrement?: string
  rccm?: string
  ncc?: string
  adresse?: string
  yearOfCreation?: string
  filiere?: Filiere
  createdAt: string
  updatedAt: string
  logo?: string
  status: number
  deleted: boolean
  matricule?: string
  presidentName?: string
  numberOfMembers?: number
  contactPhone?: string
  contactEmail?: string
  secondaryFilieres?: string[]
}

export interface User {
  id: string
  phone: string
  name: string
  role?: UserRole | null
  matricule?: string
  photo?: string
  location?: string

  // Affiliation
  affiliationStatus?: AffiliationStatus
  cooperative?: string
  association?: string
  union?: string
  federation?: string
  interprofession?: string

  // Financial
  balance?: number
  pendingBalance?: number

  // Institution-specific
  institutionType?: InstitutionType
  members?: User[]
  commissionRate?: number
  onboardingCompleted?: boolean
  currentOnboardingStep?: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
  images: string[]
  seller: {
    id: string
    name: string
    matricule: string
    cooperative?: string
    location: string
    photo?: string
    rating?: number
  }
  quantity: number
  available: boolean
  tags?: string[]
  verified?: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  timestamp: Date
  read: boolean
  type?: "text" | "image" | "order" | "voice" | "location"
  orderData?: unknown
  voiceUrl?: string
  voiceDuration?: number
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

export interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    photo?: string
    role: UserRole
  }
  lastMessage: string
  lastMessageTime: Date
  unread: number
  orderId?: string
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "in_delivery" | "delivered" | "cancelled"

export interface Order {
  id: string
  orderNumber: string
  date: Date
  items: {
    product: Product
    quantity: number
    price: number
  }[]
  seller: {
    id: string
    name: string
    photo?: string
  }
  buyer?: {
    id: string
    name: string
    photo?: string
  }
  status: OrderStatus
  total: number
  deliveryAddress: string
  paymentMethod: string
  timeline?: {
    status: string
    date: Date
    completed: boolean
  }[]
}

export type TransactionType = "sale" | "purchase" | "withdrawal" | "commission"
export type TransactionStatus = "pending" | "completed" | "failed"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: Date
  description: string
  status: TransactionStatus
  orderId?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type Screen =
  | "splash"
  | "signup"
  | "login"
  | "role-selection"
  | "onboarding"
  | "home"
  | "marketplace"
  | "product-detail"
  | "cart"
  | "orders"
  | "messages"
  | "chat"
  | "wallet"
  | "profile"
  | "settings"
  | "my-products"
  | "add-product"
  | "missions"
  | "courses"
  | "members"
  | "add-member"
  | "stats"
  | "accounting"
  | "training"
  | "order-detail"
  | "edit-product"
  | "seller-profile"
