'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const { isLogin } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      
      // Handle standard paginated results structure or raw list
      const list = data.results || data.data || data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchNotifications();
    }
  }, [isLogin]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/notifications/${id}/mark-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
        );
      }
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("All notifications marked as read.");
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("Error updating notifications.");
    }
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'listing_approved':
      case 'ad_approved':
        return { icon: 'check_circle', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
      case 'listing_rejected':
      case 'ad_rejected':
        return { icon: 'cancel', color: 'text-red-500 bg-red-50 border-red-100' };
      case 'job_application':
        return { icon: 'work', color: 'text-blue-500 bg-blue-50 border-blue-100' };
      case 'application_status':
        return { icon: 'assignment_turned_in', color: 'text-purple-500 bg-purple-50 border-purple-100' };
      default:
        return { icon: 'notifications', color: 'text-primary bg-primary/5 border-primary/10' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-hairline-soft">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-deep">Notifications</h2>
          <p className="text-xs text-secondary mt-1">
            Stay updated with updates about your listings, applications, and campaigns.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="self-start text-xs font-bold text-primary hover:text-primary-deep bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl transition-all border border-primary/10"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-2">error</span>
          <p className="text-ink-deep font-bold">{error}</p>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">notifications_off</span>
          <p className="text-secondary font-medium mb-4">You have no notifications yet.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const style = getIconAndColor(notif.notification_type);
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) {
                    handleMarkAsRead(notif.id);
                  }
                }}
                className={`p-4 rounded-xl border transition-all flex gap-4 items-start ${
                  notif.is_read
                    ? 'bg-white border-hairline-soft opacity-75'
                    : 'bg-primary/5 border-primary/20 shadow-sm cursor-pointer'
                }`}
              >
                <div className={`p-2 rounded-lg border shrink-0 flex items-center justify-center ${style.color}`}>
                  <span className="material-symbols-outlined text-lg">{style.icon}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold text-ink-deep text-sm sm:text-base ${!notif.is_read ? 'font-extrabold' : 'font-medium'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-secondary shrink-0 font-medium">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-secondary mt-1">{notif.message}</p>
                  
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                    >
                      View Details
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </Link>
                  )}
                </div>
                {!notif.is_read && (
                  <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 self-center" title="Unread"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
