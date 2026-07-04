"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string | number;
  phone_number: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  isLoginFormOpen: boolean;
  setIsLoginFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLogin: false,
  setIsLogin: () => {},
  isLoginFormOpen: false,
  setIsLoginFormOpen: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for user session on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLogin,
        setIsLogin,
        isLoginFormOpen,
        setIsLoginFormOpen,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
