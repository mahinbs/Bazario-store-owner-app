import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, Upload, X, Loader2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storeAPI } from "@/services/api";

interface ProfileForm {
    storeName: string;
    description: string;
    address: string;
    phone: string;
    storeImages: string[];
}

const StoreProfile = () => {
    const [form, setForm] = useState<ProfileForm>({
        storeName: '',
        description: '',
        address: '',
        phone: '',
        storeImages: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const response = await storeAPI.getProfile();

            if (response.success && response.data) {
                const storeOwner = response.data.storeOwner ?? response.data;
                setForm({
                    storeName: storeOwner.store_name || storeOwner.storeName || '',
                    description: storeOwner.description || '',
                    address: storeOwner.address || '',
                    phone: storeOwner.phone || '',
                    storeImages: storeOwner.store_images || storeOwner.storeImages || [],
                });
            } else {
                toast({
                    title: "Error Loading Profile",
                    description: response.error?.message || "Failed to load store profile",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error Loading Profile",
                description: "Something went wrong while loading your profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = 5 - form.storeImages.length;
        if (remaining <= 0) {
            toast({
                title: "Image Limit Reached",
                description: "You can upload a maximum of 5 store images",
                variant: "destructive",
            });
            return;
        }

        const filesToUpload = files.slice(0, remaining);

        try {
            setIsUploading(true);
            const response = await storeAPI.uploadImages(filesToUpload);

            if (response.success && response.data?.images) {
                const newUrls = response.data.images.map((img: { imageUrl: string }) => img.imageUrl);
                setForm((prev) => ({
                    ...prev,
                    storeImages: [...prev.storeImages, ...newUrls],
                }));
                toast({
                    title: "Images Uploaded",
                    description: `${newUrls.length} image(s) uploaded successfully`,
                });
            } else {
                toast({
                    title: "Upload Failed",
                    description: response.error?.message || "Failed to upload images",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Upload Failed",
                description: "Something went wrong while uploading images",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const removeImage = async (imageUrl: string) => {
        try {
            const response = await storeAPI.deleteImage(imageUrl);

            if (response.success) {
                setForm((prev) => ({
                    ...prev,
                    storeImages: prev.storeImages.filter((url) => url !== imageUrl),
                }));
                toast({ title: "Image Removed", description: "Store image deleted successfully" });
            } else {
                setForm((prev) => ({
                    ...prev,
                    storeImages: prev.storeImages.filter((url) => url !== imageUrl),
                }));
            }
        } catch {
            setForm((prev) => ({
                ...prev,
                storeImages: prev.storeImages.filter((url) => url !== imageUrl),
            }));
        }
    };

    const handleSave = async () => {
        if (!form.storeName || !form.address || !form.phone) {
            toast({
                title: "Validation Error",
                description: "Store name, address, and phone are required",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSaving(true);
            const response = await storeAPI.updateProfile({
                storeName: form.storeName,
                description: form.description,
                address: form.address,
                phone: form.phone,
                storeImages: form.storeImages,
            });

            if (response.success) {
                toast({
                    title: "Profile Updated",
                    description: "Your store profile has been saved successfully",
                });
            } else {
                toast({
                    title: "Update Failed",
                    description: response.error?.message || "Failed to update profile",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Update Failed",
                description: "Something went wrong while saving your profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bazario-gradient rounded-xl flex items-center justify-center shadow-md">
                    <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-foreground">Store Profile</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Manage your store information and images</p>
                </div>
            </div>

            <Card className="border border-primary/20 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bazario-gradient text-white p-4">
                    <CardTitle className="text-base md:text-lg">Store Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <Label htmlFor="storeName" className="text-sm font-medium">Store Name *</Label>
                        <Input
                            id="storeName"
                            value={form.storeName}
                            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                            placeholder="Your store name"
                            className="mt-1 h-10 rounded-lg"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Tell customers about your store"
                            className="mt-1 rounded-lg"
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
                    </div>
                    <div>
                        <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                        <Textarea
                            id="address"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Full store address"
                            className="mt-1 rounded-lg"
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="10-digit mobile number"
                            className="mt-1 h-10 rounded-lg"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-primary/5 p-4 border-b border-primary/10">
                    <CardTitle className="text-base text-primary">Store Images</CardTitle>
                    <p className="text-xs text-muted-foreground">Upload up to 5 images (max 5MB each)</p>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    {form.storeImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {form.storeImages.map((url, index) => (
                                <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
                                    <img
                                        src={url}
                                        alt={`Store ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeImage(url)}
                                        className="absolute top-1 right-1 w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {form.storeImages.length < 5 && (
                        <label
                            htmlFor="storeImageUpload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-2 text-primary/60" />
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-primary">Click to upload</span> store images
                                    </p>
                                    <p className="text-xs text-muted-foreground">{form.storeImages.length}/5 images</p>
                                </>
                            )}
                            <input
                                id="storeImageUpload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                disabled={isUploading}
                                onChange={handleImageUpload}
                            />
                        </label>
                    )}

                    {form.storeImages.length === 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Image className="w-4 h-4" />
                            <span>No images uploaded yet</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-gradient-primary w-full sm:w-auto h-11 text-white hover:opacity-90"
            >
                {isSaving ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                    </span>
                ) : (
                    "Save Profile"
                )}
            </Button>
        </div>
    );
};

export default StoreProfile;
