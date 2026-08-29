const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Types
export interface SignupData {
    email: string;
    password: string;
    storeName: string;
    ownerName: string;
    phone: string;
    address: string;
    businessType: string;
    category: string;
    description?: string;
    gstNumber?: string;
    panNumber?: string;
    storeImages?: string[];
    serviceTypes: string[];
    deliveryRadius: number;
    minOrderAmount: number;
    deliveryFee: number;
    estimatedDeliveryTime: number;
    upiId: string;
    bankAccountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolderName: string;
    latitude?: number;
    longitude?: number;
    agreeToTerms: boolean;
    agreeToCommission: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        message: string;
        details?: any[];
    };
    emailVerificationSent?: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    order_type: 'delivery' | 'pickup';
    status: string;
    total_amount: number;
    delivery_fee: number;
    rider_id?: string;
    estimated_delivery_time?: number;
    created_at: string;
    order_items: OrderItem[];
    riders?: {
        id: string;
        name: string;
        phone: string;
        email?: string;
    };
}

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
        name: string;
        image_url?: string;
    };
}

export interface Offer {
    id: string;
    store_id: string;
    title: string;
    description?: string;
    offer_type: 'percentage' | 'flat' | 'free_delivery' | 'buy_one_get_one';
    discount_value?: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    valid_from: string;
    valid_until?: string;
    is_active: boolean;
    usage_limit?: number;
    used_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateOfferData {
    title: string;
    description?: string;
    offer_type: 'percentage' | 'flat' | 'free_delivery' | 'buy_one_get_one';
    discount_value?: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    valid_until?: string;
    usage_limit?: number;
    is_active?: boolean;
}

const getAuthToken = () => localStorage.getItem('auth_token');

async function apiRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = true
): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (requireAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return {
            success: false,
            error: {
                message: data?.error?.message || data?.message || 'Request failed',
                details: data?.error?.details || data?.errors,
            },
        };
    }

    return data;
}

const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    return digits;
};

const saveSession = (data: any) => {
    const token = data?.session?.accessToken;
    if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(data));
    }
};

export const authAPI = {
    signup: async (data: SignupData): Promise<ApiResponse> =>
        apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }, false),

    login: async (data: LoginData): Promise<ApiResponse> => {
        const response = await apiRequest<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }, false);
        if (response.success && response.data) saveSession(response.data);
        return response;
    },

    logout: async (): Promise<ApiResponse> => {
        const response = await apiRequest('/auth/logout', { method: 'POST' });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return response;
    },

    resendVerification: async (email: string): Promise<ApiResponse> =>
        apiRequest('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }, false),

    sendOTP: async (phoneNumber: string, purpose: 'login' | 'signup' = 'login'): Promise<ApiResponse> => {
        const type = purpose === 'signup' ? 'phone_verification' : 'login';
        return apiRequest('/otp/send', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizePhone(phoneNumber), type }),
        }, false);
    },

    verifyOTP: async (phoneNumber: string, otp: string, purpose: 'login' | 'signup' = 'login', userData?: any): Promise<ApiResponse> => {
        const type = purpose === 'signup' ? 'store_owner_registration' : 'login';
        const response = await apiRequest<any>('/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizePhone(phoneNumber), otp, type, userData }),
        }, false);
        if (response.success && response.data) saveSession(response.data);
        return response;
    },

    checkPhoneExists: async (phoneNumber: string): Promise<ApiResponse> =>
        apiRequest('/otp/check-phone', {
            method: 'POST',
            body: JSON.stringify({ phone: normalizePhone(phoneNumber) }),
        }, false),

    uploadRegistrationImages: async (files: File[]): Promise<ApiResponse> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        return apiRequest('/auth/upload-registration-images', { method: 'POST', body: formData }, false);
    },
};

