import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ProfileProvider } from "./contexts/ProfileContext";
import { UserProvider } from "./contexts/UserContext";
import App from "./App";

createRoot(document.getElementById("app")).render(
    <BrowserRouter>
      <UserProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </UserProvider>
    </BrowserRouter>
);
