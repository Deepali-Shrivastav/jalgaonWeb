"use client";

import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function LoginSignup() {
  const { setUser, setIsLogin, isLoginFormOpen, setIsLoginFormOpen } =
    useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // false = Login, true = SignUp
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      await handleLoginSubmit();
    } catch (error: any) {
      console.error("Registration failed", error);
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      if (
        ["super_admin", "admin", "moderator", "content_manager", "news_editor"].includes(
          user.role
        )
      ) {
        window.location.href = "/admin";
      } else {
        setIsLoginFormOpen(false);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      setErrorMessage(error.message);
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
          onClick={() => setIsLoginFormOpen(false)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* --- Registration Form --- */}
        {isSignUp && (
          <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-300">
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
                Join Jalgaon.com to get started
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="reg-mobile"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Mobile Number
              </label>
              <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  phone_iphone
                </span>
                <input
                  type="tel"
                  id="reg-mobile"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number without spaces or country code"
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="reg-password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  placeholder="Create a strong password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
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
            </div>

            <p className="text-[13px] text-slate-500 mb-5">
              By registering, you accept our terms and conditions.
            </p>

            {errorMessage && (
              <p className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-5 border border-red-200 text-center">
                {errorMessage}
              </p>
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
                  }}
                  className="text-primary font-semibold ml-1 hover:text-blue-700 hover:underline transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* --- Login Form --- */}
        {!isSignUp && (
          <form onSubmit={handleLoginSubmit} className="animate-in fade-in zoom-in-95 duration-300">
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
                Log in to your account or admin portal
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-mobile"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Mobile Number
              </label>
              <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  phone_iphone
                </span>
                <input
                  type="tel"
                  id="login-mobile"
                  placeholder="Enter your registered number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number without spaces or country code"
                  className="flex-1 bg-transparent border-none py-3.5 px-3 text-base text-slate-900 outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-slate-400 ml-4 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Enter your password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
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
            </div>

            <div className="flex justify-between items-center mb-5">
              <span className="text-[13px] text-slate-500">
                Secure login portal.
              </span>
            </div>

            {errorMessage && (
              <p className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-5 border border-red-200 text-center">
                {errorMessage}
              </p>
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
                  }}
                  className="text-primary font-semibold ml-1 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
