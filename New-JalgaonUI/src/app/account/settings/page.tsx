'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isLogin, setUser } = useContext(AuthContext);
  
  // Profile Data state
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Data state
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isLogin) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/auth/user/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          // Extract user data from result.user wrapper if present, else root
          const userData = result.user || result;
          setProfileData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || user?.email || '',
            phone_number: userData.phone_number || user?.phone_number || ''
          });
        }
      } catch (err) {
        console.error("Error fetching user profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLogin, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const res = await fetch(`${baseUrl}/api/v1/auth/user/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        const updatedUser = result.user || result;
        // Update user context
        if (user) {
          const newUser = { 
            ...user, 
            first_name: updatedUser.first_name, 
            last_name: updatedUser.last_name,
            email: updatedUser.email 
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        toast.success("Profile updated successfully!");
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("An error occurred while updating profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match!");
      setUpdatingPassword(false);
      return;
    }
    
    setTimeout(() => {
      toast.success("Password update requested! (UI Only)");
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setUpdatingPassword(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Profile Settings Section */}
      <section>
        <h2 className="text-2xl font-extrabold text-ink-deep mb-6 pb-4 border-b border-hairline-soft">
          Profile Settings
        </h2>
        <form onSubmit={handleProfileUpdate} className="w-full max-w-2xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full">
              <label className="block text-sm font-semibold text-ink-deep mb-2">First Name</label>
              <input 
                type="text" 
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder="Enter first name"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-semibold text-ink-deep mb-2">Last Name</label>
              <input 
                type="text" 
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-ink-deep mb-2">Email Address</label>
            <input 
              type="email" 
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-ink-deep mb-2">Phone Number</label>
            <input 
              type="text" 
              value={profileData.phone_number}
              readOnly
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3.5 outline-none text-secondary cursor-not-allowed text-sm font-medium"
            />
            <p className="text-xs text-secondary mt-2">Phone number cannot be changed directly.</p>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={updatingProfile}
              className="bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {updatingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </section>

      {/* Password Update Section */}
      <section className="pt-6 border-t border-hairline-soft">
        <h2 className="text-2xl font-extrabold text-ink-deep mb-6 pb-4 border-b border-hairline-soft">
          Change Password
        </h2>
        <form onSubmit={handlePasswordUpdate} className="w-full max-w-2xl flex flex-col gap-6">
          <div className="w-full">
            <label className="block text-sm font-semibold text-ink-deep mb-2">Current Password</label>
            <input 
              type="password" 
              required
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
              placeholder="Enter current password"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full">
              <label className="block text-sm font-semibold text-ink-deep mb-2">New Password</label>
              <input 
                type="password" 
                required
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder="Enter new password"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-semibold text-ink-deep mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={updatingPassword}
              className="bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
