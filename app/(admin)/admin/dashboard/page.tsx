"use client";

import { useEffect, useState } from "react";
import { Food, Category } from "../../../types/index";
import { foodService } from "../../../services/food.service";
import { categoryService } from "../../../services/category .service";
import { authService } from "../../../services/auth.service";

// 🛠 Corrected to Port 5000 to match your current backend configuration
const BACKEND_URL = 'http://localhost:5000';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

  // --- MENU ITEM STATES ---
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Food | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteFoodId, setDeleteFoodId] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState({ 
    name: "", price: "", categoryId: "", description: "", ingredients: "" 
  });

  // --- CATEGORY STATES ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  // 🔒 Route Guard Protection for Session Expiration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [foodsData, categoriesData] = await Promise.all([
        foodService.getAllAdmin(),
        categoryService.getAll()
      ]);
      setFoods(foodsData);
      setCategories(categoriesData);
    } catch (err) {
      showNotification("Backend Connection Error. Check Port 5000.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "danger" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- MENU LOGIC ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setPreviewUrl(null);
    setSelectedFile(null);
    setMenuFormData({ 
      name: "", price: "", 
      categoryId: categories[0]?.id  ||"", 
      description: "", ingredients: "" 
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditModal = (food: Food) => {
    setEditingItem(food);
    setMenuFormData({ 
      name: food.name, 
      price: food.price.toString(), 
      categoryId: food.categoryId || food.category?.id || "",
      description: food.description  ||"",
      ingredients: food.ingredients ? food.ingredients.join(", ") : ""
    });
    setPreviewUrl(food.imageUrl ? `${BACKEND_URL}${food.imageUrl}` : null);
    setIsMenuModalOpen(true);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append("name", menuFormData.name);
    submitData.append("price", menuFormData.price);
    submitData.append("categoryId", menuFormData.categoryId);
    submitData.append("description", menuFormData.description);
    
    const ingredientsArray = menuFormData.ingredients.split(",").map(i => i.trim()).filter(i => i !== "");
    submitData.append("ingredients", JSON.stringify(ingredientsArray));

    if (selectedFile) submitData.append("image", selectedFile);
    try {
      if (editingItem) {
        const updated = await foodService.update(editingItem.id, submitData);
        setFoods(foods.map(f => f.id === editingItem.id ? updated : f));
        showNotification("Item Updated", "info");
      } else {
        const created = await foodService.create(submitData);
        setFoods([...foods, created]);
        showNotification("Item Created", "success");
      }
      setIsMenuModalOpen(false);
    } catch (err) {
      showNotification("Error: Backend rejected the data", "danger");
    }
  };

  const handleDeleteFood = async () => {
    if (!deleteFoodId) return;
    try {
      await foodService.delete(deleteFoodId);
      setFoods(foods.filter(f => f.id !== deleteFoodId));
      showNotification("Item Deleted", "success");
    } catch (err) {
      showNotification("Delete Failed", "danger");
    }
    setDeleteFoodId(null);
  };

  // --- CATEGORY LOGIC ---
  const handleCategoryCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsCategorySubmitting(true);
      const created = await categoryService.create(newCategoryName);
      setCategories([...categories, created]);
      setNewCategoryName("");
      showNotification("Category Created", "success");
    } catch (err) {
      showNotification("Error creating category", "danger");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm("Delete category? Warning: This will delete all items inside it.")) return;
    try {
      await categoryService.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      setFoods(foods.filter(f => f.categoryId !== id));
      showNotification("Category Removed", "success");
    } catch (err) {
      showNotification("Delete Failed", "danger");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a08] text-stone-100 font-sans grid grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* 🔔 Notifications */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl border shadow-2xl transition-all ${
          toast.type === "success" ? "bg-orange-600 border-orange-500 text-white" :
          toast.type === "danger" ? "bg-red-600 border-red-500 text-white" : "bg-stone-800 border-stone-700 text-stone-200"
        }`}>
          {toast.message}
        </div>
      )}

      {/* 👈 FIXED LEFT SIDEBAR */}
      <aside className="border-b md:border-b-0 md:border-r border-stone-900 bg-stone-900/20 backdrop-blur-md p-6 flex flex-col justify-between md:h-screen md:sticky md:top-0">
        <div>
          {/* Branding Headers */}
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight uppercase italic font-serif">
              Z-Tshay <span className="text-[#e67e22]">Kitchen</span>
            </h2>
            <p className="text-[10px] font-bold text-stone-500 tracking-widest mt-1 uppercase">
              Management Suite
            </p>
          </div>

          {/* Vertical Menu Buttons */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("menu")}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
                activeTab === "menu" 
                  ? 'bg-[#e67e22] text-white shadow-lg shadow-orange-950/40' 
                  : 'bg-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/40'
              }`}
            >
              <span className="text-sm">🍲</span> Menu Items
            </button>
            <button 
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
                activeTab === "categories" 
                  ? 'bg-[#e67e22] text-white shadow-lg shadow-orange-950/40' 
                  : 'bg-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/40'
              }`}
            >
              <span className="text-sm">🗂️</span> Categories
            </button>
          </nav>
        </div>

        {/* Optional decorative/status footer on sidebar */}
        <div className="hidden md:block pt-4 border-t border-stone-900">
          <p className="text-[10px] font-medium text-stone-600 uppercase tracking-wider">Session Active</p>
        </div>
      </aside>

      {/* 👉 RIGHT MAIN WORKSPACE */}
      <main className="p-6 md:p-10 max-w-5xl w-full mx-auto">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* --- MENU TAB --- */}
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Manage Menu</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Create, edit, or delete items from the store.</p>
                  </div>
                  <button onClick={handleOpenAddModal} className="bg-[#e67e22] hover:bg-[#d35400] px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-950/40 text-xs uppercase tracking-widest text-white">
                    + Add Food Item
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/30 backdrop-blur-md">
                  <table className="w-full text-left">
                    <thead className="bg-stone-900/80 text-[10px] text-stone-500 uppercase tracking-widest font-black">
                      <tr>
                        <th className="p-5">Preview</th>
                        <th className="p-5">Name</th>
                        <th className="p-5">Category</th>
                        <th className="p-5">Price</th>
                        <th className="p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900/50">
                      {foods.map((food) => (
                        <tr key={food.id} className="hover:bg-stone-900/20 transition-colors">
                          <td className="p-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#0d0a08] overflow-hidden border border-stone-800">
                              {food.imageUrl ? (
                                <img src={`${BACKEND_URL}${food.imageUrl}`} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center grayscale opacity-50">🍲</div>
                              )}
                            </div>
                          </td>
                          <td className="p-5 font-bold">{food.name}</td>
                          <td className="p-5 text-stone-500 text-sm">{food.category?.name || "None"}</td>
                          <td className="p-5 font-mono text-orange-400">{food.price} ETB</td>
                          <td className="p-5 text-right space-x-4">
                            <button onClick={() => handleOpenEditModal(food)} className="text-orange-400 hover:text-white text-sm font-bold transition-colors">Edit</button>
                            <button onClick={() => setDeleteFoodId(food.id)} className="text-stone-600 hover:text-red-500 text-sm font-bold transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- CATEGORY TAB --- */}
            {activeTab === "categories" && (
              <div className="max-w-2xl bg-stone-900/40 border border-stone-800 p-8 rounded-[2rem] shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Manage Categories</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Organize items into structured sections.</p>
                </div>
                <form onSubmit={handleCategoryCreate} className="flex gap-3 mb-10">
                  <input 
                    type="text" 
                    placeholder="Category Name..." 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-[#0d0a08] border border-stone-800 rounded-2xl px-5 py-3 focus:border-orange-500 outline-none transition-all text-stone-100"
                  />
                  <button 
                    type="submit" 
                    disabled={isCategorySubmitting}
                    className="bg-[#e67e22] px-6 py-3 rounded-2xl font-bold disabled:opacity-50 hover:bg-[#d35400] transition-all text-xs uppercase tracking-widest text-white"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center bg-stone-950/40 border border-stone-800 p-4 rounded-2xl hover:border-stone-700 transition-all">
                      <span className="font-bold">{cat.name}</span>
                      <button onClick={() => handleCategoryDelete(cat.id)} className="text-stone-600 hover:text-red-500 transition-colors text-sm font-bold">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- FOOD MODAL --- */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 p-8 rounded-[2rem] shadow-2xl">
            <h3 className="text-2xl font-black mb-6 italic uppercase font-serif">{editingItem ? "Update" : "Create"} Item</h3>
            <form onSubmit={handleMenuSubmit} className="space-y-5">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 rounded-[1.5rem] bg-stone-800 border-2 border-dashed border-stone-700 flex items-center justify-center overflow-hidden">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <span className="text-3xl">📷</span>}
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-stone-500 file:bg-stone-800 file:border-0 file:text-white file:px-4 file:py-2 file:rounded-full cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <input required placeholder="Dish Name" value={menuFormData.name} onChange={e => setMenuFormData({...menuFormData, name: e.target.value})} className="bg-stone-800 border-stone-700 border rounded-2xl px-5 py-3 outline-none focus:border-orange-500 text-stone-100" />
                <select value={menuFormData.categoryId} onChange={e => setMenuFormData({...menuFormData, categoryId: e.target.value})} className="bg-stone-800 border-stone-700 border rounded-2xl px-5 py-3 outline-none text-stone-100">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <input type="number" required placeholder="Price" value={menuFormData.price} onChange={e => setMenuFormData({...menuFormData, price: e.target.value})} className="bg-stone-800 border-stone-700 border rounded-2xl px-5 py-3 outline-none focus:border-orange-500 text-stone-100" />
                <input placeholder="Ingredients (comma separated)" value={menuFormData.ingredients} onChange={e => setMenuFormData({...menuFormData, ingredients: e.target.value})} className="bg-stone-800 border-stone-700 border rounded-2xl px-5 py-3 outline-none focus:border-orange-500 text-stone-100" />
              </div>

              <textarea placeholder="Description" value={menuFormData.description} onChange={e => setMenuFormData({...menuFormData, description: e.target.value})} className="w-full bg-stone-800 border-stone-700 border rounded-2xl px-5 py-3 h-28 outline-none focus:border-orange-500 text-stone-100" />

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsMenuModalOpen(false)} className="text-stone-500 font-bold px-4">Cancel</button>
                <button type="submit" className="bg-[#e67e22] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#d35400] transition-all shadow-lg shadow-orange-950/40">Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteFoodId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-stone-900 border border-stone-800 p-8 rounded-[2rem] text-center max-w-sm shadow-2xl">
            <p className="mb-6 font-bold">Are you sure you want to delete this dish?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteFoodId(null)} className="flex-1 text-stone-500 font-bold">Cancel</button>
              <button onClick={handleDeleteFood} className="flex-1 bg-red-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-red-900/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}