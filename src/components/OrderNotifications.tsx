import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, Phone, Navigation, Package, Search, History, User, MapPin, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Order, type OrderItem } from "@/services/api";

type OrderStatus = 'new' | 'preparing' | 'ready' | 'rider_assigned' | 'completed' | 'cancelled';

const OrderNotifications = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call
    const mockOrders: any[] = [
      {
        id: "ORD-001",
        customer_name: "Rahul Kumar",
        order_items: [
          { products: { name: "Chicken Biryani" }, quantity: 2, price: 240 },
          { products: { name: "Coke" }, quantity: 2, price: 40 }
        ],
        total_amount: 560,
        status: "new",
        created_at: new Date().toISOString(),
        payment_method: "UPI",
        delivery_address: "123, Gandhi Road, Bazario City",
        order_type: "delivery"
      },
      {
        id: "ORD-002",
        customer_name: "Anita Singh",
        order_items: [
          { products: { name: "Masala Dosa" }, quantity: 1, price: 80 },
          { products: { name: "Filter Coffee" }, quantity: 1, price: 30 }
        ],
        total_amount: 110,
        status: "preparing",
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        payment_method: "Cash",
        delivery_address: "45, North Street, Bazario City",
        order_type: "delivery"
      },
      {
        id: "ORD-003",
        customer_name: "Mohamed R.",
        order_items: [
          { products: { name: "Parotta" }, quantity: 5, price: 15 },
          { products: { name: "Chicken Salna" }, quantity: 1, price: 120 }
        ],
        total_amount: 195,
        status: "ready",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        payment_method: "UPI",
        delivery_address: "Store Pickup",
        order_type: "pickup"
      },
      {
        id: "ORD-004",
        customer_name: "Priya S.",
        order_items: [
          { products: { name: "Veg Noodles" }, quantity: 1, price: 150 }
        ],
        total_amount: 150,
        status: "completed",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        payment_method: "Card",
        delivery_address: "78, Main Road, Bazario City",
        order_type: "delivery"
      },
      {
        id: "ORD-005",
        customer_name: "David J.",
        order_items: [
          { products: { name: "Chicken Burger" }, quantity: 1, price: 180 }
        ],
        total_amount: 180,
        status: "cancelled",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        payment_method: "Cash",
        delivery_address: "99, Beach Road, Bazario City",
        order_type: "delivery"
      }
    ];
    setOrders(mockOrders as Order[]);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    // Show toast notification
    const statusMessages = {
      new: "Order received!",
      preparing: "Order accepted! Moved to preparation.",
      ready: "Order marked as ready/packed.",
      rider_assigned: "Rider assigned (Simulation).",
      completed: "Order completed.",
      cancelled: "Order cancelled."
    };

    toast({
      title: "Status Updated",
      description: statusMessages[newStatus] || "Order status updated",
      variant: newStatus === 'cancelled' ? "destructive" : "default",
    });
  };

  const filterOrders = (ordersToFilter: Order[]) => {
    return ordersToFilter.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const activeOrders = filterOrders(orders.filter(o => ['new', 'preparing', 'ready', 'rider_assigned'].includes(o.status)));
  const historyOrders = filterOrders(orders.filter(o => ['completed', 'cancelled'].includes(o.status)));

  const newOrders = activeOrders.filter(o => o.status === 'new');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');
  const riderAssignedOrders = activeOrders.filter(o => o.status === 'rider_assigned');

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="overflow-hidden border border-border shadow-sm rounded-xl mb-3 last:mb-0">
      <CardHeader className="bg-muted/50 p-3 md:p-4 pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-foreground text-sm md:text-base">{order.id}</span>
              <Badge
                variant={
                  order.status === 'new' ? 'destructive' :
                    order.status === 'preparing' ? 'default' :
                      order.status === 'ready' ? 'secondary' : 'outline'
                }
                className={`text-[10px] md:text-xs px-2 py-0.5 uppercase tracking-wide ${order.status === 'new' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' :
                  order.status === 'preparing' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' :
                    order.status === 'ready' ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                  }`}
              >
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />
              {order.customer_name}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="block font-bold text-foreground text-base md:text-lg">₹{order.total_amount}</span>
            {/* payment_method is not in strict Order type but we're mocking, avoid ts error with any or checking */}
            <span className="text-[10px] md:text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {(order as any).payment_method || 'Cash'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-3">
        <div className="space-y-3">
          {/* Items List */}
          <div className="bg-muted/30 rounded-lg p-2.5 space-y-2">
            {Array.isArray(order.order_items) && order.order_items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs md:text-sm">
                <span className="text-foreground/80">
                  <span className="font-semibold text-foreground">{item.quantity}x</span> {item.products?.name}
                </span>
                <span className="text-muted-foreground font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Address if available */}
          {(order as any).delivery_address && (
            <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{(order as any).delivery_address}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            {order.status === 'new' && (
              <>
                <Button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10 md:h-11 shadow-sm"
                >
                  Accept Order
                </Button>
                <Button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  variant="outline"
                  className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10 h-10 md:h-11"
                >
                  Decline
                </Button>
              </>
            )}

            {order.status === 'preparing' && (
              <Button
                onClick={() => updateOrderStatus(order.id, 'ready')}
                className="w-full btn-gradient-primary text-white h-10 md:h-11 shadow-sm hover:opacity-90"
              >
                Mark as Ready / Packed
              </Button>
            )}

            {order.status === 'ready' && (
              <Button
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-10 md:h-11 shadow-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Handed Over / Completed
              </Button>
            )}

            {order.status === 'rider_assigned' && (
              <Button
                onClick={() => updateOrderStatus(order.id, 'ready')}
                className="w-full btn-gradient-primary text-white h-10 md:h-11 shadow-sm hover:opacity-90"
              >
                Rider Assigned - Mark Ready
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Order Management</h2>
        <p className="text-sm text-muted-foreground">Track and manage your incoming orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order ID or customer..."
            className="pl-10 bg-background border-input focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as OrderStatus | "all")}>
          <SelectTrigger className="w-full md:w-[180px] bg-background">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order Tabs */}
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted shadow-sm border border-border p-1 rounded-xl h-12">
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            Active Orders
            {activeOrders.length > 0 && (
              <Badge className="ml-2 bg-primary text-white border-none">
                {activeOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground">
            History
          </TabsTrigger>
        </TabsList>

        {/* Active Orders Tab */}
        <TabsContent value="active" className="space-y-6">
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Active Orders</h3>
              <p className="text-muted-foreground">New orders will appear here instantly</p>
            </div>
          ) : (
            <>
              {/* New Orders Section */}
              {newOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider pl-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                    New Orders ({newOrders.length})
                  </h3>
                  {newOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              )}

              {/* Preparing Orders Section */}
              {preparingOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider pl-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Preparing ({preparingOrders.length})
                  </h3>
                  {preparingOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              )}

              {/* Rider Assigned (treated as preparing/ready flow) */}
              {riderAssignedOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider pl-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Rider Assigned ({riderAssignedOrders.length})
                  </h3>
                  {riderAssignedOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              )}

              {/* Ready Orders Section */}
              {readyOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider pl-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    Ready for Pickup ({readyOrders.length})
                  </h3>
                  {readyOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="history" className="space-y-4">
          {historyOrders.length > 0 ? (
            historyOrders.map((order) => (
              <Card key={order.id} className="border border-border shadow-sm rounded-xl overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                <CardHeader className="bg-muted/50 p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground/80">{order.id}</span>
                        <Badge variant={order.status === 'completed' ? 'default' : 'destructive'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-bold text-foreground">₹{order.total_amount}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm text-foreground/70 mb-1">
                    {Array.isArray(order.order_items) && order.order_items.map(i => `${i.quantity}x ${i.products?.name}`).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">Customer: {order.customer_name}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-background rounded-xl border border-dashed border-border">
              <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No Order History</h3>
              <p className="text-muted-foreground">Completed orders will be listed here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderNotifications;
