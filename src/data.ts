import { Product, User, Chat, DashboardMetrics } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Gamer',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  rating: 4.8,
  reviewsCount: 124,
  isVerified: true,
  joinedAt: '2023-01-15',
};

export const MOCK_USERS: Record<string, User> = {
  'u2': {
    id: 'u2',
    name: 'Rei do Retro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Retro',
    rating: 4.9,
    reviewsCount: 342,
    isVerified: true,
    joinedAt: '2022-11-05',
  },
  'u3': {
    id: 'u3',
    name: 'PC Builder Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Builder',
    rating: 4.5,
    reviewsCount: 89,
    isVerified: false,
    joinedAt: '2024-02-20',
  }
};

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_CHATS: Chat[] = [];

export const MOCK_DASHBOARD: DashboardMetrics = {
  totalSales: 0,
  activeListings: 0,
  averageRating: 0,
  pendingDeliveries: 0,
  salesData: [
    { name: 'Jan', sales: 0 },
    { name: 'Fev', sales: 0 },
    { name: 'Mar', sales: 0 },
    { name: 'Abr', sales: 0 },
    { name: 'Mai', sales: 0 },
    { name: 'Jun', sales: 0 },
  ]
};
