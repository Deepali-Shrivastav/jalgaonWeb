"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface EventCategory { id: number; name: string; }

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0900-\u097F-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function AdminEventEditPage() {
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(true);
  
  const [formData, setFormData] = useState({ 
    title: "", slug: "", short_description: "", description: "", 
    organizer_name: "", organizer_contact: "",
    venue_name: "", venue_address: "", maps_url: "",
    start_datetime: "", end_datetime: "", registration_link: "",
    category: "", status: "pending", is_featured: false,
    meta_title: "", meta_description: "" 
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [catRes, eventRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/events/categories/`),
          fetch(`${baseUrl}/api/v1/events/admin/events/${id}/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        const catData = await catRes.json();
        setCategories(catData.results || catData);
        
        const data = await eventRes.json();
        setFormData({ 
          title: data.title || "", 
          slug: data.slug || "", 
          short_description: data.short_description || "", 
          description: data.description || "", 
          organizer_name: data.organizer_name || "",
          organizer_contact: data.organizer_contact || "",
          venue_name: data.venue_name || "",
          venue_address: data.venue_address || "",
          maps_url: data.maps_url || "",
          start_datetime: formatDateForInput(data.start_datetime),
          end_datetime: data.end_datetime ? formatDateForInput(data.end_datetime) : "",
          registration_link: data.registration_link || "",
          category: data.category?.id || data.category || "", 
          status: data.status || "pending", 
          is_featured: data.is_featured || false, 
          meta_title: data.meta_title || "", 
          meta_description: data.meta_description || "" 
        });
      } catch { 
        alert("Failed to load event."); 
        router.push("/admin/events"); 
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, baseUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const isCheckbox = type === "checkbox";
    const val = isCheckbox ? target.checked : value;

    setFormData(prev => {
      const nextData = { ...prev, [name]: val };
      if (name === "title" && !isSlugManual) {
        nextData.slug = slugify(String(val));
      }
      return nextData;
    });

    if (name === "slug") {
      setIsSlugManual(true);
      if (!val) {
        setIsSlugManual(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => { 
        if (val !== null && val !== "") {
          if (key === "start_datetime" || key === "end_datetime") {
            data.append(key, new Date(String(val)).toISOString());
          } else {
            data.append(key, String(typeof val === "object" ? (val as any).id : val)); 
          }
        }
      });
      if (imageFile) data.append("featured_image", imageFile);
      
      const res = await fetch(`${baseUrl}/api/v1/events/admin/events/${id}/`, { 
        method: "PATCH", 
        headers: { Authorization: `Bearer ${token}` }, 
        body: data 
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || JSON.stringify(errData));
      }
      router.push("/admin/events");
    } catch (err: any) {
      let msg = err.message || "Unknown error";
      try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed === "object" && parsed !== null) {
          msg = Object.entries(parsed)
            .map(([field, errors]) => {
              const fieldLabel = field.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
              const detail = Array.isArray(errors) ? errors.join(", ") : String(errors);
              return `${fieldLabel}: ${detail}`;
            })
            .join("\n");
        }
      } catch {
        // Not a JSON string
      }
      alert("Failed to save event:\n" + msg);
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Edit Event</h2>
        <button onClick={() => router.push("/admin/events")} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Back to List</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label className="block text-sm font-medium text-slate-600 mb-1">Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono"
            placeholder="e.g. local-event-slug"
          />
          <small className="text-slate-400">Unique identifier for the URL (changing this will change the event's link).</small>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Short Description *</label>
            <input type="text" name="short_description" value={formData.short_description} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Full Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Start Date & Time *</label>
            <input type="datetime-local" name="start_datetime" value={formData.start_datetime} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">End Date & Time</label>
            <input type="datetime-local" name="end_datetime" value={formData.end_datetime} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Venue Name *</label>
            <input type="text" name="venue_name" value={formData.venue_name} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Venue Address *</label>
            <input type="text" name="venue_address" value={formData.venue_address} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Google Maps URL</label>
            <input type="url" name="maps_url" value={formData.maps_url} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Registration Link (External)</label>
            <input type="url" name="registration_link" value={formData.registration_link} onChange={handleChange} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Organizer Name *</label>
            <input type="text" name="organizer_name" value={formData.organizer_name} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Organizer Contact</label>
            <input type="text" name="organizer_contact" value={formData.organizer_contact} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Featured Image (leave empty to keep existing)</label>
            <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} accept="image/*" className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4" />
            <span className="text-sm font-medium text-slate-600">Featured Event</span>
          </label>
        </div>

        <h3 className="text-base font-semibold mt-2">SEO Metadata</h3>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Title</label><input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-medium text-slate-600 mb-1">SEO Description</label><textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={2} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" /></div>
        
        <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Update Event"}</button>
      </form>
    </div>
  );
}
