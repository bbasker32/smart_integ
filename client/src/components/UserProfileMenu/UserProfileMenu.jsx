import {
  ChevronDownIcon,
  LogOutIcon,
  Settings,
  UserIcon,
  Users2Icon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const UserProfileMenu = ({
  userName = "Admin",
  userImage = "/jacques.png",
  userRole = "",
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}) => {
  const navigate = useNavigate();

  const handleUsersClick = () => {
    navigate("/users");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 outline-none">
        <Avatar className="w-[45px] h-[45px] md:w-[60px] md:h-[60px] border border-solid border-[#21448a8f]">
          <AvatarImage
            src={userImage}
            alt="User profile"
            className="rounded-[42px]"
          />
          <AvatarFallback>
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:block font-['Montserrat',Helvetica] text-lg tracking-[0.10px]">
          {userName}
        </span>
        <ChevronDownIcon className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px] p-2 bg-white rounded-lg shadow-lg">
        <DropdownMenuItem
          onClick={onProfileClick}
          className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-[#ecf3ff] rounded-md"
        >
          <UserIcon className="w-5 h-5 text-[#474444]" />
          <span className="font-['Montserrat',Helvetica] text-[#474444]">
            Profil
          </span>
        </DropdownMenuItem>
        {userRole === "admin" && (
          <DropdownMenuItem
            onClick={handleUsersClick}
            className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-[#ecf3ff] rounded-md"
          >
            <Users2Icon className="w-5 h-5 text-[#474444]" />
            <span className="font-['Montserrat',Helvetica] text-[#474444]">
              Gestion des utilisateurs
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onSettingsClick}
          className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-[#ecf3ff] rounded-md"
        >
          <Settings className="w-5 h-5 text-[#474444]" />
          <span className="font-['Montserrat',Helvetica] text-[#474444]">
            Paramètre
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 border-t border-[#eae7e7]" />
        <DropdownMenuItem
          onClick={onLogoutClick}
          className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-[#ecf3ff] rounded-md"
        >
          <LogOutIcon className="w-5 h-5 text-[#474444]" />
          <span className="font-['Montserrat',Helvetica] text-[#474444]">
            Se déconnecter
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
