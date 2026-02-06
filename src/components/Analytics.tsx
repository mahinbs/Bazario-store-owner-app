import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    Clock,
    Loader2,
    BarChart3,
    PieChart,
    Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyticsAPI } from "@/services/api";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    popularProducts: Array<{
        name: string;
        sales: number;
        revenue: number;
    }>;
    revenueGrowth: number;
    ordersGrowth: number;
}

const Analytics = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState("7d");
    const { toast } = useToast();

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setIsLoading(true);
            const response = await analyticsAPI.getDashboard(period);

            if (response.success && response.data) {
                setStats(response.data);
            } else {
                // Show empty state instead of error for now
                setStats({
                    totalRevenue: 0,
                    totalOrders: 0,
                    averageOrderValue: 0,
                    popularProducts: [],
                    revenueGrowth: 0,
                    ordersGrowth: 0
                });
            }
        } catch (error) {
            console.error('Analytics error:', error);
            // Set empty state
            setStats({
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                popularProducts: [],
                revenueGrowth: 0,
                ordersGrowth: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-0.5">Analytics Dashboard</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Track your store performance and insights</p>
                </div>

                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-full sm:w-32 h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1d">Today</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">3 Months</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Revenue */}
                <Card className="bazario-gradient border-0 shadow-lg text-white">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-white/90 font-medium truncate">Total Revenue</p>
                                <p className="text-lg md:text-2xl font-bold text-white mt-1">
                                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                                </p>
                                {stats?.revenueGrowth !== 0 && (
                                    <div className="flex items-center mt-1">
                                        <div className="bg-white/20 rounded px-1.5 py-0.5 flex items-center">
                                            {stats?.revenueGrowth > 0 ? (
                                                <TrendingUp className="w-3 h-3 text-white mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 text-white mr-1" />
                                            )}
                                            <span className="text-[10px] md:text-xs text-white font-medium">
                                                {Math.abs(stats?.revenueGrowth || 0)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Orders */}
                <Card className="bazario-gradient border-0 shadow-lg text-white">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-white/90 font-medium truncate">Total Orders</p>
                                <p className="text-lg md:text-2xl font-bold text-white mt-1">
                                    {stats?.totalOrders || 0}
                                </p>
                                {stats?.ordersGrowth !== 0 && (
                                    <div className="flex items-center mt-1">
                                        <div className="bg-white/20 rounded px-1.5 py-0.5 flex items-center">
                                            {stats?.ordersGrowth > 0 ? (
                                                <TrendingUp className="w-3 h-3 text-white mr-1" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3 text-white mr-1" />
                                            )}
                                            <span className="text-[10px] md:text-xs text-white font-medium">
                                                {Math.abs(stats?.ordersGrowth || 0)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Order Value */}
                <Card className="bazario-gradient border-0 shadow-lg text-white">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-white/90 font-medium truncate">Avg Order Value</p>
                                <p className="text-lg md:text-2xl font-bold text-white mt-1">
                                    ${stats?.averageOrderValue?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-[10px] md:text-xs text-white/80 mt-1">Per order</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Products */}
                <Card className="bazario-gradient border-0 shadow-lg text-white">
                    <CardContent className="p-3 md:p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-white/90 font-medium truncate">Active Products</p>
                                <p className="text-lg md:text-2xl font-bold text-white mt-1">
                                    {stats?.popularProducts?.length || 0}
                                </p>
                                <p className="text-[10px] md:text-xs text-white/80 mt-1">In catalog</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                <PieChart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Products */}
            <Card className="border border-border shadow-sm rounded-xl">
                <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg font-semibold text-foreground">Popular Products</CardTitle>
                    <p className="text-xs md:text-sm text-muted-foreground">Top performing items in your store</p>
                </CardHeader>
                <CardContent className="pt-0 p-3 md:p-6">
                    {stats?.popularProducts && stats.popularProducts.length > 0 ? (
                        <div className="space-y-3">
                            {stats.popularProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-primary">#{index + 1}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground text-sm md:text-base truncate">{product.name}</p>
                                            <p className="text-xs md:text-sm text-muted-foreground">{product.sales} orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-foreground text-sm md:text-base">${product.revenue.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No Sales Data Yet</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Start receiving orders to see your popular products here
                            </p>
                            <Badge variant="outline" className="text-primary border-primary/20">
                                Add products to get started
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Performance Summary */}
                <Card className="border border-border shadow-sm rounded-xl">
                    <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Performance Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 md:p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">Peak Hours</span>
                                <Badge variant="outline" className="text-xs md:text-sm">12PM - 2PM</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">Busiest Day</span>
                                <Badge variant="outline" className="text-xs md:text-sm">Saturday</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">Avg Prep Time</span>
                                <Badge variant="outline" className="text-xs md:text-sm">25 mins</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Metrics */}
                <Card className="border border-gray-200 shadow-sm rounded-xl">
                    <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Growth Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 md:p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">New Customers</span>
                                <Badge variant="outline" className="text-green-600 border-green-200 text-xs md:text-sm">
                                    +12% this week
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">Repeat Orders</span>
                                <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs md:text-sm">
                                    68% rate
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm md:text-base text-muted-foreground">Customer Rating</span>
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs md:text-sm">
                                    4.8/5.0
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default Analytics;
