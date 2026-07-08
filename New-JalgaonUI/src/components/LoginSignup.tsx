"use client";

import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { snoozeEngagementPrompt, neverShowEngagementPrompt } from "@/lib/engagementStorage";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function LoginSignup() {
  const { setUser, setIsLogin, isLoginFormOpen, setIsLoginFormOpen, engagementTriggered, setEngagementTriggered } =
    useContext(AuthContext);

  const handleClose = () => {
    if (engagementTriggered) {
      snoozeEngagementPrompt(7);
      setEngagementTriggered(false);
    }
    setIsLoginFormOpen(false);
  };
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // false = Login, true = SignUp
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (!userPassword) {
      newErrors.password = "Password is required.";
    } else if (isSignUp && userPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const getCsrfToken = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/csrf-token/`
        : "/api/v1/auth/csrf-token/";
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) return "";
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return data.csrfToken || "";
      } catch (e) {
        return "";
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();
    
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    const csrfToken = await getCsrfToken();

    try {
      const url = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register/`
        : "/api/v1/auth/register/";

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: userPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        let msg = "";
        if (typeof data === "object" && !Array.isArray(data)) {
          msg = Object.entries(data)
            .map(([field, errors]) => {
              const fieldLabel =
                field.charAt(0).toUpperCase() +
                field.slice(1).replace("_", " ");
              const errorText = Array.isArray(errors)
                ? errors.join(" ")
                : errors;
              return `${fieldLabel}: ${errorText}`;
            })
            .join(" | ");
        } else if (typeof data === "string") {
          msg = data;
        }
        throw new Error(msg || "Registration failed. Please try again.");
      }

      // Auto login after register
      toast.success("Account created successfully!");
      await handleLoginSubmit();
    } catch (error: any) {
      console.error("Registration failed", error);
      setErrorMessage(error.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      toast.dismiss();
    }

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    const csrfToken = await getCsrfToken();

    try {
      const url = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login/`
        : "/api/v1/auth/login/";

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: userPassword,
        }),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Ignored, not JSON
      }

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please try again.");
      }

      const { user, access, refresh } = data;
      setUser(user);
      setIsLogin(true);
      localStorage.setItem("token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("just_logged_in", "true");

      if (
        ["super_admin", "admin", "moderator", "content_manager", "news_editor"].includes(
          user.role
        )
      ) {
        toast.success("Login successful. Redirecting to admin...");
        setTimeout(() => { window.location.href = "/admin"; }, 1000);
      } else {
        setEngagementTriggered(false);
        toast.success("Logged in successfully!");
        setIsLoginFormOpen(false);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoginFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginFormOpen]);

  if (!isLoginFormOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-[450px] bg-white p-6 sm:p-10 shadow-2xl transition-transform duration-300 ease-out transform translate-y-0 h-full sm:h-auto sm:rounded-3xl flex flex-col justify-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* --- Registration Form --- */}
        {isSignUp && (
          <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-300" noValidate>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img
                  src="/main-logo.png"
                  alt="Jalgaon Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Create Account
              </h1>
              <p className="text-sm text-slate-500">
                {engagementTriggered
                  ? "Join Jalgaon.com to save listings, post events, and connect with your city"
                  : "Join Jalgaon.com to get started"}
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="reg-mobile"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Mobile Number
              </label>
              <div className={`relative flex items-center bg-slate-50 border-2 rounded-xl focus-within:bg-white focus-within:ring-4 transition-all ${
                errors.phone 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' 
                  : 'border-slate-200 focus-within:border-primary focus-within:ring-primary/10'
              }`}>
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  phone_iphone
                </span>
                <input
                  type="tel"
                  id="reg-mobile"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  required
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="reg-password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <div className={`relative flex items-center bg-slate-50 border-2 rounded-xl focus-within:bg-white focus-within:ring-4 transition-all ${
                errors.password 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' 
                  : 'border-slate-200 focus-within:border-primary focus-within:ring-primary/10'
              }`}>
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  placeholder="Create a strong password"
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  required
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            <p className="text-[13px] text-slate-500 mb-5">
              By registering, you accept our terms and conditions.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none py-4 rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-2xl">
                  progress_activity
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage("");
                    setErrors({});
                  }}
                  className="text-primary font-semibold ml-1 hover:text-blue-700 hover:underline transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>

            {engagementTriggered && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    snoozeEngagementPrompt(7);
                    setEngagementTriggered(false);
                    setIsLoginFormOpen(false);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
                >
                  Remind me later (7 days)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    neverShowEngagementPrompt();
                    setEngagementTriggered(false);
                    setIsLoginFormOpen(false);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Don't show this again
                </button>
              </div>
            )}
          </form>
        )}

        {/* --- Login Form --- */}
        {!isSignUp && (
          <form onSubmit={handleLoginSubmit} className="animate-in fade-in zoom-in-95 duration-300" noValidate>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img
                  src="/main-logo.png"
                  alt="Jalgaon Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500">
                {engagementTriggered
                  ? "Join Jalgaon.com to save listings, post events, and connect with your city"
                  : "Log in to your account or admin portal"}
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-mobile"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Mobile Number
              </label>
              <div className={`relative flex items-center bg-slate-50 border-2 rounded-xl focus-within:bg-white focus-within:ring-4 transition-all ${
                errors.phone 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' 
                  : 'border-slate-200 focus-within:border-primary focus-within:ring-primary/10'
              }`}>
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  phone_iphone
                </span>
                <input
                  type="tel"
                  id="login-mobile"
                  placeholder="Enter your registered number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  required
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <div className={`relative flex items-center bg-slate-50 border-2 rounded-xl focus-within:bg-white focus-within:ring-4 transition-all ${
                errors.password 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' 
                  : 'border-slate-200 focus-within:border-primary focus-within:ring-primary/10'
              }`}>
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Enter your password"
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  required
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center mb-5">
              <span className="text-[13px] text-slate-500">
                Secure login portal.
              </span>
              <button 
                type="button" 
                onClick={() => {
                  setIsLoginFormOpen(false);
                  window.location.href = '/forgot-password';
                }}
                className="text-[13px] text-primary font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-red-500 text-xl mt-0.5">error</span>
                <p className="text-sm font-medium text-red-600 flex-1">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none py-4 rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-2xl">
                  progress_activity
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage("");
                    setErrors({});
                  }}
                  className="text-primary font-semibold ml-1 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {engagementTriggered && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    snoozeEngagementPrompt(7);
                    setEngagementTriggered(false);
                    setIsLoginFormOpen(false);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
                >
                  Remind me later (7 days)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    neverShowEngagementPrompt();
                    setEngagementTriggered(false);
                    setIsLoginFormOpen(false);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Don't show this again
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
