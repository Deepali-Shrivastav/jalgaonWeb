'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ReviewsPage() {
  const { isLogin } = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/v1/listings/user/business-reviews/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const result = await res.json();
      setData(result.results || result || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchReviews();
    }
  }, [isLogin]);

  const handleReviewStatus = async (reviewId: number, status: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/v1/listings/reviews/${reviewId}/manage/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Review ${status} successfully!`);
        setData(data.map((r: any) => r.id === reviewId ? { ...r, status } : r));
      } else {
        toast.error("Failed to update review status.");
      }
    } catch (err) {
      toast.error("An error occurred while updating review.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep">Manage Reviews</h2>
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

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-hairline-soft flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-secondary/50 mb-3 block">reviews</span>
          <p className="text-secondary font-medium mb-4">No reviews found for your listings.</p>
          <Link href="/add-listing" className="bg-primary hover:bg-primary-deep text-white font-bold px-6 py-2 rounded-full transition-all text-sm">
            Add Your First Listing
          </Link>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-hairline-soft shadow-sm hover:border-primary transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-ink-deep">{item.user_name || 'Anonymous'}</h4>
                    <Link href={`/category/${item.main_category_slug || 'business'}/${item.business_slug}`} className="text-xs text-primary hover:underline font-bold mb-1 block">
                      On: {item.business_name}
                    </Link>
                    <p className="text-xs text-secondary">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex text-yellow-500">
                    {Array(item.rating_star || 0).fill(0).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-secondary mb-4 line-clamp-3">{item.user_review}</p>
              </div>
              
              <div className="flex items-center gap-2 border-t border-hairline-soft pt-3 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status || 'pending'}
                </span>
                <div className="flex-1"></div>
                {item.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleReviewStatus(item.id, 'approved')}
                    className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-green-200"
                  >
                    Approve
                  </button>
                )}
                {item.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleReviewStatus(item.id, 'rejected')}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-200"
                  >
                    Hide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
