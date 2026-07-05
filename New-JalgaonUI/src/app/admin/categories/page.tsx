"use client";

import React, { useState, useEffect } from "react";

interface Category { id: number; main_category: string; category_img: string | null; subcategories_count: number; }
interface SubCategory { id: number; sub_category: string; sub_category_img: string | null; }

export default function AdminCategoriesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newSubCategoryImage, setNewSubCategoryImage] = useState<File | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/categories/`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(await res.json());
    } catch (error) { console.error("Failed to fetch categories", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) { setErrorMsg("Category name is required"); return; }
    setSubmitting(true); setErrorMsg("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("main_category", newCategoryName);
    if (newCategoryImage) formData.append("category_img", newCategoryImage);
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/categories/`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      setIsAddModalOpen(false); setNewCategoryName(""); setNewCategoryImage(null); fetchCategories();
    } catch (error: any) { setErrorMsg("Failed to create category"); }
    finally { setSubmitting(false); }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) { setErrorMsg("Category name is required"); return; }
    setSubmitting(true); setErrorMsg("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("main_category", newCategoryName);
    if (newCategoryImage) formData.append("category_img", newCategoryImage);
    try {
      await fetch(`${baseUrl}/api/v1/admin-panel/categories/${editingCategory?.id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: formData });
      setIsEditModalOpen(false); setEditingCategory(null); setNewCategoryName(""); setNewCategoryImage(null); fetchCategories();
    } catch { setErrorMsg("Failed to edit category"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/categories/${catId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCategories();
        if (expandedCategory === catId) setExpandedCategory(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch {
      alert("Failed to delete category");
    }
  };

  const openEditModal = (cat: Category) => { setEditingCategory(cat); setNewCategoryName(cat.main_category); setNewCategoryImage(null); setIsEditModalOpen(true); setErrorMsg(""); };

  const fetchSubcategories = async (catId: number) => {
    setLoadingSubcategories(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/categories/${catId}/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubcategories(data.subcategories || []);
    } catch { console.error("Failed to fetch subcategories"); }
    finally { setLoadingSubcategories(false); }
  };

  const toggleExpand = async (catId: number) => {
    if (expandedCategory === catId) { setExpandedCategory(null); return; }
    setExpandedCategory(catId); 
    await fetchSubcategories(catId);
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategoryName) { setErrorMsg("Subcategory name is required"); return; }
    setSubmitting(true); setErrorMsg("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("sub_category", newSubCategoryName);
    if (newSubCategoryImage) formData.append("sub_category_img", newSubCategoryImage);
    try {
      if (editingSubCategory) {
        await fetch(`${baseUrl}/api/v1/admin-panel/subcategories/${editingSubCategory.id}/`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: formData });
      } else {
        formData.append("main_category", String(expandedCategory));
        await fetch(`${baseUrl}/api/v1/admin-panel/subcategories/`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      }
      setIsSubModalOpen(false); setEditingSubCategory(null); setNewSubCategoryName(""); setNewSubCategoryImage(null);
      if (expandedCategory) await fetchSubcategories(expandedCategory);
      fetchCategories();
    } catch { setErrorMsg("Failed to save subcategory"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteSubCategory = async (subId: number) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin-panel/subcategories/${subId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (expandedCategory) await fetchSubcategories(expandedCategory);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete subcategory");
      }
    } catch {
      alert("Failed to delete subcategory");
    }
  };

  const openAddSubModal = () => { setEditingSubCategory(null); setNewSubCategoryName(""); setNewSubCategoryImage(null); setIsSubModalOpen(true); setErrorMsg(""); };
  const openEditSubModal = (sub: SubCategory) => { setEditingSubCategory(sub); setNewSubCategoryName(sub.sub_category); setNewSubCategoryImage(null); setIsSubModalOpen(true); setErrorMsg(""); };

  const renderModal = (isOpen: boolean, title: string, onClose: () => void, onSubmit: (e: React.FormEvent) => void, nameVal: string, setName: (v: string) => void, setImg: (f: File | null) => void, btnLabel: string) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-[500px] mx-4">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          {errorMsg && <div className="p-2 bg-red-50 text-red-600 rounded mb-3 text-sm">{errorMsg}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
              <input type="text" value={nameVal} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Image (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] || null)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">{submitting ? "Saving..." : btnLabel}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold">Category Management</h3>
          <button onClick={() => { setNewCategoryName(""); setNewCategoryImage(null); setIsAddModalOpen(true); setErrorMsg(""); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>Add Category</button>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left"><tr>
                <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Logo</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Category Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Subcategories</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length > 0 ? categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr className={`hover:bg-slate-50 ${expandedCategory === cat.id ? "bg-slate-50" : ""}`}>
                      <td className="px-4 py-3 text-slate-400">#{cat.id}</td>
                      <td className="px-4 py-3">{cat.category_img ? <img src={`${baseUrl}${cat.category_img}`} alt={cat.main_category} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-200 rounded" />}</td>
                      <td className="px-4 py-3 font-medium">{cat.main_category}</td>
                      <td className="px-4 py-3"><button onClick={() => toggleExpand(cat.id)} className="px-3 py-1 border border-slate-200 rounded text-xs hover:bg-slate-100">{expandedCategory === cat.id ? "Hide" : "View"} {cat.subcategories_count} subcategories</button></td>
                      <td className="px-4 py-3 flex items-center gap-2 h-[64px]">
                        <button onClick={() => openEditModal(cat)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </td>
                    </tr>
                    {expandedCategory === cat.id && (
                      <tr><td colSpan={5} className="p-0">
                        <div className="p-5 bg-slate-50 border-t border-slate-200">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-slate-700">Subcategories for {cat.main_category}</h4>
                            <button onClick={openAddSubModal} className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>Add Subcategory</button>
                          </div>
                          {loadingSubcategories ? <p className="text-sm text-slate-400">Loading...</p> : subcategories.length > 0 ? (
                            <div className="flex flex-wrap gap-3">{subcategories.map(sub => (
                              <div key={sub.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 min-w-[200px]">
                                {sub.sub_category_img && <img src={`${baseUrl}${sub.sub_category_img}`} className="w-8 h-8 rounded object-cover" alt={sub.sub_category} />}
                                <span className="text-sm font-medium flex-1">{sub.sub_category}</span>
                                <button onClick={() => openEditSubModal(sub)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button onClick={() => handleDeleteSubCategory(sub.id)} className="text-red-400 hover:text-red-600"><span className="material-symbols-outlined text-lg">delete</span></button>
                              </div>
                            ))}</div>
                          ) : <p className="text-sm text-slate-400">No subcategories found.</p>}
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No categories found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {renderModal(isAddModalOpen, "Add New Category", () => setIsAddModalOpen(false), handleAddCategory, newCategoryName, setNewCategoryName, setNewCategoryImage, "Create Category")}
      {renderModal(isEditModalOpen, "Edit Category", () => setIsEditModalOpen(false), handleEditCategory, newCategoryName, setNewCategoryName, setNewCategoryImage, "Save Changes")}
      {renderModal(isSubModalOpen, editingSubCategory ? "Edit Subcategory" : "Add Subcategory", () => setIsSubModalOpen(false), handleSubCategorySubmit, newSubCategoryName, setNewSubCategoryName, setNewSubCategoryImage, editingSubCategory ? "Save Subcategory" : "Add Subcategory")}
    </div>
  );
}