export const storeAPI = {
    getProfile: async (): Promise<ApiResponse> => apiRequest('/stores/profile'),
    updateProfile: async (data: any): Promise<ApiResponse> =>
        apiRequest('/stores/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getTimings: async (): Promise<ApiResponse> => apiRequest('/stores/timings'),
    updateTimings: async (timings: any[]): Promise<ApiResponse> =>
        apiRequest('/stores/timings', { method: 'POST', body: JSON.stringify({ timings }) }),
    uploadImage: async (file: File): Promise<ApiResponse> => {
        const formData = new FormData();
        formData.append('image', file);
        return apiRequest('/stores/upload-image', { method: 'POST', body: formData });
    },
    uploadImages: async (files: File[]): Promise<ApiResponse> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        return apiRequest('/stores/upload-images', { method: 'POST', body: formData });
    },
    deleteImage: async (imageUrl: string): Promise<ApiResponse> =>
        apiRequest('/stores/delete-image', { method: 'DELETE', body: JSON.stringify({ imageUrl }) }),
};

export const productsAPI = {
    getProducts: async (params?: Record<string, string>): Promise<ApiResponse<Product[]>> => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiRequest(`/products${query}`);
    },
    getProduct: async (id: string): Promise<ApiResponse<Product>> => apiRequest(`/products/${id}`),
    createProduct: async (data: FormData): Promise<ApiResponse<Product>> =>
        apiRequest('/products', { method: 'POST', body: data }),
    updateProduct: async (id: string, data: FormData): Promise<ApiResponse<Product>> =>
        apiRequest(`/products/${id}`, { method: 'PUT', body: data }),
    deleteProduct: async (id: string): Promise<ApiResponse> =>
        apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

export const ordersAPI = {
    getOrders: async (params?: Record<string, string>): Promise<ApiResponse<Order[]>> => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiRequest(`/orders${query}`);
    },
    getOrder: async (id: string): Promise<ApiResponse<Order>> => apiRequest(`/orders/${id}`),
    updateOrderStatus: async (id: string, status: string, estimatedTime?: number): Promise<ApiResponse> =>
        apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, estimated_delivery_time: estimatedTime }),
        }),
    acceptOrder: async (id: string, estimatedTime?: number): Promise<ApiResponse> =>
        apiRequest(`/orders/${id}/accept`, {
            method: 'PUT',
            body: JSON.stringify({ estimated_delivery_time: estimatedTime }),
        }),
    rejectOrder: async (id: string, reason?: string): Promise<ApiResponse> =>
        apiRequest(`/orders/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ rejection_reason: reason }),
        }),
    getOrderStats: async (period?: string): Promise<ApiResponse> => {
        const query = period ? `?period=${period}` : '';
        return apiRequest(`/orders/stats/summary${query}`);
    },
    getCommissionSummary: async (period: string = 'today') =>
        apiRequest(`/orders/commission-summary?period=${period}`),
};

export const analyticsAPI = {
    getDashboard: async (period?: string): Promise<ApiResponse> => {
        const query = period ? `?period=${period}` : '';
        return apiRequest(`/analytics/dashboard${query}`);
    },
    getProducts: async (period?: string, limit?: number): Promise<ApiResponse> => {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (limit) params.append('limit', String(limit));
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/analytics/products${query}`);
    },
    getRevenue: async (period?: string, groupBy?: string): Promise<ApiResponse> => {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (groupBy) params.append('groupBy', groupBy);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/analytics/revenue${query}`);
    },
};

export const offersAPI = {
    getOffers: async (params?: Record<string, string>): Promise<ApiResponse<{ offers: Offer[]; pagination: any }>> => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiRequest(`/offers${query}`);
    },
    createOffer: async (data: CreateOfferData): Promise<ApiResponse<Offer>> =>
        apiRequest('/offers', { method: 'POST', body: JSON.stringify(data) }),
    updateOffer: async (id: string, data: Partial<CreateOfferData>): Promise<ApiResponse<Offer>> =>
        apiRequest(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOffer: async (id: string): Promise<ApiResponse<void>> =>
        apiRequest(`/offers/${id}`, { method: 'DELETE' }),
    toggleOffer: async (id: string): Promise<ApiResponse<Offer>> =>
        apiRequest(`/offers/${id}/toggle`, { method: 'POST' }),
    getAnalytics: async (): Promise<ApiResponse<any>> => apiRequest('/offers/analytics'),
};

export const isAuthenticated = (): boolean => !!localStorage.getItem('auth_token');

export const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
};
