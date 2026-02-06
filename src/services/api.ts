// Mock API Configuration
// This entire file is now a mock implementation for frontend-only demonstration

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

// Mock Data Storage using LocalStorage for persistence during session
const getStoredData = (key: string, defaultData: any) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
};

const setStoredData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initial Mock Data
const MOCK_PRODUCTS: Product[] = [
    {
        id: '101',
        name: 'Hyderabadi Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken and authentic spices',
        price: 350,
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80',
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        id: '102',
        name: 'Paneer Butter Masala',
        description: 'Rich and creamy tomato gravy with soft cottage cheese cubes',
        price: 280,
        category: 'Curries',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80',
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        id: '103',
        name: 'Tandoori Chicken Platter',
        description: 'Spicy marinated chicken roasted to perfection in a clay oven',
        price: 450,
        category: 'Starters',
        image_url: 'https://images.unsplash.com/photo-1628294895950-98052523e036?auto=format&fit=crop&q=80',
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        id: '104',
        name: 'Mango Lassi',
        description: 'Refreshing yogurt-based drink with sweet mango pulp',
        price: 120,
        category: 'Beverages',
        image_url: 'https://images.unsplash.com/photo-1543362174-8b63e9c70814?auto=format&fit=crop&q=80',
        is_active: false,
        created_at: new Date().toISOString()
    }
];

const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-12345678',
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        customer_address: '123 Main St, Bazario City',
        order_type: 'delivery',
        status: 'pending',
        total_amount: 570,
        delivery_fee: 30,
        created_at: new Date().toISOString(),
        order_items: [
            {
                id: 'item-1',
                product_id: '1',
                quantity: 1,
                price: 450,
                products: { name: 'Organic Honey' }
            },
            {
                id: 'item-2',
                product_id: '2',
                quantity: 1,
                price: 120,
                products: { name: 'Premium Basmati Rice' }
            }
        ]
    }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Implementation
const mockRequest = async <T>(data: T, shouldFail = false): Promise<ApiResponse<T>> => {
    await delay(800); // Simulate network latency
    if (shouldFail) {
        return {
            success: false,
            error: { message: 'Mock Error: Operation failed' }
        };
    }
    return {
        success: true,
        data: data
    };
};

// Auth API
export const authAPI = {
    signup: async (data: SignupData): Promise<ApiResponse> => {
        console.log('Mock Signup:', data);
        return mockRequest({ message: 'Signup successful' });
    },

    login: async (data: LoginData): Promise<ApiResponse> => {
        console.log('Mock Login:', data);
        const mockUser = {
            user: { email: data.email, id: 'user-123' },
            session: { accessToken: 'mock-jwt-token' },
            storeOwner: { storeName: 'My Awesome Store', ownerName: 'Admin User' }
        };

        localStorage.setItem('auth_token', mockUser.session.accessToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));

        return mockRequest(mockUser);
    },

    logout: async (): Promise<ApiResponse> => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return mockRequest({ message: 'Logged out successfully' });
    },

    resendVerification: async (email: string): Promise<ApiResponse> => {
        return mockRequest({ message: 'Verification email sent' });
    },

    // OTP Authentication
    sendOTP: async (phoneNumber: string, purpose: 'login' | 'signup' = 'login'): Promise<ApiResponse> => {
        console.log(`Mock OTP sent to ${phoneNumber} for ${purpose}`);
        return mockRequest({ message: 'OTP sent successfully' });
    },

    verifyOTP: async (phoneNumber: string, otp: string, purpose: 'login' | 'signup' = 'login', userData?: any): Promise<ApiResponse> => {
        if (otp === '1234') {
            const mockUser = {
                user: { phone: phoneNumber, id: 'user-otp-123' },
                session: { accessToken: 'mock-otp-jwt-token' },
                storeOwner: {
                    storeName: userData?.storeName || 'OTP Store',
                    ownerName: userData?.ownerName || 'Mobile User'
                }
            };

            localStorage.setItem('auth_token', mockUser.session.accessToken);
            localStorage.setItem('user_data', JSON.stringify(mockUser));

            return mockRequest({
                success: true,
                data: mockUser,
                emailVerificationSent: purpose === 'signup'
            });
        }
        return {
            success: false,
            error: { message: 'Invalid OTP. Use 1234' }
        };
    },

    checkPhoneExists: async (phoneNumber: string): Promise<ApiResponse> => {
        return mockRequest({ exists: false });
    },

    uploadRegistrationImages: async (files: File[]): Promise<ApiResponse> => {
        const mockImages = files.map(f => ({ imageUrl: URL.createObjectURL(f) }));
        return mockRequest({ images: mockImages });
    },
};

