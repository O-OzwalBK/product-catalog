"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Store,
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  X,
  UploadCloud,
  AlertTriangle,
  Tag,
  Box,
  Star,
  Loader2,
  Pencil,
  Trash2,
  Check,
  ImageIcon,
} from "lucide-react";
import type { Product, Pagination, CreateProductInput } from "@catalog/shared";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";

import SearchBar from "@/components/products/SearchBar";
import { FiltersPopoverTrigger } from "@/components/layout/FiltersPopoverTrigger";

const INITIAL_FORM_STATE: CreateProductInput = {
  name: "",
  category: "Footwear",
  price: 0,
  stock: 0,
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  rating: 5.0,
};

function ProductDashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form & Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] =
    useState<CreateProductInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await getProducts(params);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load products from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // Open Drawer for Creating
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setIsDrawerOpen(true);
  };

  // Open Drawer for Editing
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: Number(product.price),
      stock: product.stock,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      imageUrl: product.imageUrl,
      rating: Number(product.rating),
    });
    setIsDrawerOpen(true);
  };

  // Delete Product
  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(productId);
    try {
      const token = (session as any)?.backendToken || "";
      await deleteProduct(token, productId);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler for Create / Edit
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = (session as any)?.backendToken || "";

    if (!formData.name || !formData.imageUrl) {
      alert("Please fill in all required fields and upload an image.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Ensure numeric fields are correctly typed
      const payload = {
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price),
      };

      if (editingProduct) {
        // 2. Strip system fields that shouldn't be patched
        const { id, createdAt, slug, ...updatePayload } = payload as any;
        await updateProduct(token, editingProduct.productId, updatePayload);
      } else {
        const generatedSlug = formData.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        await createProduct(token, { ...payload, slug: generatedSlug });
      }

      setIsDrawerOpen(false);
      setFormData(INITIAL_FORM_STATE);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalProductsCount = pagination?.total ?? products.length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans text-sm">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1a1a1a] text-zinc-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-white font-semibold text-lg">
          <Store className="w-6 h-6" />
          <span>ShopCo Admin</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#2a2a2a] text-white"
          >
            <LayoutGrid className="w-4 h-4" /> Overview
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <Package className="w-4 h-4" /> Products
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> Orders
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" /> Customers
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> Analytics
          </a>
        </nav>

        <div className="p-4">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors text-left">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto relative">
        <div
          className={`p-8 transition-all duration-300 ${isDrawerOpen ? "mr-96" : ""}`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 mt-1">Manage your store inventory</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Upload Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProductsCount}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Box className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">
                  Categories
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {categoriesCount}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Tag className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">
                  Low Stock
                </p>
                <p
                  className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-500" : "text-gray-900"}`}
                >
                  {lowStockCount}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Search & Action Bar */}
          <div className="flex items-center gap-4 mb-6">
            <SearchBar className="flex-1" />
            <div className="flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg">
              <FiltersPopoverTrigger />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Fetching store inventory...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-4 w-16">IMAGE</th>
                    <th className="p-4">NAME</th>
                    <th className="p-4">CATEGORY</th>
                    <th className="p-4">PRICE</th>
                    <th className="p-4">STOCK</th>
                    <th className="p-4">RATING</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-500"
                      >
                        No products found in database.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.productId}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          ${product.price}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-medium ${product.stock < 10 ? "text-red-500" : "text-gray-900"}`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 font-medium text-gray-900">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {product.rating}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.productId)}
                              disabled={deletingId === product.productId}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete product"
                            >
                              {deletingId === product.productId ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ADD / EDIT PRODUCT DRAWER */}
      <aside
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out z-50 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Cloud Runner Low"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="Footwear">Footwear</option>
                <option value="Audio">Audio</option>
                <option value="Bags">Bags</option>
                <option value="Wearables">Wearables</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Stock Qty
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Short Description
              </label>
              <textarea
                required
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Short product description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 relative overflow-hidden"
              >
                {formData.imageUrl ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-32 object-contain rounded-lg border border-gray-200"
                    />
                    <span className="text-xs text-gray-500 mt-2 underline">
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Drag & drop or click to upload
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default function ProductsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <ProductDashboardContent />
    </Suspense>
  );
}
