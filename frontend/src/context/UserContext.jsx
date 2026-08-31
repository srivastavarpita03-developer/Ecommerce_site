import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../utils/api";

const UserContextProvider = createContext();

function UserContext({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================
  // GET LOGGED-IN USER
  // ======================================

  async function getData() {
    try {
      const response = await api.get("/auth/me");

      const res = response.data;

      if (res?.success && res?.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("User Not Logged In");

      // If no valid login/token
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // CHECK USER ON PAGE LOAD
  // ======================================

  useEffect(() => {
    getData();
  }, []);

  // ======================================
  // LOGOUT
  // ======================================

  async function logout() {
    try {
      const response = await api.post("/auth/logout");

      console.log("Logout Response:", response.data);

      if (response.data.success) {
        setUser(null);
        return true;
      }

      return false;
    } catch (error) {
      console.log("Logout Error:", error);

      // Even if backend logout fails,
      // remove user from frontend
      setUser(null);

      return false;
    }
  }

  return (
    <UserContextProvider.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </UserContextProvider.Provider>
  );
}

// ======================================
// USE USER
// ======================================

export function useUser() {
  return useContext(UserContextProvider);
}

export default UserContext;