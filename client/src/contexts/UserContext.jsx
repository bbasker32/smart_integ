import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { userService } from "../services/user.service";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    avatar: "https://www.w3schools.com/howto/img_avatar.png",
    userId: "",
  });
  const [loading, setLoading] = useState(true);

  // Fonction pour charger l'utilisateur depuis l'API sécurisée
  const loadUserFromAPI = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
        userId: "",
      });
      setLoading(false);
      return;
    }
    try {
      const userData = await userService.getMe();
      setUser({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userData.role || "",
        avatar: userData.avatar || "https://www.w3schools.com/howto/img_avatar.png",
        userId: userData.userId || userData.id || "",
      });
    } catch (error) {
      setUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
        userId: "",
      });
    }
    setLoading(false);
  }, []); // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    // Nettoyage de l'ancien localStorage
    localStorage.removeItem("user");
    loadUserFromAPI();
    // eslint-disable-next-line
  }, [loadUserFromAPI]);

  const refreshUser = loadUserFromAPI;

  const setUserFromLogin = (userData) => {
    setUser({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      role: userData.role || "",
      avatar: userData.avatar || "https://www.w3schools.com/howto/img_avatar.png",
      userId: userData.userId || userData.id || "",
    });
  };

  const logout = () => {
    setUser({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      userId: "",
    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <UserContext.Provider
      value={{ user, updateUser: setUser, logout, refreshUser, setUserFromLogin, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
