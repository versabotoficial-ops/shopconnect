export type User = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  joinedAt: string;
};

export type ProductStatus = 'available' | 'in_negotiation' | 'sold';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: 'games' | 'consoles' | 'pc' | 'accessories';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  seller: User;
  status: ProductStatus;
  createdAt: string;
  authenticityVerified: boolean;
  acceptsTrades: boolean;
  shipping: {
    type: 'local_pickup' | 'shipping' | 'both';
    estimatedDays: number;
  };
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  originalText?: string;
  language: string;
  timestamp: string;
  isSystem?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  reactions?: { emoji: string; userId: string }[];
  isStarred?: boolean;
  replyToMessageId?: string;
};

export type Chat = {
  id: string;
  productId: string;
  participants: User[];
  messages: Message[];
  lastUpdated: string;
  status: 'active' | 'completed' | 'dispute';
};

export type DashboardMetrics = {
  totalSales: number;
  activeListings: number;
  averageRating: number;
  pendingDeliveries: number;
  salesData: { name: string; sales: number }[];
};
