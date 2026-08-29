import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Wallet, AlertCircle, Info, Loader2 } from "lucide-react";
import { ordersAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CommissionOrder {
    id: string;
    customerName?: string;
    total: number;
    platformCommission: number;
    status: string;
    date: string;
}

interface CommissionSummary {
    totalOrders: number;
    totalRevenue: number;
    totalCommissionDeducted: number;
    netEarnings: number;
    averageCommissionPerOrder: number;
}

interface CommissionData {
    summary: CommissionSummary;
    orders: CommissionOrder[];
    commissionBreakdown: Array<{
        platformCommissionRate?: number;
    }>;
}

const COMPLETED_STATUSES = ['delivered', 'completed', 'cancelled', 'rejected'];

const mapPeriodToApi = (period: string): string => {
    if (period === 'week') return 'week';
    return 'month';
};

const formatCurrency = (amount: number) =>
    `₹${Math.round(amount).toLocaleString('en-IN')}`;

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const CommissionView = () => {
    const [period, setPeriod] = useState("week");
    const [isLoading, setIsLoading] = useState(true);
    const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
    const { toast } = useToast();

    const loadCommission = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await ordersAPI.getCommissionSummary(mapPeriodToApi(period));

            if (response.success && response.data) {
                setCommissionData(response.data);
            } else {
                setCommissionData(null);
                toast({
                    title: "Error Loading Commission",
                    description: response.error?.message || response.message || "Failed to load commission data",
                    variant: "destructive",
                });
            }
        } catch {
            setCommissionData(null);
            toast({
                title: "Error Loading Commission",
                description: "Something went wrong while loading commission data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [period, toast]);

    useEffect(() => {
        loadCommission();
    }, [loadCommission]);

    const summary = commissionData?.summary;
    const orders = commissionData?.orders ?? [];
    const commissionRate = commissionData?.commissionBreakdown?.[0]?.platformCommissionRate ?? 10;

    const pendingCommission = orders
        .filter((o) => !COMPLETED_STATUSES.includes(o.status?.toLowerCase()))
        .reduce((sum, o) => sum + (o.platformCommission || 0), 0);

    const getStatusBadgeClass = (status: string) => {
        const isComplete = COMPLETED_STATUSES.includes(status?.toLowerCase());
        return isComplete
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'text-primary border-primary/20 bg-primary/5';
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-0.5">Commission & Payouts</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Track your earnings and commission payments</p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-full sm:w-32 h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading commission data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <Card className="bazario-gradient border-0 text-white col-span-2 sm:col-span-1 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white/90 font-medium">Total Earnings</p>
                                        <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                            {formatCurrency(summary?.netEarnings ?? 0)}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-white/80 mt-1">Post commission</p>
                                    </div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                        <Wallet className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">Pending</p>
                                        <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(pendingCommission)}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1">From active orders</p>
                                    </div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 bg-card shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">Platform Fee</p>
                                        <p className="text-xl md:text-2xl font-bold text-primary mt-1">
                                            {formatCurrency(summary?.totalCommissionDeducted ?? 0)}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                                            {commissionRate}% commission
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="orders" className="mt-6">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl h-auto min-h-[44px] mb-4">
                            <TabsTrigger
                                value="orders"
                                className="rounded-lg text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Order History
                            </TabsTrigger>
                            <TabsTrigger
                                value="breakdown"
                                className="rounded-lg text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Commission Breakdown
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders">
                            <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                                <div className="p-0">
                                    {orders.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground text-sm">
                                            No orders found for this period
                                        </div>
                                    ) : (
                                        <>
                                            <div className="hidden md:block">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="px-6 py-3 font-medium">Order ID</th>
                                                            <th className="px-6 py-3 font-medium">Date</th>
                                                            <th className="px-6 py-3 font-medium">Amount</th>
                                                            <th className="px-6 py-3 font-medium">Commission ({commissionRate}%)</th>
                                                            <th className="px-6 py-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {orders.map((order) => (
                                                            <tr key={order.id} className="bg-white hover:bg-muted/50">
                                                                <td className="px-6 py-4 font-medium text-foreground">
                                                                    {order.id.slice(0, 8).toUpperCase()}
                                                                </td>
                                                                <td className="px-6 py-4 text-muted-foreground">{formatDate(order.date)}</td>
                                                                <td className="px-6 py-4 font-medium">{formatCurrency(order.total)}</td>
                                                                <td className="px-6 py-4 text-destructive">
                                                                    -{formatCurrency(order.platformCommission || 0)}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge
                                                                        variant={COMPLETED_STATUSES.includes(order.status?.toLowerCase()) ? 'secondary' : 'outline'}
                                                                        className={getStatusBadgeClass(order.status)}
                                                                    >
                                                                        {formatStatus(order.status)}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="md:hidden divide-y divide-gray-100">
                                                {orders.map((order) => (
                                                    <div key={order.id} className="p-4 bg-card space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="font-semibold text-foreground block">
                                                                    {order.id.slice(0, 8).toUpperCase()}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">{formatDate(order.date)}</span>
                                                            </div>
                                                            <Badge
                                                                variant={COMPLETED_STATUSES.includes(order.status?.toLowerCase()) ? 'secondary' : 'outline'}
                                                                className={`text-[10px] px-2 py-0.5 ${getStatusBadgeClass(order.status)}`}
                                                            >
                                                                {formatStatus(order.status)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded-lg">
                                                            <div>
                                                                <span className="text-muted-foreground block text-xs">Order Amount</span>
                                                                <span className="font-semibold">{formatCurrency(order.total)}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-muted-foreground block text-xs">Commission</span>
                                                                <span className="font-semibold text-destructive">
                                                                    -{formatCurrency(order.platformCommission || 0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="breakdown">
                            <Card className="border border-border/50 bg-card shadow-sm rounded-xl p-4 md:p-8 text-center">
                                <div className="max-w-md mx-auto space-y-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Commission Structure</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Bazario Store Hub charges a <strong>{commissionRate}% commission</strong> on every fulfilled order.
                                    </p>
                                    <div className="bg-muted/30 p-4 rounded-xl text-left space-y-2 text-sm border border-border/50">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Order Value</span>
                                            <span className="font-medium">₹100.00</span>
                                        </div>
                                        <div className="flex justify-between text-destructive">
                                            <span>Platform Fee ({commissionRate}%)</span>
                                            <span>-₹{(100 * commissionRate / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-foreground">
                                            <span>Your Payout</span>
                                            <span>₹{(100 - 100 * commissionRate / 100).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {summary && (
                                        <div className="text-left text-sm text-muted-foreground space-y-1 pt-2">
                                            <p>Total orders: {summary.totalOrders}</p>
                                            <p>Avg. commission per order: {formatCurrency(summary.averageCommissionPerOrder)}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default CommissionView;
