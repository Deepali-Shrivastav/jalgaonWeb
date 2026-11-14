"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "@/context/AuthContext";
import Pagination from "@/components/Pagination";

interface UserData {
  id: number;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  role: string;
  date_joined: string;
}

const roles = [
  "super_admin", "admin", "content_manager", "news_editor",
  "seo_manager", "moderator", "support", "advertiser",
  "business_owner"
];

export default function AdminUsersPage() {
  const { user } = useContext(AuthContext);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const isSuperAdmin = useMemo(() => {
    if (user?.role === "super_admin" || user?.is_superuser === true) return true;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === "super_admin" || parsed.is_superuser === true) return true;
      }
    } catch {}
    return false;
  }, [user]);

  const currentUserId = useMemo(() => {
    if (user?.id) return user.id;
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored).id : null;
    } catch {
      return null;
    }
  }, [user]);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const safeBaseUrl = baseUrl || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${safeBaseUrl}/api/v1/admin-panel/users/?search=${encodeURIComponent(searchTerm)}&page=${page}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return;
      }

      const data = await res.json();
      setUsers(data.results || data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, page]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem("token");
    const safeBaseUrl = baseUrl || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${safeBaseUrl}/api/v1/admin-panel/users/${userId}/role/`, {
        method: "PATCH",
        headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        setStatusMsg(data.error || data.detail || data.message || "Failed to update role");
        setTimeout(() => setStatusMsg(""), 4000);
        fetchUsers();
        return;
      }

      setStatusMsg(data.message || "Role updated");
      fetchUsers();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error: any) {
      setStatusMsg("Error updating role");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    const safeBaseUrl = baseUrl || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${safeBaseUrl}/api/v1/admin-panel/users/${deleteTarget.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || data.detail || "Failed to delete user.");
        return;
      }

      setStatusMsg(data.message || `User ${deleteTarget.phone_number} deleted successfully.`);
      setDeleteTarget(null);
      fetchUsers();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      console.error("Failed to delete user", err);
      setErrorMessage("Network error: Could not delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return users;
    return [...users].sort((a: any, b: any) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Combine first/last name for sorting
      if (sortConfig.key === 'first_name') {
        aVal = `${a.first_name || ''} ${a.last_name || ''}`;
        bVal = `${b.first_name || ''} ${b.last_name || ''}`;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  return (
    <div className="space-y-4">
      {statusMsg && (
        <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span className="text-sm font-medium">{statusMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMsg("")}
            className="text-green-600 hover:text-green-800 text-sm font-semibold"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-[400px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('phone_number')}
                  >
                    <div className="flex items-center gap-1">
                      Phone / ID 
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {sortConfig?.key === 'phone_number' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('first_name')}
                  >
                    <div className="flex items-center gap-1">
                      Name 
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {sortConfig?.key === 'first_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role 
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('date_joined')}
                  >
                    <div className="flex items-center gap-1">
                      Joined Date 
                      <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {sortConfig?.key === 'date_joined' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </div>
                  </th>
                  {isSuperAdmin && (
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedUsers.length > 0 ? sortedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.phone_number}</td>
                    <td className="px-4 py-3 text-slate-700">{u.first_name ? `${u.first_name} ${u.last_name || ""}` : "-"}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium capitalize">{u.role.replace(/_/g, " ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-right">
                        {String(u.id) === String(currentUserId) ? (
                          <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">
                            Current User
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setErrorMessage("");
                              setDeleteTarget(u);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-xs"
                            title="Delete user completely from database"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">group_off</span>
                        <p className="font-medium text-slate-500 text-base">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => {
            if (!isDeleting) {
              setDeleteTarget(null);
              setErrorMessage("");
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Delete User Permanently?
            </h3>
            
            <p className="text-sm text-slate-600 text-center mb-4">
              Are you sure you want to completely delete user{" "}
              <strong className="text-slate-900 font-semibold">{deleteTarget.phone_number}</strong>
              {deleteTarget.first_name ? ` (${deleteTarget.first_name} ${deleteTarget.last_name || ""})` : ""}?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5 text-amber-600 shrink-0">info</span>
                <div>
                  <strong>Warning:</strong> This will completely delete this user and all associated records from the database. This action cannot be undone.
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setErrorMessage("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">delete_forever</span>
                    <span>Yes, Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
