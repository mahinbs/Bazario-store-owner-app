import React from 'react';
import Analytics from '@/components/Analytics';
import { Card, CardContent } from "@/components/ui/card";
import { Store } from 'lucide-react';

const DashboardHome = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your store performance</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Analytics />
            </div>
        </div>
    );
};

export default DashboardHome;
