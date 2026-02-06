import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Wallet, AlertCircle, Info } from "lucide-react";

const CommissionView = () => {
    const [period, setPeriod] = useState("week");

    // Mock Data
    const commissionData = {
        totalOrders: 45,
        totalSales: 12500,
        totalCommission: 1250, // 10%
        pendingCommission: 450,
        paidCommission: 800,
        nextPayoutDate: "2024-02-15"
    };

    const orders = [
        { id: "ORD-001", date: "2024-02-06", amount: 560, commission: 56, status: "Pending" },
        { id: "ORD-002", date: "2024-02-05", amount: 110, commission: 11, status: "Paid" },
        { id: "ORD-003", date: "2024-02-05", amount: 240, commission: 24, status: "Paid" },
        { id: "ORD-004", date: "2024-02-04", amount: 890, commission: 89, status: "Paid" },
        { id: "ORD-005", date: "2024-02-03", amount: 120, commission: 12, status: "Paid" },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
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

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card className="bazario-gradient border-0 text-white col-span-2 sm:col-span-1 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/90 font-medium">Total Earnings</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                    ₹{commissionData.totalSales - commissionData.totalCommission}
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
                                    ₹{commissionData.pendingCommission}
                                </p>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">To be deducted</p>
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
                                    ₹{commissionData.totalCommission}
                                </p>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">10% commission</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order and Commission Breakdown Tabs */}
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
                            {/* Desktop View (Table) */}
                            <div className="hidden md:block">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Order ID</th>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium">Amount</th>
                                            <th className="px-6 py-3 font-medium">Commission (10%)</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="bg-white hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                                                <td className="px-6 py-4 font-medium">₹{order.amount}</td>
                                                <td className="px-6 py-4 text-destructive">-₹{order.commission}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={order.status === 'Paid' ? 'secondary' : 'outline'}
                                                        className={order.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-primary border-primary/20 bg-primary/5'}>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View (Cards) */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <div key={order.id} className="p-4 bg-card space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-foreground block">{order.id}</span>
                                                <span className="text-xs text-muted-foreground">{order.date}</span>
                                            </div>
                                            <Badge variant={order.status === 'Paid' ? 'secondary' : 'outline'}
                                                className={`text-[10px] px-2 py-0.5 ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'text-primary border-primary/20 bg-primary/5'}`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded-lg">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Order Amount</span>
                                                <span className="font-semibold">₹{order.amount}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-muted-foreground block text-xs">Commission</span>
                                                <span className="font-semibold text-destructive">-₹{order.commission}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                Bazario Store Hub charges a flat <strong>10% commission</strong> on every fulfilled order.
                            </p>
                            <div className="bg-muted/30 p-4 rounded-xl text-left space-y-2 text-sm border border-border/50">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Order Value</span>
                                    <span className="font-medium">₹100.00</span>
                                </div>
                                <div className="flex justify-between text-destructive">
                                    <span>Platform Fee (10%)</span>
                                    <span>-₹10.00</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-foreground">
                                    <span>Your Payout</span>
                                    <span>₹90.00</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CommissionView;
