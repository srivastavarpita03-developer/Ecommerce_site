import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const UserContextProvider = createContext();
function UserContext({ children }) {
  const [user, setUser] = useState(null);
  async function getData() {
    const response = await api.get("/auth/me");
    const res = response.data;
    if (res?.success) {
      setUser(res?.data);
    }
  }
  useEffect(() => {
    getData();
  }, []);

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
    return false;
  }
}
  return (
    <UserContextProvider.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContextProvider.Provider>
  );
}

export function useUser() {
  const data = useContext(UserContextProvider);
  return data;
}

export default UserContext;
