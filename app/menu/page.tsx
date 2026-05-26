"use client";

import { useEffect, useState } from 'react';
import { Food, Category } from '../types/index';
import { foodService } from '../services/food.service';
// Fixed the accidental empty space in the file import path below
import { categoryService } from '../services/category .service';

const BACKEND_URL = 'http://localhost:5000';

export default function AddisAbabaMenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [renderTrigger, setRenderTrigger] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const [foodsData, categoriesData] = await Promise.all([
          foodService.getPublicMenu(),
          categoryService.getAll()
        ]);
        
        setFoods(foodsData || []);
        setCategories(categoriesData || []);
        setActiveCategory('ALL');
      } catch (err) {
        console.error("API Error:", err);
        // Catching the backend 500 error safely so your screen doesn't turn red
        setErrorMessage("Could not load menu items. Please check if your backend server is running and database is connected.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRenderTrigger(false);
    const timeout = setTimeout(() => setRenderTrigger(true), 40);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeCategory]);

  const selectCategory = (id: string) => {
    setActiveCategory(id);
  };

  const filteredFoods = foods.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/50">Loading Menu</p>
        </div>
      </div>
    );
  }

  // Graceful fallback display if backend server returns a 500 status code
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-stone-900 border border-red-500/20 rounded-[2rem] space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-stone-100 uppercase font-serif tracking-tight">Backend Connection Error</h2>
          <p className="text-sm text-stone-400 leading-relaxed">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2.5 bg-emerald-600 text-stone-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-500 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 antialiased selection:bg-emerald-500/30">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:32px_32px] pointer-events-none"></div>

      <header className="relative py-24 px-6 text-center max-w-4xl mx-auto z-10">
        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-400 bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10">Addis Ababa, Ethiopia</span>
        <h1 className="mt-8 text-6xl font-black uppercase tracking-tighter sm:text-8xl text-stone-50 font-serif">ADDIS ABABA</h1>
        <p className="mt-4 text-emerald-500 font-mono text-xs tracking-widest">BAR & RESTAURANT</p>
      </header>

      <div className="max-w-3xl mx-auto px-4 relative z-20 pb-32">
        <div className="bg-stone-900/60 backdrop-blur-2xl p-4 rounded-[2rem] border border-stone-800/50 sticky top-6 mb-20 z-40 shadow-2xl">
          <input type="text" placeholder="Search our flavors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-2xl border-0 bg-stone-950/50 px-6 py-4 text-stone-200 placeholder:text-stone-700 focus:ring-1 focus:ring-emerald-500/50 text-sm outline-none transition-all" />
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto mt-4 no-scrollbar">
              <button 
                onClick={() => selectCategory('ALL')} 
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === 'ALL' ? 'bg-emerald-600 text-stone-950' : 'text-stone-500 bg-stone-950/50 border border-stone-800/30'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => selectCategory(cat.name)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.name ? 'bg-emerald-600 text-stone-950' : 'text-stone-500 bg-stone-950/50 border border-stone-800/30'}`}>{cat.name}</button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-24">
          {categories.map((cat) => {
            if (!searchQuery && activeCategory !== 'ALL' && activeCategory !== cat.name) return null;
            
            const catFoods = filteredFoods.filter(f => f.categoryId === cat.id);
            if (catFoods.length === 0) return null;
            return (
              <div key={cat.id} id={cat.name.replace(/\s+/g, '-')} className="scroll-mt-48">
                <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500/40 mb-10 pb-4 border-b border-stone-900 flex justify-between">
                  <span>{cat.name}</span>
                  <span>{catFoods.length} items</span>
                </h2>
                
                <div className="grid gap-6">
                  {catFoods.map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className={`group flex items-center gap-6 p-6 rounded-3xl border bg-stone-900/10 cursor-pointer transition-all duration-700 ${renderTrigger ? 'translate-y-0 opacity-100 border-stone-900 hover:border-emerald-500/20 hover:bg-stone-900/40 shadow-xl' : 'translate-y-8 opacity-0 border-transparent'}`}>
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-950 flex-shrink-0 border border-stone-800/50 shadow-2xl">
                        {item.imageUrl ? <img src={`${BACKEND_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍲</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-4">
                          <h3 className="text-lg font-black text-stone-100 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.name}</h3>
                          <span className="text-lg font-black text-amber-500 font-serif">{item.price} <span className="text-[10px] opacity-50">ETB</span></span>
                        </div>
                        <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-[3rem] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-64 bg-stone-950 relative border-b border-stone-800">
              {selectedItem.imageUrl ? <img src={`${BACKEND_URL}${selectedItem.imageUrl}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-6xl grayscale opacity-20">🍲</div>}
            </div>
            <div className="p-10">
              <h2 className="text-3xl font-black text-center text-stone-50 uppercase tracking-tighter">{selectedItem.name}</h2>
              <div className="mt-2 text-center text-emerald-400 font-black text-xl">{selectedItem.price} ETB</div>
              
              <div className="mt-10 space-y-8">
                <div>
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest border-b border-stone-800 pb-2 block w-full mb-4">Description</span>
                  <p className="text-sm text-stone-300 leading-relaxed font-medium">{selectedItem.description || "A culinary masterpiece prepared with traditional Addis techniques."}</p>
                </div>

                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest border-b border-stone-800 pb-2 block w-full mb-4">Ingredients</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-[10px] font-black bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setSelectedItem(null)} className="mt-12 w-full bg-stone-100 text-stone-950 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl">Back to Menu</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}