// Store API
export const storeAPI = {
    getProfile: async (): Promise<ApiResponse> => {
        return mockRequest({
            storeName: 'My Awesome Store',
            ownerName: 'Admin User',
            phone: '9876543210',
            address: '123 Main St, Bazario City',
            description: 'Best store in town',
            storeImages: []
        });
    },

    updateProfile: async (data: any): Promise<ApiResponse> => {
        return mockRequest({ message: 'Profile updated' });
    },

    getTimings: async (): Promise<ApiResponse> => {
        return mockRequest([
            { day: 'Monday', open: '09:00', close: '21:00', isOpen: true },
            { day: 'Tuesday', open: '09:00', close: '21:00', isOpen: true },
            // ... add more days as needed
        ]);
    },

    updateTimings: async (timings: any[]): Promise<ApiResponse> => {
        return mockRequest({ message: 'Timings updated' });
    },

    uploadImage: async (file: File): Promise<ApiResponse> => {
        return mockRequest({ imageUrl: URL.createObjectURL(file) });
    },

    uploadImages: async (files: File[]): Promise<ApiResponse> => {
        const mockImages = files.map(f => ({ imageUrl: URL.createObjectURL(f) }));
        return mockRequest({ images: mockImages });
    },

    deleteImage: async (imageUrl: string): Promise<ApiResponse> => {
        return mockRequest({ message: 'Image deleted' });
    },
};

// Products API
export const productsAPI = {
    getProducts: async (params?: any): Promise<ApiResponse<Product[]>> => {
        const products = getStoredData('mock_products', MOCK_PRODUCTS);
        return mockRequest(products);
    },

    getProduct: async (id: string): Promise<ApiResponse<Product>> => {
        const products = getStoredData('mock_products', MOCK_PRODUCTS);
        const product = products.find((p: Product) => p.id === id);
        return product ? mockRequest(product) : { success: false, error: { message: 'Product not found' } };
    },

    createProduct: async (data: FormData): Promise<ApiResponse<Product>> => {
        const newProduct: Product = {
            id: Date.now().toString(),
            name: data.get('name') as string,
            description: data.get('description') as string,
            price: Number(data.get('price')),
            category: data.get('category') as string,
            is_active: data.get('is_active') === 'true',
            created_at: new Date().toISOString(),
            image_url: 'https://via.placeholder.com/150' // Mock image
        };
        const products = getStoredData('mock_products', MOCK_PRODUCTS);
        setStoredData('mock_products', [newProduct, ...products]);
        return mockRequest(newProduct);
    },

    updateProduct: async (id: string, data: FormData): Promise<ApiResponse<Product>> => {
        const products = getStoredData('mock_products', MOCK_PRODUCTS);
        const index = products.findIndex((p: Product) => p.id === id);
        if (index > -1) {
            const updatedProduct = {
                ...products[index],
                name: data.get('name') as string,
                description: data.get('description') as string,
                price: Number(data.get('price')),
                category: data.get('category') as string,
                is_active: data.get('is_active') === 'true',
            };
            products[index] = updatedProduct;
            setStoredData('mock_products', products);
            return mockRequest(updatedProduct);
        }
        return { success: false, error: { message: 'Product not found' } };
    },

    deleteProduct: async (id: string): Promise<ApiResponse> => {
        const products = getStoredData('mock_products', MOCK_PRODUCTS);
        const filtered = products.filter((p: Product) => p.id !== id);
        setStoredData('mock_products', filtered);
        return mockRequest({ message: 'Product deleted' });
    },
};

