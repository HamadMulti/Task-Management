import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Post,
  PostCreateData,
  Category,
  Tag,
  Comment,
  CommentCreateData,
  PaginatedResponse,
  SearchFilters,
  Stats
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access);
              originalRequest.headers.Authorization = `Bearer ${response.access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login/', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register/', data);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await this.api.post('/auth/logout/', { refresh: refreshToken });
    }
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response: AxiosResponse<{ access: string }> = await this.api.post('/auth/token/refresh/', {
      refresh,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/current/');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch('/auth/profile/update/', data);
    return response.data;
  }

  async changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/change-password/', data);
    return response.data;
  }

  // Posts Methods
  async getPosts(filters?: SearchFilters): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response: AxiosResponse<PaginatedResponse<Post>> = await this.api.get(`/posts/?${params.toString()}`);
    return response.data;
  }

  async getPost(slug: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${slug}/`);
    return response.data;
  }

  async createPost(data: PostCreateData): Promise<Post> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags_data' && Array.isArray(value)) {
          value.forEach((tag) => formData.append('tags_data', tag));
        } else if (key === 'featured_image' && value instanceof File) {
          formData.append('featured_image', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response: AxiosResponse<Post> = await this.api.post('/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updatePost(slug: string, data: Partial<PostCreateData>): Promise<Post> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags_data' && Array.isArray(value)) {
          value.forEach((tag) => formData.append('tags_data', tag));
        } else if (key === 'featured_image' && value instanceof File) {
          formData.append('featured_image', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response: AxiosResponse<Post> = await this.api.patch(`/posts/${slug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePost(slug: string): Promise<void> {
    await this.api.delete(`/posts/${slug}/`);
  }

  async toggleLike(slug: string): Promise<{ liked: boolean; likes_count: number }> {
    const response: AxiosResponse<{ liked: boolean; likes_count: number }> = await this.api.post(`/posts/${slug}/like/`);
    return response.data;
  }

  async toggleBookmark(slug: string): Promise<{ bookmarked: boolean }> {
    const response: AxiosResponse<{ bookmarked: boolean }> = await this.api.post(`/posts/${slug}/bookmark/`);
    return response.data;
  }

  async getBookmarks(): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts/bookmarks/');
    return response.data;
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get(`/posts/user/${userId}/`);
    return response.data;
  }

  // Comments Methods
  async getPostComments(postSlug: string): Promise<Comment[]> {
    const response: AxiosResponse<Comment[]> = await this.api.get(`/posts/${postSlug}/comments/`);
    return response.data;
  }

  async createComment(postSlug: string, data: CommentCreateData): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/posts/${postSlug}/comments/`, data);
    return response.data;
  }

  // Categories Methods
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories/');
    return response.data;
  }

  async getCategoryTree(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories/tree/');
    return response.data;
  }

  async getCategory(slug: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.get(`/categories/${slug}/`);
    return response.data;
  }

  // Tags Methods
  async getTags(): Promise<Tag[]> {
    const response: AxiosResponse<Tag[]> = await this.api.get('/posts/tags/');
    return response.data;
  }

  // Statistics Methods
  async getPostStats(): Promise<Stats> {
    const response: AxiosResponse<Stats> = await this.api.get('/posts/stats/');
    return response.data;
  }

  async getCategoryStats(): Promise<Stats> {
    const response: AxiosResponse<Stats> = await this.api.get('/categories/stats/');
    return response.data;
  }

  // Users Methods
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/auth/users/');
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/auth/users/${id}/`);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/auth/users/${id}/`, data);
    return response.data;
  }

  async promoteUser(id: number): Promise<{ message: string; user: User }> {
    const response = await this.api.post(`/auth/admin/users/${id}/promote/`);
    return response.data;
  }

  async demoteUser(id: number): Promise<{ message: string; user: User }> {
    const response = await this.api.post(`/auth/admin/users/${id}/demote/`);
    return response.data;
  }

  // Generic HTTP methods for custom endpoints
  async get(url: string): Promise<any> {
    const response = await this.api.get(url);
    return response;
  }

  async post(url: string, data?: any): Promise<any> {
    const response = await this.api.post(url, data);
    return response;
  }

  async put(url: string, data?: any): Promise<any> {
    const response = await this.api.put(url, data);
    return response;
  }

  async patch(url: string, data?: any): Promise<any> {
    const response = await this.api.patch(url, data);
    return response;
  }

  async delete(url: string): Promise<any> {
    const response = await this.api.delete(url);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;