import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { offersAPI, type Offer, type CreateOfferData } from "@/services/api";

const OFFER_TYPE_LABELS: Record<Offer['offer_type'], string> = {
    percentage: 'Percentage Off',
    flat: 'Flat Discount',
    free_delivery: 'Free Delivery',
    buy_one_get_one: 'Buy One Get One',
};

const formatOfferValue = (offer: Offer) => {
    switch (offer.offer_type) {
        case 'percentage':
            return `${offer.discount_value}% off`;
        case 'flat':
            return `₹${offer.discount_value} off`;
        case 'free_delivery':
            return 'Free Delivery';
        case 'buy_one_get_one':
            return 'BOGO';
        default:
            return '';
    }
};

const normalizeOffer = (raw: Offer & { usage_count?: { count: number }[] }): Offer => ({
    ...raw,
    used_count: raw.used_count ?? raw.usage_count?.[0]?.count ?? 0,
});

const emptyForm = (): CreateOfferData & { valid_until: string } => ({
    title: '',
    description: '',
    offer_type: 'percentage',
    discount_value: undefined,
    min_order_amount: undefined,
    max_discount_amount: undefined,
    valid_until: '',
    usage_limit: undefined,
    is_active: true,
});

const OffersManagement = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingOffer, setIsAddingOffer] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [formData, setFormData] = useState(emptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            setIsLoading(true);
            const response = await offersAPI.getOffers({ limit: '50' });

            if (response.success && response.data) {
                const rawOffers = response.data.offers ?? response.data;
                setOffers(Array.isArray(rawOffers) ? rawOffers.map(normalizeOffer) : []);
            } else {
                toast({
                    title: "Error Loading Offers",
                    description: response.error?.message || "Failed to load offers",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error Loading Offers",
                description: "Something went wrong while loading offers",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsAddingOffer(false);
        setEditingOffer(null);
        setFormData(emptyForm());
    };

    const startEdit = (offer: Offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description || '',
            offer_type: offer.offer_type,
            discount_value: offer.discount_value,
            min_order_amount: offer.min_order_amount,
            max_discount_amount: offer.max_discount_amount,
            valid_until: offer.valid_until ? offer.valid_until.split('T')[0] : '',
            usage_limit: offer.usage_limit,
            is_active: offer.is_active,
        });
        setIsAddingOffer(true);
    };

    const buildPayload = (): CreateOfferData => {
        const payload: CreateOfferData = {
            title: formData.title,
            description: formData.description || undefined,
            offer_type: formData.offer_type,
            min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : undefined,
            max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : undefined,
            usage_limit: formData.usage_limit ? Number(formData.usage_limit) : undefined,
            is_active: formData.is_active,
        };

        if (formData.offer_type === 'percentage' || formData.offer_type === 'flat') {
            payload.discount_value = Number(formData.discount_value);
        }

        if (formData.valid_until) {
            payload.valid_until = new Date(formData.valid_until).toISOString();
        }

        return payload;
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            toast({
                title: "Error",
                description: "Please enter an offer title",
                variant: "destructive",
            });
            return;
        }

        if ((formData.offer_type === 'percentage' || formData.offer_type === 'flat') && !formData.discount_value) {
            toast({
                title: "Error",
                description: "Discount value is required for this offer type",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = buildPayload();

            let response;
            if (editingOffer) {
                response = await offersAPI.updateOffer(editingOffer.id, payload);
            } else {
                response = await offersAPI.createOffer(payload);
            }

            if (response.success) {
                await loadOffers();
                resetForm();
                toast({
                    title: editingOffer ? "Offer Updated" : "Offer Created",
                    description: `${formData.title} has been ${editingOffer ? 'updated' : 'created'} successfully`,
                });
            } else {
                toast({
                    title: editingOffer ? "Error Updating Offer" : "Error Creating Offer",
                    description: response.error?.message || `Failed to ${editingOffer ? 'update' : 'create'} offer`,
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: editingOffer ? "Error Updating Offer" : "Error Creating Offer",
                description: `Something went wrong while ${editingOffer ? 'updating' : 'creating'} the offer`,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleOfferStatus = async (offerId: string) => {
        const offer = offers.find((o) => o.id === offerId);
        if (!offer) return;

        try {
            const response = await offersAPI.toggleOffer(offerId);

            if (response.success) {
                const updated = (response.data as { offer?: Offer })?.offer ?? response.data;
                setOffers(offers.map((o) =>
                    o.id === offerId ? { ...o, is_active: updated?.is_active ?? !o.is_active } : o
                ));
                toast({
                    title: !offer.is_active ? "Offer Activated" : "Offer Deactivated",
                    description: `${offer.title} is now ${!offer.is_active ? "active" : "inactive"}`,
                });
            } else {
                toast({
                    title: "Error Updating Offer",
                    description: response.error?.message || "Failed to toggle offer status",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error Updating Offer",
                description: "Something went wrong while updating the offer",
                variant: "destructive",
            });
        }
    };

    const deleteOffer = async (offerId: string) => {
        const offer = offers.find((o) => o.id === offerId);
        if (!offer) return;

        try {
            const response = await offersAPI.deleteOffer(offerId);

            if (response.success) {
                setOffers(offers.filter((o) => o.id !== offerId));
                toast({
                    title: "Offer Deleted",
                    description: `${offer.title} has been removed`,
                });
            } else {
                toast({
                    title: "Error Deleting Offer",
                    description: response.error?.message || "Failed to delete offer",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error Deleting Offer",
                description: "Something went wrong while deleting the offer",
                variant: "destructive",
            });
        }
    };

    const showDiscountFields = formData.offer_type === 'percentage' || formData.offer_type === 'flat';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-foreground">Offers Management</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Create and manage promotional offers for your store</p>
                </div>
                <Button
                    onClick={() => setIsAddingOffer(true)}
                    className="btn-gradient-primary text-white px-3 py-2 text-xs md:text-sm rounded-lg h-9 md:h-10 hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Offer
                </Button>
            </div>

            {isAddingOffer && (
                <Card className="border border-primary/20 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-3 p-4 border-b border-primary/10">
                        <CardTitle className="text-base md:text-lg text-primary">
                            {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="offerTitle" className="text-sm font-medium text-gray-700">Title *</Label>
                                <Input
                                    id="offerTitle"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Weekend Special 20% Off"
                                    className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                />
                            </div>
                            <div>
                                <Label htmlFor="offerType" className="text-sm font-medium text-gray-700">Offer Type *</Label>
                                <Select
                                    value={formData.offer_type}
                                    onValueChange={(value: Offer['offer_type']) =>
                                        setFormData({ ...formData, offer_type: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1 h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(OFFER_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {showDiscountFields && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700">
                                            {formData.offer_type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'} *
                                        </Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            min="0"
                                            max={formData.offer_type === 'percentage' ? 100 : undefined}
                                            value={formData.discount_value ?? ''}
                                            onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                            className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                        />
                                    </div>
                                    {formData.offer_type === 'percentage' && (
                                        <div>
                                            <Label htmlFor="maxDiscount" className="text-sm font-medium text-gray-700">Max Discount (₹)</Label>
                                            <Input
                                                id="maxDiscount"
                                                type="number"
                                                min="0"
                                                value={formData.max_discount_amount ?? ''}
                                                onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                                                className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <Label htmlFor="offerDescription" className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                    id="offerDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your offer"
                                    className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="minOrder" className="text-sm font-medium text-gray-700">Min Order (₹)</Label>
                                    <Input
                                        id="minOrder"
                                        type="number"
                                        min="0"
                                        value={formData.min_order_amount ?? ''}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                                        className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="usageLimit" className="text-sm font-medium text-gray-700">Usage Limit</Label>
                                    <Input
                                        id="usageLimit"
                                        type="number"
                                        min="1"
                                        value={formData.usage_limit ?? ''}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                                        placeholder="Unlimited"
                                        className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="validUntil" className="text-sm font-medium text-gray-700">Valid Until</Label>
                                <Input
                                    id="validUntil"
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="btn-gradient-primary flex-1 h-11 hover:opacity-90 transition-opacity text-white"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {editingOffer ? 'Updating...' : 'Creating...'}
                                    </div>
                                ) : (
                                    editingOffer ? "Update Offer" : "Create Offer"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="flex-1 h-11"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading your offers...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {offers.map((offer) => (
                            <Card key={offer.id} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative bazario-gradient p-4 text-white">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <Tag className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-base line-clamp-1">{offer.title}</h3>
                                                <p className="text-sm text-white/90">{formatOfferValue(offer)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-0.5 flex-shrink-0">
                                            <Switch
                                                checked={offer.is_active}
                                                onCheckedChange={() => toggleOfferStatus(offer.id)}
                                                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/40"
                                            />
                                        </div>
                                    </div>
                                    <Badge
                                        variant={offer.is_active ? "default" : "secondary"}
                                        className={`mt-2 ${offer.is_active ? "bg-white/20 text-white border-white/30" : "bg-white/10 text-white/70"}`}
                                    >
                                        {offer.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <CardContent className={`p-3 md:p-4 ${!offer.is_active ? 'opacity-70 bg-muted/20' : ''}`}>
                                    <div className="space-y-2">
                                        {offer.description && (
                                            <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{offer.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-xs border-primary/20">
                                                {OFFER_TYPE_LABELS[offer.offer_type]}
                                            </Badge>
                                            {offer.min_order_amount ? (
                                                <Badge variant="outline" className="text-xs">Min ₹{offer.min_order_amount}</Badge>
                                            ) : null}
                                            {offer.valid_until && (
                                                <Badge variant="outline" className="text-xs">
                                                    Until {new Date(offer.valid_until).toLocaleDateString('en-IN')}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
                                            <span>Used: {offer.used_count}{offer.usage_limit ? ` / ${offer.usage_limit}` : ''}</span>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEdit(offer)}
                                                    className="p-0 h-8 w-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => deleteOffer(offer.id)}
                                                    className="p-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {offers.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No offers yet</h3>
                            <p className="text-muted-foreground mb-4 text-sm">Create your first offer to attract more customers</p>
                            <Button
                                onClick={() => setIsAddingOffer(true)}
                                className="btn-gradient-primary text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Offer
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OffersManagement;
