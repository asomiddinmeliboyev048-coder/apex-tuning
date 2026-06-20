export interface User {
  uid: string
  username: string
  email: string
  displayName: string
  photoURL: string
  bio: string
  role: 'user' | 'admin'
  currentCar: string
  carColor: string
  carRim: string
  followers: string[]
  following: string[]
  createdAt: any
}

export interface Car {
  id: string
  name: string
  modelPath: string
  thumbnailURL: string
  available: boolean
}

export interface Product {
  id: string
  name: string
  price: number
  imageURL: string
  category: string
  description: string
  stock: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
  fullName: string
  email: string
  phone: string
  pickupTime: any
  status: 'new' | 'processing' | 'ready' | 'done'
  createdAt: any
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageURL: string
}

export interface Post {
  id: string
  userId: string
  videoURL: string
  youtubeURL?: string
  title: string
  thumbnailURL: string
  likes: string[]
  views: number
  status: 'pending' | 'approved' | 'rejected'
  isAdminPost: boolean
  createdAt: any
}

export interface Message {
  id: string
  senderId: string
  type: 'text' | 'voice' | 'video' | 'image'
  content: string
  voiceURL?: string
  videoURL?: string
  imageURL?: string
  reactions: Record<string, string[]>
  readBy: string[]
  createdAt: number
}

export interface Story {
  id: string
  userId: string
  mediaURL: string
  mediaType: 'image' | 'video'
  viewers: string[]
  likes: string[]
  expiresAt: any
  createdAt: any
}

export interface Notification {
  id: string
  type: 'message' | 'follow' | 'like' | 'order' | 'story_view' | 'video_approved'
  fromUserId: string
  fromUserName: string
  fromUserPhoto: string
  content: string
  read: boolean
  link?: string
  createdAt: any
}
