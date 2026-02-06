import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Package,
    Clock,
    Bell,
    LineChart,
    CreditCard,
    Menu,
    LogOut,
    Store,
    User,
    Settings
} from "lucide-react";
import { authAPI, isAuthenticated, getUserData } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const MainLayout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<{ name: string, store: string }>({ name: '', store: '' });

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/");
            return;
        }
        const userData = getUserData();
        setCurrentUser({
            name: userData?.storeOwner?.ownerName || userData?.user?.email || 'User',
            store: userData?.storeOwner?.storeName || 'My Store'
        });
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            navigate("/");
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/products", label: "Products", icon: Package },
        { path: "/orders", label: "Orders", icon: Bell },
        { path: "/timings", label: "Timings", icon: Clock },
        { path: "/analytics", label: "Analytics", icon: LineChart },
        { path: "/commission", label: "Commission", icon: CreditCard },
        // { path: "/profile", label: "Profile", icon: User }, // Reserved for future
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bazario-gradient rounded-xl flex items-center justify-center shadow-md">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">Store Hub</h1>
                        <p className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">{currentUser.store}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent ${isActive
                                ? "bazario-gradient text-white font-medium shadow-md"
                                : "text-sidebar-foreground/70 hover:bg-white hover:border-primary/20 hover:shadow-sm hover:text-sidebar-foreground"
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 ${isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-primary"
                                    }`}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start bazario-gradient text-white hover:opacity-90 hover:text-white rounded-xl shadow-md transition-all duration-200"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3 text-white" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 fixed h-full z-30">
                <SidebarContent />
            </div>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300 ease-in-out">
                <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border md:hidden">
                    <div className="flex items-center justify-between px-4 h-16">
                        <div className="flex items-center space-x-3">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                                        <Menu className="w-6 h-6 text-foreground" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                            <span className="font-semibold text-foreground">{currentUser.store}</span>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 animate-fade-in overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
