import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "./ToastContext";
import api from '../services/api'; // <-- Import our new api service

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Optional: You could add an API call here to verify the token is still valid
        // e.g., api.get('/auth/me').catch(() => logout());
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      await logout(); // Clear storage if something is wrong
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        setToken(token);
        setUser(userData);
        
        showToast("Welcome back!", `Hello ${userData.name}`, "success");
        return true;
      } else {
        showToast("Login Failed", response.data.message || "Invalid credentials", "error");
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred. Please try again.";
      showToast("Login Failed", message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        showToast("Account Created!", "Please check your email to verify your account.", "success");
    
        return true;
      } else {
        showToast("Registration Failed", response.data.message || "Could not create account.", "error");
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred. Please try again.";
      showToast("Registration Failed", message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setToken(null);
    showToast("Logged Out", "See you next time!", "info");
  };

  const updateProfile = async (data) => {
   
    try {
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        showToast("Profile Updated", "Your changes have been saved", "success");
        return true;
      }
      return false;
    } catch (error) {
      showToast("Update Failed", "Please try again", "error");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}