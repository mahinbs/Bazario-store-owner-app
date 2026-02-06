import React from 'react';
import StoreTimings from '@/components/StoreTimings';

const TimingsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Store Timings</h1>
                <p className="text-gray-600 mt-1">Manage your store operating hours</p>
            </div>

            <StoreTimings />
        </div>
    );
};

export default TimingsPage;
