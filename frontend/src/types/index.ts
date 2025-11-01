// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
  location: string;
  birth_date: string | null;
  avatar: string | null;
  phone_number: string;
  is_verified: boolean;
  role: 'admin' | 'moderator' | 'user';
  role_display: string;
  is_active: boolean;
  date_created: string;
  date_updated: string;
  profile?: UserProfile;
}

export interface UserProfile {
  website: string;
  twitter_username: string;
  github_username: string;
  linkedin_username: string;
  company: string;
  job_title: string;
  skills: string;
  interests: string;
  skills_list: string[];
  interests_list: string[];
  receives_notifications: boolean;
  is_public: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  bio?: string;
  location?: string;
  phone_number?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  refresh: string;
  access: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  order: number;
  parent: number | null;
  posts_count: number;
  is_parent: boolean;
  children: Category[];
  created_at: string;
  updated_at: string;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  posts_count: number;
  created_at: string;
}

// Export Project Types
export * from './project';

// Post Types
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  author: User;
  category: Category | null;
  tags: Tag[];
  status: 'draft' | 'published' | 'archived';
  is_published: boolean;
  is_featured: boolean;
  allow_comments: boolean;
  meta_title: string;
  meta_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  likes_count: number;
  reading_time: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  comments?: Comment[];
}

export interface PostCreateData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: File | null;
  category?: number | null;
  tags_data?: string[];
  status: 'draft' | 'published' | 'archived';
  is_published: boolean;
  is_featured: boolean;
  allow_comments: boolean;
  meta_title?: string;
  meta_description?: string;
}

// Comment Types
export interface Comment {
  id: number;
  content: string;
  author: User;
  parent: number | null;
  replies_count: number;
  replies: Comment[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreateData {
  content: string;
  parent?: number | null;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}

// Theme Types
export interface ThemeMode {
  mode: 'light' | 'dark';
}

// Navigation Types
export interface NavItem {
  title: string;
  path: string;
  icon?: React.ComponentType;
  requiresAuth?: boolean;
}

// Form Types
export interface FormState {
  isLoading: boolean;
  error: string | null;
}

// Search and Filter Types
export interface SearchFilters {
  search?: string;
  category?: number;
  author?: number;
  status?: string;
  is_published?: boolean;
  is_featured?: boolean;
  ordering?: string;
  page?: number;
}

// Statistics Types
export interface Stats {
  total_posts: number;
  total_comments: number;
  total_likes: number;
  total_tags: number;
  total_categories?: number;
  parent_categories?: number;
  child_categories?: number;
}