"use client";

import React, { useState, useEffect, useContext } from "react";
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
  "business_owner", "registered_user", "guest",
];

export default function AdminUsersPage() {
  const { user } = useContext(AuthContext);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const isSuperAdmin = user?.role === "super_admin";

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const safeBaseUrl = baseUrl || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${safeBaseUrl}/api/v1/admin-panel/users/?search=${searchTerm}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/";
        return;
      }

      const data = await res.json();
      setStatusMsg(data.message || "Role updated");
      fetchUsers();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error: any) {
      setStatusMsg("Error updating role");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
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
        <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">{statusMsg}</div>
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
                    <div className="flex items-center gap-1">Phone / ID <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'phone_number' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('first_name')}
                  >
                    <div className="flex items-center gap-1">Name <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'first_name' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">Role <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('date_joined')}
                  >
                    <div className="flex items-center gap-1">Joined Date <span className="material-symbols-outlined text-[16px] text-slate-400">{sortConfig?.key === 'date_joined' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedUsers.length > 0 ? sortedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{u.phone_number}</td>
                    <td className="px-4 py-3">{u.first_name ? `${u.first_name} ${u.last_name || ""}` : "-"}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
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
    </div>
  );
}
