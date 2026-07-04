"use client";

import React, { useRef, useState, useEffect } from 'react';

const industries = [
  {
    title: "Automotive",
    icon: "directions_car",
    description:
      "Find reliable garages, showrooms, spare parts dealers and vehicle services across the city.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Car Dealerships", icon: "directions_car" },
      { name: "Two-Wheeler Dealerships", icon: "two_wheeler" },
      { name: "Dealerships", icon: "storefront" },
      { name: "Spare Parts and Accessories", icon: "settings_input_component" },
      { name: "Auto Repair and Services", icon: "car_repair" },
      { name: "Washing Centre", icon: "local_car_wash" },
      { name: "Vehicle Rentals", icon: "airport_shuttle" },
    ],
  },
  {
    title: "Agriculture Services",
    icon: "agriculture",
    description:
      "Explore farming, dairy, poultry, nursery, irrigation and agriculture-related services.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Crop Production", icon: "grass" },
      { name: "Animal Husbandry", icon: "pets" },
      { name: "Dairy Farming", icon: "local_drink" },
      { name: "Poultry Farming", icon: "egg" },
      { name: "Fisheries", icon: "set_meal" },
      { name: "Agricultural Equipment", icon: "agriculture" },
      { name: "Seed Suppliers", icon: "eco" },
      { name: "Fertilizers and Pesticides", icon: "science" },
      { name: "Plant Nursery", icon: "local_florist" },
      { name: "Drip Irrigation", icon: "water_drop" },
    ],
  },
  {
    title: "Construction and Real Estate",
    icon: "real_estate_agent",
    description:
      "Find real estate agents, builders, architects, interior designers and construction service providers.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Real Estate Agents", icon: "real_estate_agent" },
      { name: "Architects and Interior Designers", icon: "architecture" },
      { name: "Building Materials Suppliers", icon: "construction" },
      { name: "Property Management", icon: "apartment" },
      { name: "Fabricators", icon: "precision_manufacturing" },
      { name: "Paints", icon: "format_paint" },
      { name: "Electricians and Plumbers", icon: "plumbing" },
      {
        name: "Real Estate Builders & Construction Company",
        icon: "foundation",
      },
    ],
  },
  {
    title: "Beauty and Wellness",
    icon: "spa",
    description:
      "Discover salons, spas, gyms, yoga centres and wellness services near you.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Beauty Salons / Parlour", icon: "content_cut" },
      { name: "Spas", icon: "spa" },
      { name: "Barber Shops", icon: "face_retouching_natural" },
      { name: "Gyms and Fitness Centres", icon: "fitness_center" },
      { name: "Yoga Centres", icon: "self_improvement" },
      { name: "Cosmetic Shops", icon: "brush" },
    ],
  },
  {
    title: "Business Services",
    icon: "business_center",
    description:
      "Find professional services for accounting, legal work, consulting, marketing and events.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Accounting and Bookkeeping", icon: "calculate" },
      { name: "Legal Services", icon: "gavel" },
      { name: "Business Consultants", icon: "business_center" },
      { name: "Marketing and Advertising", icon: "campaign" },
      { name: "Event Management", icon: "event" },
      { name: "Printing and Publishing", icon: "print" },
    ],
  },
  {
    title: "Education",
    icon: "school",
    description:
      "Explore coaching centres, institutes, schools, colleges, libraries and education consultants.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Coaching Centres", icon: "menu_book" },
      { name: "Technical Institutes", icon: "computer" },
      { name: "Language Schools", icon: "translate" },
      { name: "Educational Consultants", icon: "support_agent" },
      { name: "Libraries", icon: "local_library" },
      { name: "Schools and Colleges", icon: "school" },
    ],
  },
  {
    title: "Electronics and Appliances",
    icon: "devices",
    description:
      "Find electronics shops, mobile stores, computer shops, appliances and repair services.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Electronics Shops", icon: "devices" },
      { name: "Mobile Shops", icon: "smartphone" },
      { name: "Computer and Laptop Shops", icon: "laptop_mac" },
      { name: "Home Appliances", icon: "kitchen" },
      { name: "Repair Services", icon: "build" },
      { name: "Battery Shops", icon: "battery_charging_full" },
    ],
  },
  {
    title: "Finance and Insurance",
    icon: "account_balance",
    description:
      "Discover banks, financial consultants, mutual fund advisors, loan services and tax consultants.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Banks", icon: "account_balance" },
      { name: "Financial Consultants", icon: "request_quote" },
      { name: "Mutual Funds", icon: "trending_up" },
      { name: "Loan Services", icon: "payments" },
      { name: "Tax Consultants", icon: "receipt_long" },
    ],
  },
  {
    title: "Food and Beverages",
    icon: "restaurant",
    description:
      "Find restaurants, cafes, bakeries, fast food outlets, catering, tiffin services and more.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Restaurants", icon: "restaurant" },
      { name: "Cafes", icon: "local_cafe" },
      { name: "Bakeries", icon: "bakery_dining" },
      { name: "Dhaba", icon: "dining" },
      { name: "Jain Food Restaurant", icon: "restaurant_menu" },
      { name: "Catering Services", icon: "room_service" },
      { name: "Fast Food Outlets", icon: "fastfood" },
      { name: "Sweet Shops", icon: "cake" },
      { name: "Mess and Tiffin Services", icon: "lunch_dining" },
      { name: "Tea Center", icon: "emoji_food_beverage" },
      { name: "Paan Shop", icon: "store" },
      { name: "Soda Shop", icon: "local_bar" },
    ],
  },
  {
    title: "Healthcare",
    icon: "local_hospital",
    description:
      "Find pharmacies, clinics, hospitals, diagnostic centres, physiotherapy centres and dermatologists.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Pharmacies / Medicals", icon: "local_pharmacy" },
      { name: "Clinics", icon: "medical_services" },
      { name: "Hospitals", icon: "local_hospital" },
      { name: "Diagnostic Centres", icon: "biotech" },
      { name: "Physiotherapy Centres", icon: "accessibility_new" },
      { name: "Dermatologists", icon: "face" },
    ],
  },
  {
    title: "Home Services",
    icon: "home_repair_service",
    description:
      "Find cleaning, pest control, maintenance, movers, packers and security services.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Cleaning Services", icon: "cleaning_services" },
      { name: "Pest Control", icon: "pest_control" },
      { name: "Home Maintenance", icon: "home_repair_service" },
      { name: "Movers and Packers", icon: "local_shipping" },
      { name: "Security Services", icon: "security" },
    ],
  },
  {
    title: "Hospitality",
    icon: "hotel",
    description:
      "Explore hotels, motels, resorts, homestays and wedding venues.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Hotels", icon: "hotel" },
      { name: "Motels", icon: "bed" },
      { name: "Resorts", icon: "villa" },
      { name: "Homestays", icon: "house" },
      { name: "Wedding Venues", icon: "celebration" },
    ],
  },
  {
    title: "IT and Software",
    icon: "developer_mode",
    description:
      "Find software companies, IT service providers, web developers and data recovery services.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Software Development", icon: "code" },
      { name: "IT Services", icon: "support_agent" },
      { name: "Web Design and Development", icon: "web" },
      { name: "Data Recovery", icon: "settings_backup_restore" },
    ],
  },
  {
    title: "Manufacturing",
    icon: "factory",
    description:
      "Explore manufacturing businesses including food, textile, furniture, machinery, electronics and plastics.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Food and Beverage Manufacturing", icon: "factory" },
      { name: "Textile Manufacturing", icon: "checkroom" },
      { name: "Furniture Manufacturing", icon: "chair" },
      { name: "Machinery Manufacturing", icon: "precision_manufacturing" },
      { name: "Electronics Manufacturing", icon: "memory" },
      { name: "Paper Manufacturing", icon: "article" },
      { name: "Chemicals", icon: "science" },
      { name: "Pipe Manufacturing", icon: "plumbing" },
      { name: "Plastic Mat Manufacturing", icon: "inventory_2" },
    ],
  },
  {
    title: "Media and Entertainment",
    icon: "movie",
    description:
      "Find music schools, dance schools, art galleries, photography studios and movie theaters.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Music and Dance Schools", icon: "music_note" },
      { name: "Art Galleries", icon: "palette" },
      { name: "Photography Studios", icon: "photo_camera" },
      { name: "Movie Theaters", icon: "movie" },
    ],
  },
  {
    title: "Personal Care",
    icon: "dry_cleaning",
    description:
      "Find videography services, dry cleaners, tailors, shoe repair shops and laundry services.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Videography Services", icon: "videocam" },
      { name: "Dry Cleaners", icon: "dry_cleaning" },
      { name: "Tailors", icon: "checkroom" },
      { name: "Shoe Repair", icon: "hiking" },
      { name: "Laundry Services", icon: "local_laundry_service" },
    ],
  },
  {
    title: "Retail",
    icon: "shopping_bag",
    description:
      "Explore grocery shops, general stores, clothing, jewellery, hardware, stationery and other retail shops.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Grocery Shops", icon: "local_grocery_store" },
      { name: "General Store", icon: "storefront" },
      { name: "Footwear Shops", icon: "store" },
      { name: "Ice-Cream Shop", icon: "icecream" },
      { name: "Jewellery Shops", icon: "diamond" },
      { name: "Sanitary Fittings", icon: "bathroom" },
      { name: "Book Shops", icon: "menu_book" },
      { name: "Gift Shops", icon: "redeem" },
      { name: "Hardware Shops", icon: "hardware" },
      { name: "Clothing Shops", icon: "checkroom" },
      { name: "Utensils", icon: "flatware" },
      { name: "Optical Shop", icon: "visibility" },
      { name: "Stationery Stores", icon: "edit_note" },
      { name: "Pet Store", icon: "pets" },
      { name: "Flowers Shop", icon: "local_florist" },
    ],
  },
  {
    title: "Sports and Recreation",
    icon: "sports_soccer",
    description:
      "Find sports goods shops, fitness equipment, sports clubs, recreation centres and adventure sports.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Sports Goods Shops", icon: "sports_soccer" },
      { name: "Fitness Equipment", icon: "fitness_center" },
      { name: "Sports Clubs", icon: "groups" },
      { name: "Recreational Centres", icon: "sports_esports" },
      { name: "Adventure Sports", icon: "paragliding" },
    ],
  },
  {
    title: "Transportation",
    icon: "local_taxi",
    description:
      "Find taxi services, public transport, logistics, couriers, travel agencies and bicycle shops.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Taxi Services", icon: "local_taxi" },
      { name: "Public Transportation", icon: "directions_bus" },
      { name: "Logistics and Couriers", icon: "local_shipping" },
      { name: "Travel Agencies", icon: "travel_explore" },
      { name: "Bicycle Shops", icon: "pedal_bike" },
    ],
  },
  {
    title: "Utilities",
    icon: "electrical_services",
    description:
      "Find water suppliers, electricity providers, gas agencies and internet service providers.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Water Tank Supply", icon: "water" },
      { name: "Water Jar Supply", icon: "water_drop" },
      { name: "Electricity Providers", icon: "electrical_services" },
      { name: "Gas Agencies", icon: "propane_tank" },
      { name: "Internet Service Providers", icon: "wifi" },
    ],
  },
  {
    title: "Wholesale and Distributors",
    icon: "warehouse",
    description:
      "Explore distributors, warehouses, scrap dealers, wholesale markets and plastic suppliers.",
    btnText: "Explore Industry",
    reverse: false,
    items: [
      { name: "Distribution Services", icon: "hub" },
      { name: "Warehousing", icon: "warehouse" },
      { name: "Scrap Dealer", icon: "recycling" },
      { name: "Wholesale Markets", icon: "store" },
      { name: "Plastic", icon: "inventory_2" },
    ],
  },
  {
    title: "Miscellaneous",
    icon: "category",
    description:
      "Find driving schools, xerox shops, fireworks dealers, radium art and other local services.",
    btnText: "Explore Industry",
    reverse: true,
    items: [
      { name: "Driving School", icon: "drive_eta" },
      { name: "Xerox Shop", icon: "content_copy" },
      { name: "Fireworks", icon: "local_fire_department" },
      { name: "Radium Art", icon: "format_paint" },
    ],
  },
];

