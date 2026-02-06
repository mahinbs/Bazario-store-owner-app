import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productsAPI, type Product } from "@/services/api";

// Remove local interface since we're importing from API

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProducts();

      if (response.success && response.data) {
        console.log("Products loaded:", response.data);
        setProducts(response.data);
      } else {
        toast({
          title: "Error Loading Products",
          description: response.error?.message || "Failed to load products",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Loading Products",
        description: "Something went wrong while loading products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category || 'General');

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      let response;
      if (editingProduct) {
        // Update existing product
        response = await productsAPI.updateProduct(editingProduct.id, formData);
      } else {
        // Create new product
        response = await productsAPI.createProduct(formData);
      }

      if (response.success && response.data) {
        // Refresh products list
        await loadProducts();

        // Reset form
        resetForm();

        toast({
          title: editingProduct ? "Product Updated" : "Product Added",
          description: `${newProduct.name} has been ${editingProduct ? 'updated' : 'added'} successfully`,
        });
      } else {
        toast({
          title: editingProduct ? "Error Updating Product" : "Error Adding Product",
          description: response.error?.message || `Failed to ${editingProduct ? 'update' : 'add'} product`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: editingProduct ? "Error Updating Product" : "Error Adding Product",
        description: `Something went wrong while ${editingProduct ? 'updating' : 'adding'} the product`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setNewProduct({ name: "", description: "", price: "", category: "", image: "" });
    setSelectedImage(null);
    setImagePreview("");
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      image: product.image_url || ""
    });
    setImagePreview(product.image_url || "");
    setIsAddingProduct(true);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      // Create FormData with ALL current values + updated status
      // valid fix for mock API that overwrites fields with null if missing
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description || "");
      formData.append('price', product.price.toString());
      formData.append('category', product.category);
      if (product.image_url) {
        // If we had the file we'd append it, but for mock we rely on the API to preserve image if not provided? 
        // PROBABLY API overwrites image too?
        // Let's look at api.ts: `image_url` is NOT updated in the loop I saw, unless I missed it.
        // Wait, line 345 in api.ts is create. 
        // Update logic:
        // const updatedProduct = { ...products[index], name: ..., ... is_active: ... };
        // It DOES NOT touch image_url in the update logic I read earlier!
        // It was: name, description, price, category, is_active.
        // So image_url matches spread ...products[index].
        // So we don't need to append image.
      }
      formData.append('is_active', (!product.is_active).toString());

      const response = await productsAPI.updateProduct(productId, formData);

      if (response.success) {
        // Update local state
        setProducts(products.map(p =>
          p.id === productId
            ? { ...p, is_active: !p.is_active }
            : p
        ));

        toast({
          title: !product.is_active ? "Product Enabled" : "Product Disabled",
          description: `${product.name} is now ${!product.is_active ? "online" : "offline"}`,
        });
      } else {
        toast({
          title: "Error Updating Product",
          description: response.error?.message || "Failed to update product status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Updating Product",
        description: "Something went wrong while updating the product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const response = await productsAPI.deleteProduct(productId);

      if (response.success) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));

        toast({
          title: "Product Deleted",
          description: `${product.name} has been removed from your store`,
        });
      } else {
        toast({
          title: "Error Deleting Product",
          description: response.error?.message || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Deleting Product",
        description: "Something went wrong while deleting the product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">Product Management</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Manage your store products and availability</p>
        </div>
        <Button
          onClick={() => setIsAddingProduct(true)}
          className="btn-gradient-primary text-white px-3 py-2 text-xs md:text-sm rounded-lg h-9 md:h-10 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <Card className="border border-primary/20 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3 p-4 border-b border-primary/10">
            <CardTitle className="text-base md:text-lg text-primary">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700">Product Name *</Label>
                <Input
                  id="productName"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                />
              </div>
              <div>
                <Label htmlFor="productPrice" className="text-sm font-medium text-gray-700">Price (₹) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.1"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.0"
                  className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                />
              </div>
              <div>
                <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="productDescription"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="productCategory" className="text-sm font-medium text-gray-700">Category</Label>
                <Input
                  id="productCategory"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="e.g., Main Course, Appetizers"
                  className="mt-1 border-gray-300 focus:border-orange-500 rounded-lg h-10"
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <Label htmlFor="productPhoto" className="text-sm font-medium text-gray-700">Photo of the Dish</Label>
                <div className="mt-1 space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="productPhoto"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Image className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-medium">Click to upload</span> dish photo
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        </div>
                      )}
                      <input
                        id="productPhoto"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {selectedImage && (
                    <div className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg border border-green-200">
                      <span className="text-green-700 font-medium">✓ Selected:</span> {selectedImage.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddProduct}
                disabled={isSubmitting}
                className="btn-gradient-primary flex-1 h-11 hover:opacity-90 transition-opacity text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingProduct ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  editingProduct ? "Update Product" : "Add Product"
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

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your products...</p>
        </div>
      ) : (
        <>
          {/* Products Grid - Mobile First */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 sm:h-40 overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Image failed to load:", product.image_url);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                      className={`${product.is_active ? "bg-primary text-white" : "bg-muted text-muted-foreground"} shadow-sm backdrop-blur-sm px-2 py-1`}
                    >
                      {product.is_active ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {/* Toggle Switch */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => toggleProductStatus(product.id)}
                        className="data-[state=checked]:bg-primary scale-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <CardContent className={`p-3 md:p-4 ${!product.is_active ? 'opacity-70 bg-muted/20' : ''}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-foreground text-base line-clamp-1">{product.name}</h3>
                      <span className="text-lg font-bold text-primary flex-shrink-0">₹{product.price}</span>
                    </div>

                    <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 min-h-[2.5em]">{product.description}</p>

                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline" className="text-xs truncate max-w-[50%] border-primary/20 text-foreground/80">
                        {product.category}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(product)}
                          className="p-0 h-8 w-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProduct(product.id)}
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

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">Start by adding your first product to your store</p>
              <Button
                onClick={() => setIsAddingProduct(true)}
                className="btn-gradient-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagement;
