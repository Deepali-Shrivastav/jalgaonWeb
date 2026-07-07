"use client";

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { getCachedScore, setCachedScore } from '@/lib/profileCompletionStorage';

interface ProfileCompletion {
  score: number;
  isComplete: boolean;
  missingFields: Array<{ id: string; label: string }>;
  isLoading: boolean;
}

export function useProfileCompletion(): ProfileCompletion {
  const { user, isLogin } = useContext(AuthContext);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [missingFields, setMissingFields] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    if (!isLogin || !user) {
      setScore(0);
      setMissingFields([]);
      setIsLoading(false);
      return;
    }

    const calculateCompleteness = (userData: any) => {
      let currentScore = 0;
      const missing = [];

      // 1. Name: 25% (First name and Last name present)
      const hasFirstName = !!userData.first_name?.trim();
      const hasLastName = !!userData.last_name?.trim();
      if (hasFirstName && hasLastName) {
        currentScore += 25;
      } else {
        missing.push({ id: 'name', label: 'Add your first & last name' });
      }

      // 2. Email: 20%
      if (!!userData.email?.trim()) {
        currentScore += 20;
      } else {
        missing.push({ id: 'email', label: 'Add your email address' });
      }

      // 3. Profile picture: 30%
      if (!!userData.profile_pic) {
        currentScore += 30;
      } else {
        missing.push({ id: 'profile_pic', label: 'Upload a profile photo' });
      }

      // 4. Bio: 15%
      if (!!userData.bio?.trim()) {
        currentScore += 15;
      } else {
        missing.push({ id: 'bio', label: 'Tell the community about yourself (Bio)' });
      }

      // 5. Date of Birth: 10%
      if (!!userData.date_of_birth) {
        currentScore += 10;
      } else {
        missing.push({ id: 'date_of_birth', label: 'Add your date of birth' });
      }

      setScore(currentScore);
      setMissingFields(missing);
      setCachedScore(currentScore);
      setIsLoading(false);
    };

    // If cache has score and it is 100%, we don't need to load or check anything
    const cached = getCachedScore();
    if (cached === 100) {
      setScore(100);
      setMissingFields([]);
      setIsLoading(false);
      return;
    }

    // Load detailed profile from API to ensure we have the absolute latest DB values
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          calculateCompleteness(user);
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/v1/auth/user/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const result = await res.json();
          const latestUserData = result.user || result;
          calculateCompleteness(latestUserData);
        } else {
          calculateCompleteness(user);
        }
      } catch (err) {
        console.error('Failed to fetch user profile for completeness score calculation:', err);
        calculateCompleteness(user);
      }
    };

    fetchLatestProfile();
  }, [isLogin, user]);

  return {
    score,
    isComplete: score === 100,
    missingFields,
    isLoading
  };
}
