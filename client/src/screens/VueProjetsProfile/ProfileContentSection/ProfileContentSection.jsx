import { XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { CustomTabs } from "../../../components/custom-tabs/CustomTabs";
import { ValidationPopUp } from "../../../components/modals/ValidationPopUp";
import { profileService } from "../../../services/profile.service";
import { projectService } from "../../../services/project.service";
import { useToast } from "../../../hooks/useToast";

export const ProfileContentSection = () => {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const { showSuccess, showError, showPersistentWarning, dismissToast } =
    useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [persistentToastId, setPersistentToastId] = useState(null);
  const [isProjectArchived, setIsProjectArchived] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    yearsOfExperience: "",
    typeContract: "",
    mainMissions: "",
    education: "",
    startDate: "",
    technicalSkills: [],
    softSkills: [],
    languages: [],
    fk_project: null,
    // Project related fields
    projectServices: "",
    projectResp: "",
    projectStatus: "",
  });

  // Input states for skills and languages
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const [errors, setErrors] = useState({});

  // Add state for defaultTab
  const [defaultTab, setDefaultTab] = useState("profile");

  useEffect(() => {
    const fetchData = async () => {
      if (!profileId) return;

      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile(profileId);

        // First update profile data
        const updatedFormData = {
          title: profileData.title || "",
          description: profileData.description || "",
          location: profileData.location || "",
          yearsOfExperience: profileData.yearsOfExperience || "",
          typeContract: profileData.typeContract || "",
          mainMissions: profileData.mainMissions || "",
          education: profileData.education || "",
          startDate: profileData.startDate
            ? new Date(profileData.startDate).toISOString().split("T")[0]
            : "",
          technicalSkills: profileData.technicalSkills || [],
          softSkills: profileData.softSkills || [],
          languages: profileData.languages || [],
          fk_project: profileData.fk_project,
          projectServices: "",
          projectResp: "",
          projectStatus: "",
        };

        // If profile has a project ID, fetch project data
        if (profileData.fk_project) {
          const projectData = await projectService.getProject(
            profileData.fk_project
          );
          updatedFormData.projectServices = projectData.department || "";
          // Set project resp to user's full name if available
          updatedFormData.projectResp = projectData.User
            ? `${projectData.User.firstName} ${projectData.User.lastName}`.trim()
            : projectData.resp || "";
          updatedFormData.projectStatus = projectData.status || "";
          setIsProjectArchived(!!projectData.is_archived);
        } else {
          setIsProjectArchived(false);
        }

        setFormData(updatedFormData);
        // Set default tab based on status
        setDefaultTab(profileData.status || "profile");
      } catch (error) {
        console.error("Error fetching data:", error);
        showError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTechnicalSkillKeyDown = (e) => {
    if (e.key === "Enter" && newTechnicalSkill.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newTechnicalSkill.trim()],
      }));
      setNewTechnicalSkill("");
    }
  };

  const handleSoftSkillKeyDown = (e) => {
    if (e.key === "Enter" && newSoftSkill.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        softSkills: [...prev.softSkills, newSoftSkill.trim()],
      }));
      setNewSoftSkill("");
    }
  };

  const handleLanguageKeyDown = (e) => {
    if (e.key === "Enter" && newLanguage.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeTechnicalSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const removeSoftSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      softSkills: prev.softSkills.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeLanguage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleTabChange = async (value) => {
    if (profileId) {
      try {
        await profileService.setProfileStatus(profileId, value);
      } catch (e) {
        // Optionally handle error
      }
    }
    if (value === "publication") {
      navigate(`/profile/${profileId}/publication`);
    } else if (value === "candidate") {
      navigate(`/profile/${profileId}/candidate`);
    } else if (value === "entretien") {
      navigate(`/profile/${profileId}/entretien`);
    } else if (value === "contrat") {
      navigate(`/profile/${profileId}/contrat`);
    } else {
      navigate(`/profile/${profileId}`);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Intitule est requis.";
    if (!formData.location.trim()) newErrors.location = "Lieu est requis.";
    if (!formData.yearsOfExperience)
      newErrors.yearsOfExperience = "Expérience est requis.";
    if (!formData.typeContract)
      newErrors.typeContract = "Type de contrat est requis.";
    if (!formData.description.trim())
      newErrors.description = "Description est requis.";
    if (!formData.mainMissions.trim())
      newErrors.mainMissions = "Missions principales est requis.";
    if (!formData.education.trim())
      newErrors.education = "Formation requise est requis.";
    if (!formData.startDate) newErrors.startDate = "Date debut est requis.";
    if (!formData.technicalSkills.length)
      newErrors.technicalSkills = "Les compétences techniques sont requises.";
    if (!formData.softSkills.length)
      newErrors.softSkills = "Les compétences soft sont requises.";
    if (!formData.languages.length)
      newErrors.languages = "Les langues requises sont requises.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (profileId) {
        await profileService.updateProfile(profileId, formData);
        showSuccess("Profil mis à jour avec succès");
      } else {
        const response = await profileService.createProfile(formData);
        navigate(`/profile/${response.id}`);
        showSuccess("Profil créé avec succès");
      }
      if (window.handleSidebarRefresh) {
        window.handleSidebarRefresh();
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showError(
        profileId
          ? "Échec de la mise à jour du profil"
          : "Échec de la création du profil"
      );
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setShowValidationPopup(true);
    const toastId = showPersistentWarning(
      "Attention : La suppression de ce profil supprimera également toutes les offres d'emploi et publications associées."
    );
    setPersistentToastId(toastId);
  };

  const handleConfirmCancel = async () => {
    try {
      if (profileId) {
        await profileService.deleteProfile(profileId);
        showSuccess("Profil supprimé avec succès");
        setShowValidationPopup(false);
        dismissToast(persistentToastId);
        navigate("/");
        if (window.handleSidebarRefresh) {
          window.handleSidebarRefresh();
        }
      }
    } catch (error) {
      console.error("Error deleting profile:", error);

      // Gérer l'erreur spécifique pour les profils avec publications publiées
      if (error.response?.status === 403 && error.response?.data?.error) {
        showError(error.response.data.error);
      } else {
        showError("Échec de la suppression du profil");
      }

      setShowValidationPopup(false);
      dismissToast(persistentToastId);
    }
  };

  const handleCloseValidationPopup = () => {
    setShowValidationPopup(false);
    if (persistentToastId) {
      dismissToast(persistentToastId);
    }
  };

  const tabs = [
    { value: "profile", label: "Profile" },
    { value: "publication", label: "Publication" },
    { value: "candidate", label: "Candidate" },
    { value: "entretien", label: "Entretien" },
    { value: "contrat", label: "Contrat" },
  ];

  return (
    <Card className="w-full max-w-[1067px] mx-auto rounded-[5px] border border-[#eae7e7]">
      <CardContent className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-[#214389]">Loading profile data...</div>
          </div>
        ) : (
          <>
            {isProjectArchived && (
              <div className="text-blue-600 text-center mb-2">
                Ce profil appartient à un projet archivé et ne peut plus être
                modifié.
              </div>
            )}
            {/* Top row inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Services
                </label>
                <Input
                  name="projectServices"
                  value={formData.projectServices}
                  disabled
                  className="h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Resp
                </label>
                <Input
                  name="projectResp"
                  value={formData.projectResp}
                  disabled
                  className="h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Status
                </label>
                <Select
                  value={formData.projectStatus}
                  onValueChange={(value) =>
                    handleSelectChange("projectStatus", value)
                  }
                  disabled
                >
                  <SelectTrigger className="h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] bg-gray-50">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Cours">En Cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="En Attente">En Attente</SelectItem>
                    <SelectItem value="Annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <CustomTabs
              tabs={tabs}
              defaultValue={defaultTab}
              onValueChange={handleTabChange}
            />

            {/* Middle section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Intitule
                  </label>
                  {errors.title && (
                    <span className="text-red-500 text-xs">{errors.title}</span>
                  )}
                </div>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`h-10 border-[#dfd4d4] ${
                    errors.title ? "border-red-500" : ""
                  }`}
                  disabled={isProjectArchived}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Lieu
                  </label>
                  {errors.location && (
                    <span className="text-red-500 text-xs">
                      {errors.location}
                    </span>
                  )}
                </div>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`h-10 border-[#dfd4d4] ${
                    errors.location ? "border-red-500" : ""
                  }`}
                  disabled={isProjectArchived}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Expérience
                  </label>
                  {errors.yearsOfExperience && (
                    <span className="text-red-500 text-xs">
                      {errors.yearsOfExperience}
                    </span>
                  )}
                </div>
                <Input
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className={`h-10 border-[#dfd4d4] ${
                    errors.yearsOfExperience ? "border-red-500" : ""
                  }`}
                  placeholder="Ex: 3"
                  disabled={isProjectArchived}
                ></Input>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Date debut
                  </label>
                  {errors.startDate && (
                    <span className="text-red-500 text-xs">
                      {errors.startDate}
                    </span>
                  )}
                </div>
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`h-10 border-[#dfd4d4] ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                  disabled={isProjectArchived}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Type de contrat
                  </label>
                  {errors.typeContract && (
                    <span className="text-red-500 text-xs">
                      {errors.typeContract}
                    </span>
                  )}
                </div>
                <Select
                  value={formData.typeContract}
                  onValueChange={(value) =>
                    handleSelectChange("typeContract", value)
                  }
                  disabled={isProjectArchived}
                >
                  <SelectTrigger
                    className={`h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] ${
                      errors.typeContract ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select Contract Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Description
                </label>
                {errors.description && (
                  <span className="text-red-500 text-xs">
                    {errors.description}
                  </span>
                )}
              </div>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`min-h-[148px] border-[#dfd4d4] ${
                  errors.description ? "border-red-500" : ""
                }`}
                disabled={isProjectArchived}
              />
            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Missions principales
                  </label>
                  {errors.mainMissions && (
                    <span className="text-red-500 text-xs">
                      {errors.mainMissions}
                    </span>
                  )}
                </div>
                <Textarea
                  name="mainMissions"
                  value={formData.mainMissions}
                  onChange={handleInputChange}
                  className={`min-h-[80px] border-[#dfd4d4] ${
                    errors.mainMissions ? "border-red-500" : ""
                  }`}
                  disabled={isProjectArchived}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                    Formation requise
                  </label>
                  {errors.education && (
                    <span className="text-red-500 text-xs">
                      {errors.education}
                    </span>
                  )}
                </div>
                <Textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className={`min-h-[80px] border-[#dfd4d4] ${
                    errors.education ? "border-red-500" : ""
                  }`}
                  disabled={isProjectArchived}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Compétences techniques
                </label>
                {errors.technicalSkills && (
                  <span className="text-red-500 text-xs">
                    {errors.technicalSkills}
                  </span>
                )}
                <div className="min-h-[80px] border border-[#dfd4d4] rounded-md px-3 py-2 flex flex-wrap gap-2 items-start focus-within:ring-2 focus-within:ring-[#214389] focus-within:border-transparent">
                  {formData.technicalSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-[#474444] text-white h-7 px-2 flex items-center gap-1 rounded-[5px]"
                    >
                      {skill}
                      <XIcon
                        className="w-3.5 h-3.5 ml-1 cursor-pointer"
                        onClick={
                          isProjectArchived
                            ? undefined
                            : () => removeTechnicalSkill(index)
                        }
                        style={
                          isProjectArchived
                            ? { pointerEvents: "none", opacity: 0.6 }
                            : {}
                        }
                      />
                    </Badge>
                  ))}
                  <input
                    value={newTechnicalSkill}
                    onChange={(e) => setNewTechnicalSkill(e.target.value)}
                    onKeyDown={handleTechnicalSkillKeyDown}
                    placeholder={
                      formData.technicalSkills.length === 0
                        ? "Type a skill and press Enter"
                        : ""
                    }
                    className={`flex-1 min-w-[150px] outline-none border-none text-sm text-[#666666] font-['Montserrat',Helvetica] bg-transparent ${
                      errors.technicalSkills ? "border-red-500" : ""
                    }`}
                    disabled={isProjectArchived}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Compétences soft
                </label>
                {errors.softSkills && (
                  <span className="text-red-500 text-xs">
                    {errors.softSkills}
                  </span>
                )}
                <div className="min-h-[80px] border border-[#dfd4d4] rounded-md px-3 py-2 flex flex-wrap gap-2 items-start focus-within:ring-2 focus-within:ring-[#214389] focus-within:border-transparent">
                  {formData.softSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-[#474444] text-white h-7 px-2 flex items-center gap-1 rounded-[5px]"
                    >
                      {skill}
                      <XIcon
                        className="w-3.5 h-3.5 ml-1 cursor-pointer"
                        onClick={
                          isProjectArchived
                            ? undefined
                            : () => removeSoftSkill(index)
                        }
                        style={
                          isProjectArchived
                            ? { pointerEvents: "none", opacity: 0.6 }
                            : {}
                        }
                      />
                    </Badge>
                  ))}
                  <input
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    onKeyDown={handleSoftSkillKeyDown}
                    placeholder={
                      formData.softSkills.length === 0
                        ? "Type a soft skill and press Enter"
                        : ""
                    }
                    className={`flex-1 min-w-[150px] outline-none border-none text-sm text-[#666666] font-['Montserrat',Helvetica] bg-transparent ${
                      errors.softSkills ? "border-red-500" : ""
                    }`}
                    disabled={isProjectArchived}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Langues requises
                </label>
                {errors.languages && (
                  <span className="text-red-500 text-xs">
                    {errors.languages}
                  </span>
                )}
                <div className="min-h-[80px] border border-[#dfd4d4] rounded p-3 flex flex-wrap gap-2 items-start focus-within:ring-2 focus-within:ring-[#214389] focus-within:border-transparent">
                  {formData.languages.map((language, index) => (
                    <Badge
                      key={index}
                      className="bg-[#474444] text-white h-7 px-2 flex items-center gap-1 rounded-[5px]"
                    >
                      {language}
                      <XIcon
                        className="w-3.5 h-3.5 ml-1 cursor-pointer"
                        onClick={
                          isProjectArchived
                            ? undefined
                            : () => removeLanguage(index)
                        }
                        style={
                          isProjectArchived
                            ? { pointerEvents: "none", opacity: 0.6 }
                            : {}
                        }
                      />
                    </Badge>
                  ))}
                  <input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={handleLanguageKeyDown}
                    placeholder={
                      formData.languages.length === 0
                        ? "Type a language and press Enter"
                        : ""
                    }
                    className={`flex-1 min-w-[150px] outline-none border-none text-sm text-[#666666] font-['Montserrat',Helvetica] bg-transparent ${
                      errors.languages ? "border-red-500" : ""
                    }`}
                    disabled={isProjectArchived}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-[#214389] text-[#214389]"
                onClick={handleCancel}
                disabled={isProjectArchived}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#214389] text-white hover:bg-[#214389]/90"
                onClick={handleSubmit}
                disabled={isProjectArchived}
              >
                Save
              </Button>
              <Button
                className="bg-[#214389] text-white hover:bg-[#214389]/90"
                onClick={() => handleTabChange("publication")}
                disabled={isProjectArchived}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
      {showValidationPopup && (
        <ValidationPopUp
          isOpen={showValidationPopup}
          onClose={handleCloseValidationPopup}
          onConfirm={handleConfirmCancel}
          type="profile"
          message="Êtes-vous sûr de vouloir supprimer ce profil ?"
        />
      )}
    </Card>
  );
};
