const API_BASE_URL = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  }

  async register(username: string, email: string, password: string, phone?: string) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, phone }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(username: string, phone?: string) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, phone }),
    });
  }

  async getItems(params?: { status?: string; category?: string; keyword?: string; type?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request(`/items?${searchParams.toString()}`);
  }

  async getItemById(id: number) {
    return this.request(`/items/${id}`);
  }

  async getMyItems(status?: string, type?: string) {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (type) searchParams.append('type', type);
    return this.request(`/items/my?${searchParams.toString()}`);
  }

  async createItem(formData: FormData) {
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '发布失败');
    }

    return data;
  }

  async updateItem(id: number, data: { title: string; description?: string; category?: string; location?: string; type?: string }) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: number) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  async cancelItem(id: number) {
    return this.request(`/items/${id}/cancel`, {
      method: 'POST',
    });
  }

  async createClaim(itemId: number, claimMessage?: string) {
    return this.request(`/claims/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ claimMessage }),
    });
  }

  async getClaims(status?: string) {
    const searchParams = status ? `?status=${status}` : '';
    return this.request(`/claims${searchParams}`);
  }

  async getMyClaims(status?: string) {
    const searchParams = status ? `?status=${status}` : '';
    return this.request(`/claims/my${searchParams}`);
  }

  async approveClaim(claimId: number) {
    return this.request(`/claims/${claimId}/approve`, {
      method: 'POST',
    });
  }

  async rejectClaim(claimId: number) {
    return this.request(`/claims/${claimId}/reject`, {
      method: 'POST',
    });
  }

  async getNotifications(isRead?: boolean) {
    const searchParams = isRead !== undefined ? `?isRead=${isRead}` : '';
    return this.request(`/notifications${searchParams}`);
  }

  async markNotificationAsRead(id: number) {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST',
    });
  }

  async sendMessage(receiverId: number, content: string, itemId?: number) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, itemId }),
    });
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(otherUserId: number, page?: number, limit?: number) {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', String(page));
    if (limit) searchParams.append('limit', String(limit));
    return this.request(`/messages/${otherUserId}?${searchParams.toString()}`);
  }

  async getUnreadMessageCount() {
    return this.request('/messages/unread-count');
  }
}

export const apiService = new ApiService();