// Orders API
export const ordersAPI = {
    getOrders: async (params?: any): Promise<ApiResponse<Order[]>> => {
        const orders = getStoredData('mock_orders', MOCK_ORDERS);
        return mockRequest(orders);
    },

    getOrder: async (id: string): Promise<ApiResponse<Order>> => {
        const orders = getStoredData('mock_orders', MOCK_ORDERS);
        const order = orders.find((o: Order) => o.id === id);
        return order ? mockRequest(order) : { success: false, error: { message: 'Order not found' } };
    },

    updateOrderStatus: async (id: string, status: string, estimatedTime?: number): Promise<ApiResponse> => {
        const orders = getStoredData('mock_orders', MOCK_ORDERS);
        const index = orders.findIndex((o: Order) => o.id === id);
        if (index > -1) {
            orders[index].status = status;
            setStoredData('mock_orders', orders);
            return mockRequest({ message: 'Status updated' });
        }
        return { success: false, error: { message: 'Order not found' } };
    },

    getOrderStats: async (period?: string): Promise<ApiResponse> => {
        return mockRequest({
            totalOrders: 150,
            totalRevenue: 45000,
            pendingOrders: 5,
            completedOrders: 140
        });
    },

    // Added for CommissionView
    getCommissionSummary: async (period: string = 'today') => {
        return mockRequest({
            period,
            summary: {
                totalOrders: 25,
                totalRevenue: 12500,
                totalCommissionDeducted: 1250,
                totalDeliveryFees: 500,
                totalCodFees: 0,
                netEarnings: 10750,
                averageOrderValue: 500,
                averageCommissionPerOrder: 50
            },
            orders: [
                {
                    id: 'ORD-88776655',
                    customerName: 'Mock Customer',
                    total: 550,
                    deliveryFee: 30,
                    platformCommission: 55,
                    codFee: 0,
                    netAmount: 495,
                    status: 'delivered',
                    date: new Date().toISOString()
                }
            ],
            commissionBreakdown: [
                {
                    orderId: 'ORD-88776655',
                    orderTotal: 550,
                    platformCommissionRate: 10,
                    platformCommissionAmount: 55,
                    riderEarning: 25,
                    deliveryFee: 30,
                    codFee: 0,
                    netStoreEarning: 495,
                    date: new Date().toISOString()
                }
            ]
        });
    }
};

// Analytics API
export const analyticsAPI = {
    getDashboard: async (period?: string): Promise<ApiResponse> => {
        return mockRequest({
            sales: [100, 200, 150, 300, 250, 400],
            visitors: [50, 80, 60, 100, 90, 120]
        });
    },

    getProducts: async (period?: string, limit?: number): Promise<ApiResponse> => {
        return mockRequest([
            { name: 'Top Product 1', sales: 50 },
            { name: 'Top Product 2', sales: 30 }
        ]);
    },

    getRevenue: async (period?: string, groupBy?: string): Promise<ApiResponse> => {
        return mockRequest([
            { date: '2023-10-01', revenue: 1000 },
            { date: '2023-10-02', revenue: 1500 }
        ]);
    },
};

// Offers API
export const offersAPI = {
    getOffers: async (params?: any): Promise<ApiResponse<{ offers: Offer[], pagination: any }>> => {
        return mockRequest({
            offers: [],
            pagination: { page: 1, limit: 10, total: 0 }
        });
    },

    createOffer: async (data: CreateOfferData): Promise<ApiResponse<Offer>> => {
        return mockRequest({
            id: 'offer-new',
            store_id: 'store-1',
            ...data,
            valid_from: new Date().toISOString(),
            is_active: true,
            used_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Offer);
    },

    updateOffer: async (id: string, data: Partial<CreateOfferData>): Promise<ApiResponse<Offer>> => {
        return mockRequest({ message: 'Offer updated' } as any);
    },

    deleteOffer: async (id: string): Promise<ApiResponse<void>> => {
        return mockRequest(undefined);
    },

    toggleOffer: async (id: string): Promise<ApiResponse<Offer>> => {
        return mockRequest({ message: 'Offer toggled' } as any);
    },

    getAnalytics: async (): Promise<ApiResponse<any>> => {
        return mockRequest({});
    },
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
};

// Helper function to get user data
export const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
};
