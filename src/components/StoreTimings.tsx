
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Calendar, Settings, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storeAPI } from "@/services/api";

interface DayTiming {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isToday?: boolean;
}

const StoreTimings = () => {
  const [timings, setTimings] = useState<DayTiming[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [holidayDate, setHolidayDate] = useState("");
  const [holidayReason, setHolidayReason] = useState("");
  const [bulkOpenTime, setBulkOpenTime] = useState("09:00");
  const [bulkCloseTime, setBulkCloseTime] = useState("22:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(false);
  const [autoClose, setAutoClose] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  // Calculate store status based on current time and today's timing
  const getCurrentStoreStatus = () => {
    const todayTiming = timings.find(t => t.isToday);
    if (!todayTiming || !todayTiming.isOpen) return false;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    return currentTime >= todayTiming.openTime && currentTime <= todayTiming.closeTime;
  };

  const storeStatus = getCurrentStoreStatus();
  const { toast } = useToast();

  // Load timings on component mount
  useEffect(() => {
    loadTimings();
  }, []);

  const loadTimings = async () => {
    try {
      setIsLoading(true);
      const response = await storeAPI.getTimings();

      if (response.success && response.data) {
        // Transform API data or create default if none exists
        if (response.data.length === 0) {
          // Create default timings
          const defaultTimings = [
            { id: "mon", day: "Monday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
            { id: "tue", day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
            { id: "wed", day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
            { id: "thu", day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
            { id: "fri", day: "Friday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
            { id: "sat", day: "Saturday", isOpen: true, openTime: "10:00", closeTime: "23:00" },
            { id: "sun", day: "Sunday", isOpen: false, openTime: "10:00", closeTime: "21:00" }
          ];

          // Mark today
          const today = new Date().getDay();
          const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const todayId = dayMap[today];

          const timingsWithToday = defaultTimings.map(timing => ({
            ...timing,
            isToday: timing.id === todayId
          }));

          setTimings(timingsWithToday);
        } else {
          setTimings(response.data);
        }
      } else {
        toast({
          title: "Error Loading Timings",
          description: response.error?.message || "Failed to load store timings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Loading Timings",
        description: "Something went wrong while loading timings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (dayId: string) => {
    setTimings(timings.map(timing =>
      timing.id === dayId
        ? { ...timing, isOpen: !timing.isOpen }
        : timing
    ));

    const day = timings.find(t => t.id === dayId);
    toast({
      title: day?.isOpen ? "Day Closed" : "Day Opened",
      description: `${day?.day} is now ${day?.isOpen ? "closed" : "open"}`,
    });
  };



  const handleSetHoliday = () => {
    if (!holidayDate) {
      toast({
        title: "Error",
        description: "Please select a date for the holiday",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Holiday Set",
      description: `Store will be closed on ${holidayDate}${holidayReason ? ` - ${holidayReason}` : ''}`,
    });

    setHolidayDate("");
    setHolidayReason("");
  };



  const saveSettings = async () => {
    try {
      const response = await storeAPI.updateTimings(timings);

      if (response.success) {
        toast({
          title: "Store Timings Saved",
          description: "Your store hours have been updated successfully",
        });
      } else {
        toast({
          title: "Error Saving Timings",
          description: response.error?.message || "Failed to save store timings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Saving Timings",
        description: "Something went wrong while saving store timings",
        variant: "destructive",
      });
    }
  };



  const updateTiming = (dayId: string, field: 'openTime' | 'closeTime', value: string) => {
    setTimings(timings.map(timing =>
      timing.id === dayId
        ? { ...timing, [field]: value }
        : timing
    ));
  };

  const handleDaySelection = (dayId: string, checked: boolean) => {
    if (checked) {
      setSelectedDays([...selectedDays, dayId]);
    } else {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    }
  };

  const handleBulkEdit = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No Days Selected",
        description: "Please select at least one day to update",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBulkEditing(true);

      // Update selected days with bulk times
      const updatedTimings = timings.map(timing => {
        if (selectedDays.includes(timing.id)) {
          return {
            ...timing,
            isOpen: true, // Enable the day when bulk editing
            openTime: bulkOpenTime,
            closeTime: bulkCloseTime
          };
        }
        return timing;
      });

      // Update local state
      setTimings(updatedTimings);

      // Save to database immediately
      const response = await storeAPI.updateTimings(updatedTimings);

      if (response.success) {
        toast({
          title: "Bulk Edit Applied",
          description: `Updated ${selectedDays.length} days with new timings (${bulkOpenTime} - ${bulkCloseTime})`,
        });

        // Clear selections after successful save
        setSelectedDays([]);
      } else {
        toast({
          title: "Error Applying Bulk Edit",
          description: response.error?.message || "Failed to save bulk changes",
          variant: "destructive",
        });

        // Revert local state on error
        await loadTimings();
      }
    } catch (error) {
      toast({
        title: "Error Applying Bulk Edit",
        description: "Something went wrong while saving bulk changes",
        variant: "destructive",
      });

      // Revert local state on error
      await loadTimings();
    } finally {
      setIsBulkEditing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading store timings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">Store Timings</h2>
          <p className="text-xs md:text-sm text-gray-600">Manage your store operating hours</p>
        </div>

        {/* Settings Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 h-9">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Store Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Email Notifications</Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoClose">Auto-close on holidays</Label>
                <Switch
                  id="autoClose"
                  checked={autoClose}
                  onCheckedChange={setAutoClose}
                />
              </div>
              <Button onClick={saveSettings} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store Status Card */}
      <Card className="border border-orange-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${storeStatus ? 'bg-green-100' : 'bg-red-100'}`}>
                <Clock className={`w-5 h-5 md:w-6 md:h-6 ${storeStatus ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base">Store Status</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Currently {storeStatus ? "Open" : "Closed"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              <Badge
                variant={storeStatus ? "default" : "secondary"}
                className={`${storeStatus ? "bg-green-500" : "bg-red-500"} text-white px-2 py-1 md:px-3 text-xs`}
              >
                {storeStatus ? "OPEN NOW" : "CLOSED NOW"}
              </Badge>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${storeStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Set Holiday Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 md:h-12 border-orange-200 hover:bg-orange-50 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Set Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Holiday</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="holidayDate">Holiday Date</Label>
                <Input
                  id="holidayDate"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="holidayReason">Reason (Optional)</Label>
                <Textarea
                  id="holidayReason"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  placeholder="e.g., National Holiday, Maintenance"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button onClick={handleSetHoliday} className="w-full">
                Set Holiday
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 md:h-12 border-orange-200 hover:bg-orange-50 text-sm">
              <Edit className="w-4 h-4 mr-2" />
              Bulk Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Edit Timings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Days to Update</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {timings.map((timing) => (
                    <div key={timing.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={timing.id}
                        checked={selectedDays.includes(timing.id)}
                        onCheckedChange={(checked) => handleDaySelection(timing.id, checked as boolean)}
                      />
                      <Label htmlFor={timing.id} className="text-sm">
                        {timing.day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bulkOpenTime">Open Time</Label>
                  <Input
                    id="bulkOpenTime"
                    type="time"
                    value={bulkOpenTime}
                    onChange={(e) => setBulkOpenTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bulkCloseTime">Close Time</Label>
                  <Input
                    id="bulkCloseTime"
                    type="time"
                    value={bulkCloseTime}
                    onChange={(e) => setBulkCloseTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleBulkEdit}
                disabled={isBulkEditing || selectedDays.length === 0}
                className="w-full"
              >
                {isBulkEditing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying Changes...
                  </div>
                ) : (
                  `Apply to Selected Days${selectedDays.length > 0 ? ` (${selectedDays.length})` : ''}`
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Schedule */}
      <Card className="shadow-sm rounded-xl border border-border">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base md:text-lg text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-4">
          {timings.map((timing) => (
            <div
              key={timing.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 w-full p-3 rounded-lg border transition-colors ${timing.isToday
                ? 'bg-primary/5 border-primary/20'
                : 'bg-muted/30 border-border'
                }`}
            >
              <div className="flex items-center space-x-2 flex-1">
                {timing.isToday && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                )}
                <span className={`font-medium text-sm md:text-base ${timing.isToday ? 'text-primary' : 'text-foreground'}`}>
                  {timing.day}
                </span>
                {timing.isToday && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/30">
                    Today
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                {timing.isOpen ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={timing.openTime}
                      onChange={(e) => updateTiming(timing.id, 'openTime', e.target.value)}
                      className="text-xs md:text-sm border rounded px-1 min-w-[65px] h-8 text-center focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <input
                      type="time"
                      value={timing.closeTime}
                      onChange={(e) => updateTiming(timing.id, 'closeTime', e.target.value)}
                      className="text-xs md:text-sm border rounded px-1 min-w-[65px] h-8 text-center focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-destructive px-4">Closed</span>
                )}

                <Switch
                  checked={timing.isOpen}
                  onCheckedChange={() => toggleDay(timing.id)}
                  className="data-[state=checked]:bg-success ml-1"
                />
              </div>
            </div>

          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 pt-2 px-1">
        <Button
          onClick={saveSettings}
          className="w-full btn-gradient-primary hover:opacity-90 text-white py-6 rounded-xl font-medium shadow-lg btn-animate"
          size="lg"
        >
          <Clock className="w-5 h-5 mr-2" />
          Save Store Timings
        </Button>
      </div>

      {/* Today's Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 shadow-sm rounded-xl mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary text-sm md:text-base">Today's Hours</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {timings.find(t => t.isToday)?.isOpen
                  ? `Open: ${timings.find(t => t.isToday)?.openTime} - ${timings.find(t => t.isToday)?.closeTime}`
                  : "Closed Today"
                }
              </p>
            </div>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${timings.find(t => t.isToday)?.isOpen ? 'bg-green-100' : 'bg-red-100'
              }`}>
              <Clock className={`w-4 h-4 md:w-5 md:h-5 ${timings.find(t => t.isToday)?.isOpen ? 'text-green-600' : 'text-red-600'
                }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default StoreTimings;
