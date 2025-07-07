import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { profileService } from "../services/profile.service"; // Assuming profileService exists
import { useToast } from "../hooks/useToast";

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { profileId: profileIdFromUrl } = useParams();
  const [activeProfileId, setActiveProfileId] = useState(profileIdFromUrl);
  const [activeProfileData, setActiveProfileData] = useState(null);
  const [activeProfileTitle, setActiveProfileTitle] = useState(null);
  const { showError } = useToast();

  useEffect(() => {
    // Update activeProfileId when URL param changes
    if (profileIdFromUrl) {
      setActiveProfileId(profileIdFromUrl);
    }
  }, [profileIdFromUrl]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (activeProfileId) {
        try {
          const data = await profileService.getProfile(activeProfileId);
          setActiveProfileData(data);
          setActiveProfileTitle(data?.title || null);
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
          showError("Failed to load profile details.");
          setActiveProfileData(null); // Clear data on error
          setActiveProfileTitle(null); // Clear title on error
        }
      } else {
        setActiveProfileData(null); // Clear data if no profileId
        setActiveProfileTitle(null); // Clear title if no profileId
      }
    };

    fetchProfileData();
  }, [activeProfileId, showError]);

  return (
    <ProfileContext.Provider
      value={{
        activeProfileId,
        setActiveProfileId,
        activeProfileData,
        activeProfileTitle,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
