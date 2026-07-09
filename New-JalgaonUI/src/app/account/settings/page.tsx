'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isLogin, setUser } = useContext(AuthContext);
  
  // Profile Data state
  const [profileData, setProfileData] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone_number: '',
    bio: '',
    date_of_birth: '',
    profile_pic: ''
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
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

          const getProfilePicUrl = (url: string | null | undefined) => {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            return `${baseUrl}${url}`;
          };

          setProfileData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || user?.email || '',
            phone_number: userData.phone_number || user?.phone_number || '',
            bio: userData.bio || '',
            date_of_birth: userData.date_of_birth || '',
            profile_pic: userData.profile_pic || ''
          });

          if (userData.profile_pic) {
            setProfilePicPreview(getProfilePicUrl(userData.profile_pic));
          }
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
      
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('email', profileData.email);
      formData.append('bio', profileData.bio);
      formData.append('date_of_birth', profileData.date_of_birth);
      
      if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
      }

      const res = await fetch(`${baseUrl}/api/v1/auth/user/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const result = await res.json();
        const updatedUser = result.user || result;

        const getProfilePicUrl = (url: string | null | undefined) => {
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          return `${baseUrl}${url}`;
        };

        // Update user context
        if (user) {
          const newUser = { 
            ...user, 
            first_name: updatedUser.first_name, 
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            date_of_birth: updatedUser.date_of_birth,
            profile_pic: updatedUser.profile_pic
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        }

        setProfileData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          email: updatedUser.email || '',
          phone_number: updatedUser.phone_number || '',
          bio: updatedUser.bio || '',
          date_of_birth: updatedUser.date_of_birth || '',
          profile_pic: updatedUser.profile_pic || ''
        });

        if (updatedUser.profile_pic) {
          setProfilePicPreview(getProfilePicUrl(updatedUser.profile_pic));
        }
        setProfilePicFile(null);

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
          {/* Profile Picture Upload Widget */}
          <div className="flex items-center gap-6 pb-4 border-b border-hairline-soft">
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border border-outline-variant bg-surface-container-low flex items-center justify-center shrink-0">
              {profilePicPreview ? (
                <img 
                  src={profilePicPreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-4xl">account_circle</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200">
                <span className="material-symbols-outlined text-2xl mb-0.5">photo_camera</span>
                <span className="text-[10px] font-bold tracking-wider uppercase">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePicFile(file);
                      setProfilePicPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-deep">Profile Picture</h3>
              <p className="text-xs text-secondary mt-1">
                Upload a professional photo to build credibility in the community.
              </p>
              {profilePicFile && (
                <p className="text-[11px] text-primary font-semibold mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Ready to upload: {profilePicFile.name}
                </p>
              )}
            </div>
          </div>

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

          <div className="w-full">
            <label className="block text-sm font-semibold text-ink-deep mb-2">About You (Bio)</label>
            <textarea 
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              rows={4}
              maxLength={500}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium resize-none"
              placeholder="Tell the community about yourself, your business, or your expertise..."
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-secondary">Brief description for your public profile.</p>
              <p className="text-xs text-secondary font-medium">
                {profileData.bio.length}/500 characters
              </p>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-ink-deep mb-2">Date of Birth</label>
            <input 
              type="date" 
              value={profileData.date_of_birth}
              onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
            />
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