function IndustryCard({ ind, onSelectCategory }: { ind: any; onSelectCategory: (cat: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const row = rowRef.current;
    if (!container || !row) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) {
        setTranslateX(0);
        return;
      }

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const relativeX = Math.min(Math.max(mouseX / rect.width, 0), 1); // 0 to 1

      const containerWidth = rect.width;
      const rowWidth = row.scrollWidth;

      if (rowWidth > containerWidth) {
        const maxTranslate = rowWidth - containerWidth;
        const targetTranslate = -relativeX * maxTranslate;
        setTranslateX(targetTranslate);
      } else {
        const maxParallax = 30; // max px offset
        const targetTranslate = (0.5 - relativeX) * 2 * maxParallax;
        setTranslateX(targetTranslate);
      }
    };

    const handleMouseLeave = () => {
      setTranslateX(0);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className={`bg-white rounded-xl overflow-hidden border border-hairline-soft flex flex-col ${ind.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} group hover:shadow-2xl transition-all duration-500`}>
      
      <div className="lg:w-1/3 p-xxxl flex flex-col justify-center bg-primary/5 shrink-0 z-10">
        <span className="material-symbols-outlined text-5xl text-primary mb-xl">{ind.icon}</span>
        <h3 className="text-3xl font-extrabold text-ink-deep mb-base">{ind.title}</h3>
        <p className="text-secondary mb-xxxl text-lg leading-relaxed">{ind.description}</p>
        <button 
          onClick={() => onSelectCategory(ind.slug || ind.title)}
          className="w-fit bg-primary text-white px-xl py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg cursor-pointer"
        >
          {ind.btnText}
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="lg:w-2/3 overflow-x-auto lg:overflow-x-hidden scrollbar-none snap-x snap-mandatory lg:snap-none p-xl flex items-center"
      >
        <div 
          ref={rowRef}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
          className="flex flex-row gap-xl min-w-max pb-4 lg:pb-0"
        >
          {ind.items.map((item: any, itemIdx: number) => (
            <div 
              key={itemIdx} 
              onClick={() => onSelectCategory(ind.slug || ind.title)}
              className="flex flex-col items-center text-center group/item cursor-pointer w-[120px] sm:w-[150px] shrink-0 snap-start"
            >
              <div className="w-full aspect-square rounded-xl bg-surface-container-low flex items-center justify-center mb-base group-hover/item:bg-primary/10 transition-colors overflow-hidden">
                <span className="material-symbols-outlined text-4xl text-primary/40">{item.icon}</span>
              </div>
              <span className="font-bold text-sm text-ink-deep leading-snug">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default function IndustryGrids({ onSelectCategory }: { onSelectCategory: (cat: string) => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/api/v1/listings/categories/`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        
        const mapped = data.map((cat: any, index: number) => {
          const meta = industries.find(i => i.title.toLowerCase() === cat.main_category.toLowerCase()) || {
            icon: "category",
            description: `Explore listings related to ${cat.main_category}.`,
            btnText: "Explore Industry",
          };
          
          return {
            title: cat.main_category,
            slug: cat.slug,
            icon: meta.icon,
            description: meta.description,
            btnText: meta.btnText || "Explore Industry",
            reverse: index % 2 !== 0,
            items: (cat.subcategories || []).map((sub: any) => {
              const subMeta = industries.find(i => i.title.toLowerCase() === cat.main_category.toLowerCase())?.items?.find((i: any) => i.name.toLowerCase() === sub.sub_category.toLowerCase());
              return {
                name: sub.sub_category,
                slug: sub.slug,
                icon: subMeta?.icon || "category"
              };
            })
          };
        });
        
        setCategories(mapped);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        // Fallback to hardcoded if API fails
        setCategories(industries);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <section className="py-section bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-xxl">
        <h2 className="text-center text-4xl font-extrabold text-ink-deep mb-section">Explore Local Industries</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-xl">
            {categories.map((ind, idx) => (
              <IndustryCard key={idx} ind={ind} onSelectCategory={onSelectCategory} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
