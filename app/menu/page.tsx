"use client";

import { useEffect, useState, useRef } from 'react';
import { Food, Category } from '../types/index';
import { foodService } from '../services/food.service';
import { categoryService } from '../services/category .service';
import image from "../../public/home.png";
import image2 from "../../public/contact.png";
// Explicitly handle Next.js StaticImageData typing for the source reference
const homeHeroSrc = typeof image === 'object' && 'src' in image ? image.src : String(image);
//this is the api url
const BACKEND_URL = 'http://localhost:5000';

export default function AddisAbabaMenuPage() {
  // BACKEND STATES
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [renderTrigger, setRenderTrigger] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SEARCH INPUT STATE
  const [searchInput, setSearchInput] = useState('');

  // CAROUSEL PAUSE STATE
  const [isPaused, setIsPaused] = useState(false);

  // SECTION ANCHOR REFERENCES FOR SCROLLING
  const homeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // TRACK ACTIVE SECTION FOR NAVIGATION HIGHLIGHTING
  const [activeSection, setActiveSection] = useState<'home' | 'menu' | 'contact'>('home');

  // CONTACT FORM STATE
  const [suggestion, setSuggestion] = useState('');

  // DATA FETCHING
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
        setErrorMessage("Could not load menu items. Please check if your backend server is running and database is connected.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // SEARCH RENDER TRIGGER
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRenderTrigger(false);
    const timeout = setTimeout(() => setRenderTrigger(true), 40);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeCategory]);

  // INTERSECTION OBSERVER FOR ACTIVE LINK STATE HIGHLIGHTING
  useEffect(() => {
    const sections = [
      { id: 'home', ref: homeRef },
      { id: 'menu', ref: menuRef },
      { id: 'contact', ref: contactRef }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px', 
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as 'home' | 'menu' | 'contact');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    if (searchInput.trim() === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery('');
    }
  }, [searchInput]);

  // SMOOTH ANCHOR SCROLLING HANDLER
  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // SUBMIT SEARCH HANDLER
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    scrollToSection(menuRef);
  };

  const selectCategory = (id: string) => {
    setActiveCategory(id);
  };

  const filteredFoods = foods.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1612] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-500/50">Loading Experience</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#1e1612] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-[#2d221b] border border-red-500/20 rounded-[2rem] space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-stone-100 uppercase font-serif tracking-tight">Backend Connection Error</h2>
          <p className="text-sm text-stone-400 leading-relaxed">{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2.5 bg-orange-600 text-[#1e1612] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-500 transition-all">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1e1612] text-stone-100 antialiased selection:bg-orange-500/30 font-sans pb-16 scroll-smooth">
      
      {/* SEAMLESS MARQUEE ANIMATION KEYFRAMES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .marquee-paused {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* DYNAMIC NAVIGATION RESTAURANT HEADER */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center sticky top-0 bg-[#1e1612]/90 backdrop-blur-md z-50 border-b border-white/5">
        <div onClick={() => scrollToSection(homeRef)} className="font-bold text-white flex items-center gap-2 text-sm cursor-pointer tracking-wider font-serif">
          <span className="text-orange-500 text-xl">☀️</span> Z-Tshay Cafe and Restaurant
        </div>
        <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest">
          <button 
            onClick={() => scrollToSection(homeRef)} 
            className={`transition duration-200 relative py-1 ${activeSection === 'home' ? 'text-[#e67e22]' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Home
            {activeSection === 'home' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e67e22] rounded-full animate-fade-in" />}
          </button>
          <button 
            onClick={() => scrollToSection(menuRef)} 
            className={`transition duration-200 relative py-1 ${activeSection === 'menu' ? 'text-[#e67e22]' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Menu
            {activeSection === 'menu' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e67e22] rounded-full animate-fade-in" />}
          </button>
          <button 
            onClick={() => scrollToSection(contactRef)} 
            className={`transition duration-200 relative py-1 ${activeSection === 'contact' ? 'text-[#e67e22]' : 'text-stone-400 hover:text-stone-200'}`}
          >
            Contact
            {activeSection === 'contact' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e67e22] rounded-full animate-fade-in" />}
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO & CAROUSEL */}
      <div id="home" ref={homeRef} className="relative w-full min-h-[90vh] flex flex-col justify-between overflow-hidden scroll-mt-28">
        <div className="absolute inset-0 z-0">
          <img src={homeHeroSrc} alt="" className="w-full h-full object-cover brightness-[0.25]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1e1612]/40 to-[#1e1612]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mt-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-[#e67e22] uppercase font-serif drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            Z-Tshay Cafe and <br />
            <span className="text-white">Restaurant</span>
          </h1>
          <p className="mt-4 text-stone-300 max-w-xl text-sm sm:text-base font-light tracking-wide drop-shadow">
            Where Good Food Meets Great Moments
          </p>
          <button onClick={() => scrollToSection(menuRef)} className="mt-8 px-10 py-3.5 bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs rounded-full transition-all shadow-xl uppercase tracking-[0.2em]">
            Explore Menu
          </button>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative mt-10 shadow-2xl">
            <input 
              type="text" 
              placeholder="Search for items..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-full border border-white/5 bg-[#261d18]/90 backdrop-blur-md px-6 py-3.5 pr-14 text-stone-200 placeholder:text-stone-500 text-xs outline-none" 
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#e67e22] p-2 rounded-full text-white hover:bg-[#d35400] transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
        </div>

        {/* CAROUSEL WRAPPER */}
        <div className="relative z-10 w-full bg-gradient-to-t from-[#1e1612]/80 to-transparent pt-8 pb-12 overflow-hidden">
          <div className="w-full overflow-hidden">
            <div className={`animate-marquee-infinite gap-2 py-4 ${isPaused ? 'marquee-paused' : ''}`}>
              
              {/* Render Set 1 */}
              {foods.map((item, index) => (
                <div key={`set1-${item.id}-${index}`} className="relative inline-flex flex-col items-center group select-none flex-shrink-0 mx-4 pb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-white/5 bg-[#2b201a] shadow-xl isolation-isolate">
                    {item.imageUrl ? (
                      <img src={`${BACKEND_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 cursor-pointer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl transition-transform duration-500 ease-out group-hover:scale-110">🍲</div>
                    )}
                  </div>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#e8e6e3] text-stone-950 px-4 py-1.5 rounded-2xl text-[14px] font-semibold tracking-normal text-center whitespace-nowrap shadow-xl border border-white/20 max-w-[130px] truncate font-sans">
                    {item.name}
                  </span>
                </div>
              ))}

              {/* Render Duplicate Set 2 */}
              {foods.map((item, index) => (
                <div key={`set2-${item.id}-${index}`} className="relative inline-flex flex-col items-center group select-none flex-shrink-0 mx-4 pb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-white/5 bg-[#2b201a] shadow-xl isolation-isolate">
                    {item.imageUrl ? (
                      <img src={`${BACKEND_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 cursor-pointer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl transition-transform duration-500 ease-out group-hover:scale-110">🍲</div>
                    )}
                  </div>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#e8e6e3] text-stone-950 px-4 py-1.5 rounded-2xl text-[14px] font-semibold tracking-normal text-center whitespace-nowrap shadow-xl border border-white/20 max-w-[130px] truncate font-sans">
                    {item.name}
                  </span>
                </div>
              ))}

            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={() => setIsPaused(!isPaused)} className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/5 bg-[#261d18]/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition z-30 relative">
              {isPaused ? <><span>▶</span> Play</> : <><span>⏸</span> Pause</>}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE MENU GRID */}
      <div id="menu" ref={menuRef} className="max-w-6xl mx-auto px-4 pt-24 pb-12 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-500">Authentic Flavors</p>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-white font-serif mt-1">Our Culinary Masterpieces</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Showing {filteredFoods.length} items from our kitchen</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative mb-12 shadow-2xl">
          <input 
            type="text" 
            placeholder="Filter our collections..." 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            className="w-full rounded-full border border-white/5 bg-[#261d18]/90 backdrop-blur-xl px-6 py-4 pr-14 text-stone-200 placeholder:text-stone-500 text-sm outline-none transition-all shadow-inner focus:border-orange-500/50" 
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#e67e22] p-2.5 rounded-full text-white hover:bg-[#d35400] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        {!searchQuery && (
          <div className="w-full flex items-center justify-center mb-16">
            <div className="flex gap-4 overflow-x-auto py-2 px-4 max-w-full no-scrollbar">
              <button onClick={() => selectCategory('ALL')} className={`px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap border ${activeCategory === 'ALL' ? 'bg-[#e67e22] text-white border-[#e67e22] shadow-lg' : 'text-stone-400 bg-[#261d18]/60 border-white/5 hover:text-stone-200'}`}>
                All Collections
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => selectCategory(cat.name)} className={`px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap border ${activeCategory === cat.name ? 'bg-[#e67e22] text-white border-[#e67e22] shadow-lg' : 'text-stone-400 bg-[#261d18]/60 border-white/5 hover:text-stone-200'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTAINER AND CARDS ASSIGNED EXACTLY TO RICH MID-BROWN/COCOA THEME */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {foods
            .filter(f => searchQuery || activeCategory === 'ALL' || categories.find(c => c.id === f.categoryId)?.name === activeCategory)
            .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="group bg-[#281f1a] border border-white/5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-orange-500/20 hover:scale-[1.02] shadow-xl flex flex-col h-full">
                <div className="w-full h-64 bg-[#1e1612] relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={`${BACKEND_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-[#261d18] opacity-20">🍲</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e1612]/95 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-base font-bold text-white tracking-tight uppercase line-clamp-1">{item.name}</h3>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#281f1a] to-[#1e1612]/40">
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-light mb-4">
                    {item.description || "Fresh traditional ingredients prepared to perfection daily."}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-stone-500 font-mono tracking-wider">Price</span>
                    <span className="text-sm font-extrabold text-orange-400 font-mono">{item.price} <span className="text-[9px] text-stone-500 font-normal">ETB</span></span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SECTION 3: CONTACT DETAILS & FEEDBACK */}
      <div id="contact" ref={contactRef} className="max-w-4xl mx-auto px-4 pt-24 pb-12 scroll-mt-28 space-y-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-[#281f1a] border border-white/5 rounded-2xl">
            <span className="text-xl text-orange-400 block mb-2">📍</span>
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Location</h4>
            <p className="text-sm text-stone-200 mt-1 font-medium">Megenagna</p>
          </div>
          <div className="p-6 bg-[#281f1a] border border-white/5 rounded-2xl">
            <span className="text-xl text-orange-400 block mb-2">🕒</span>
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Hours</h4>
            <p className="text-sm text-stone-200 mt-1 font-medium">Mon-Sun: 8:00 AM - 9:00 PM</p>
          </div>
          <div className="p-6 bg-[#281f1a] border border-white/5 rounded-2xl">
            <span className="text-xl text-orange-400 block mb-2">📞</span>
            <h4 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Order</h4>
            <p className="text-sm text-orange-400 mt-1 font-bold font-mono">(+251) 98 700 0202</p>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 z-0">
            <img src={image2.src} alt="" className="w-full h-full object-cover brightness-[0.25]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#e67e22]/10 via-[#1e1612]/95 to-[#1e1612]" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto text-center px-6 py-12 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-lg border border-orange-500/20 mb-4">💬</div>
            <h3 className="text-2xl font-bold font-serif uppercase tracking-tight text-white">Share Your Suggestions</h3>
            <p className="text-xs text-stone-400 max-w-sm mt-2 font-light leading-relaxed">Help us improve! We would love to hear your thoughts, ideas, or feedback about our food, service, or anything else.</p>
            
            <div className="w-full mt-6 text-left space-y-1">
              <textarea 
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value.slice(0, 500))}
                placeholder="Share your thoughts, suggestions, or feedback with us..." 
                rows={4} 
                className="w-full rounded-2xl bg-[#1e1612]/80 border border-white/5 text-stone-200 text-xs p-4 focus:border-orange-500/40 outline-none resize-none placeholder:text-stone-700"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-600 font-mono px-1">
                <span>Your feedback helps us serve you better</span>
                <span>{suggestion.length}/500</span>
              </div>
            </div>

            <button onClick={() => { alert('Thank you for your valuable feedback!'); setSuggestion(''); }} className="w-full mt-6 bg-[#e67e22] hover:bg-[#d35400] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition">
              Submit Suggestion
            </button>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/5">
          <h4 className="text-sm font-bold font-serif text-stone-200 uppercase tracking-tight">Z-Tshay Cafe and Restaurant</h4>
          <p className="text-[11px] text-stone-500 mt-1 font-light">Follow us for the latest updates and mouth-watering content!</p>
          <div className="flex justify-center gap-3 mt-4">
            <a href="#" className="px-4 py-2 bg-[#281f1a] border border-white/5 rounded-full text-[10px] font-bold tracking-wider uppercase text-stone-400 hover:text-white transition">Instagram</a>
            <a href="#" className="px-4 py-2 bg-[#281f1a] border border-white/5 rounded-full text-[10px] font-bold tracking-wider uppercase text-stone-400 hover:text-white transition">Facebook</a>
            <a href="#" className="px-4 py-2 bg-[#281f1a] border border-white/5 rounded-full text-[10px] font-bold tracking-wider uppercase text-stone-400 hover:text-white transition">Tiktok</a>
          </div>
          <div className="text-[10px] text-stone-700 font-mono mt-12">© 2026 Z-Tshay Cafe and Restaurant. All rights reserved.</div>
        </div>
      </div>

      {/* GLOBAL POPUP DETAIL CARD MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1e1612]/90 backdrop-blur-md" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-md bg-[#281f1a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-60 bg-[#1e1612] relative border-b border-white/5">
              {selectedItem.imageUrl ? <img src={`${BACKEND_URL}${selectedItem.imageUrl}`} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-6xl grayscale opacity-20">🍲</div>}
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-[#1e1612]/80 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:bg-orange-500 transition">✕</button>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center text-stone-100 uppercase tracking-tight">{selectedItem.name}</h2>
              <div className="mt-1 text-center text-orange-400 font-extrabold text-lg">{selectedItem.price} ETB</div>
              <div className="mt-6 space-y-6">
                <div>
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest border-b border-white/5 pb-1.5 block w-full mb-3">Description</span>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">{selectedItem.description || "A culinary masterpiece prepared with traditional Addis techniques."}</p>
                </div>
                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest border-b border-white/5 pb-1.5 block w-full mb-3">Ingredients</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-[9px] font-bold bg-orange-500/5 text-orange-400 border border-orange-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="mt-8 w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md">Back to Menu</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}