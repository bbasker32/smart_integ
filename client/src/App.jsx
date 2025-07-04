import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm/LoginForm";
import ProfilePage from "./screens/ProfilePage/ProfilePage";
import { UserManagement } from "./screens/UserManagement/UserManagement";
import { VueProjetsProfile } from "./screens/VueProjetsProfile/VueProjetsProfile";
import { VueProjectPublication } from "./screens/VueProjectPublication/VueProjectPublication";
import { VueProjectCandidate } from "./screens/VueProjectCandidate/VueProjectCandidate";
import { AppLayout } from "./components/Layout/AppLayout";
import CVUpload from "./components/CVUpload";
import { Toaster } from "react-hot-toast";
import { useUser } from "./contexts/UserContext";
import { useEffect } from "react";
import { authService } from "./services/auth.service";
import ParametrePage from "./screens/ParametrePage/ParametrePage";
import ChangePasswordPage from "./screens/ChangePasswordPage/ChangePasswordPage";
import UnauthorizedPage from "./screens/UnauthorizedPage/UnauthorizedPage";

// Composant ProtectedRoute intégré
function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  const forceChangePassword =
    localStorage.getItem("forceChangePassword") === "true";
  const currentPath = window.location.pathname;

  if (!isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  if (forceChangePassword && currentPath !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  return children;
}

function App() {
  const { refreshUser } = useUser();

  // Refresh user data on app load if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // If we have token, refresh the context
      refreshUser();
    } else if (token) {
      // If we have token but no user data, clear the token (invalid state)
      localStorage.removeItem("token");
    }
  }, [refreshUser]);

  return (
    <>
      <Toaster />
      <Routes>
        {/* Route pour l'upload de CV */}
        <Route path="/profile/:profileId/upload-cv" element={<CVUpload />} />

        {/* Route publique pour le login */}
        <Route path="/login" element={<LoginForm />} />

        {/* Route pour la page de changement de mot de passe */}
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route path="/unauthorized-page" element={<UnauthorizedPage />} />

        {/* Routes protégées avec le layout global */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Routes principales */}
          <Route path="/" element={<VueProjetsProfile />} />
          <Route path="/profile/:profileId" element={<VueProjetsProfile />} />
          <Route
            path="/profile/:profileId/publication"
            element={<VueProjectPublication />}
          />
          <Route path="/candidate" element={<VueProjectCandidate />} />

          {/* Route pour la gestion des utilisateurs */}
          <Route path="/users" element={<UserManagement />} />

          {/* Route pour la page de profil */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Route pour les paramètres */}
          <Route path="/parametres" element={<ParametrePage />} />
        </Route>

        {/* Redirection par défaut vers la page d'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
