import React from 'react';
import ProductManagement from '@/components/ProductManagement';

const ProductsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-1">Manage your store inventory and catalog</p>
            </div>

            <ProductManagement />
        </div>
    );
};

export default ProductsPage;
