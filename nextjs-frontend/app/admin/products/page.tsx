"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import type { Product, Pagination } from "@catalog/shared";
import { getProducts } from "@/lib/api";

import SearchBar from "@/components/products/SearchBar";
import { FiltersPopoverTrigger } from "@/components/layout/FiltersPopoverTrigger";

function ProductDashboardContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(searchParams.toString());

    getProducts(params)
      .then((res) => {
        if (isMounted) {
          setProducts(res.data);
          setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load products from database.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const totalProductsCount = pagination?.total ?? products.length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <>
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
            <p className="text-gray-500 text-xs font-medium mb-1">Categories</p>
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
            <p className="text-gray-500 text-xs font-medium mb-1">Low Stock</p>
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

      {/* Products Table with Database Results */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No products found in database.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function ProductsDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

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
              onClick={() => setIsDrawerOpen(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Upload Product
            </button>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            }
          >
            <ProductDashboardContent />
          </Suspense>
        </div>
      </main>

      {/* ADD NEW PRODUCT DRAWER */}
      <aside
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out z-50 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
            <button
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
                placeholder="e.g. Cloud Runner Low"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10">
                <option>Select category</option>
                <option>Footwear</option>
                <option>Audio</option>
                <option>Bags</option>
                <option>Wearables</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="$0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Stock Qty
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Short product description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Drag & drop or click to upload
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white">
            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              ✓ Save Product
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
