import { MenuIcon, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { UserProfileMenu } from "../../components/UserProfileMenu/UserProfileMenu.jsx";
import { useNavigate, Outlet } from "react-router-dom";
import { SidebarSection } from "../SidebarSection/SidebarSection.jsx";
import { useUser } from "../../contexts/UserContext";
import { authService } from "../../services/auth.service";

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleSidebarRefresh = () => {
    setRefreshSidebarKey((prev) => prev + 1);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleUsersClick = () => {
    navigate("/users");
  };

  const handleSettingsClick = () => {
    navigate("/parametres");
  };

  const handleLogoutClick = () => {
    authService.logout();
    logout();
    navigate("/login");
  };

  // Make the refresh function available globally
  useEffect(() => {
    window.handleSidebarRefresh = handleSidebarRefresh;
    return () => {
      delete window.handleSidebarRefresh;
    };
  }, []);

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1440px]">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-[#eae7e7] flex items-center justify-between h-[98px] z-20 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
              <img
                className="w-[180px] md:w-[244px] h-[70px] md:h-[98px] object-contain"
                alt="SmartHire Logo"
                src="/image-1.png"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Notification Button */}
              <div className="w-[45px] h-[45px] md:w-[61px] md:h-[55px] bg-[#c9f6ff36] rounded-[50px] flex items-center justify-center">
                <img
                  className="w-8 h-8 md:w-10 md:h-10"
                  alt="Notification alert"
                  src="/notification-alert-svgrepo-com-1.svg"
                />
              </div>

              {/* User Profile Menu */}
              <UserProfileMenu
                userName={
                  `${user.firstName} ${user.lastName}`.trim() || "Utilisateur"
                }
                userImage={user.avatar}
                userRole={user.role}
                onProfileClick={handleProfileClick}
                onUsersClick={handleUsersClick}
                onSettingsClick={handleSettingsClick}
                onLogoutClick={handleLogoutClick}
              />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 pt-[98px]">
            {/* Sidebar */}
            <SidebarSection
              userRole={user.role}
              key={refreshSidebarKey}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onRefreshNeeded={handleSidebarRefresh}
            />

            {/* Content Area */}
            <main className="flex-1 flex flex-col lg:ml-[312px]">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
