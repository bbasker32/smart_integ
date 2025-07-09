import {
  PencilIcon,
  CopyIcon,
  ArrowRightCircle,
  ArrowLeftCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
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
import { publicationService } from "../../../services/publication.service";
import { jobPostingService } from "../../../services/jobPosting.service";
import { profileService } from "../../../services/profile.service";
import { projectService } from "../../../services/project.service";
import { useToast } from "../../../hooks/useToast";

export const PublicationSection = () => {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const { showSuccess, showError, showPersistentWarning, dismissToast } =
    useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [platformPreviews, setPlatformPreviews] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("french");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [langue, setLangue] = useState("français");
  const [ton, setTon] = useState("professionnel");
  const [longueur, setLongueur] = useState("moyen");
  const [emojis, setEmojis] = useState("oui");
  const [isGeneralDescriptionHidden, setIsGeneralDescriptionHidden] =
    useState(false);
  const [activeTab, setActiveTab] = useState("publication");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [persistentToastId, setPersistentToastId] = useState(null);
  const [isPlatformDescriptionHidden, setIsPlatformDescriptionHidden] =
    useState(false);
  // Add state for defaultTab
  const [defaultTab, setDefaultTab] = useState("publication");

  // Project related fields for top row
  const [projectData, setProjectData] = useState({
    projectServices: "",
    projectResp: "",
    projectStatus: "",
  });
  // Lecture seule si projet archivé
  const [isProjectArchived, setIsProjectArchived] = useState(false);

  // Fetch profile and project data when component mounts
  useEffect(() => {
    const fetchProfileAndProjectData = async () => {
      if (!profileId) return;

      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile(profileId);

        // If profile has a project ID, fetch project data
        if (profileData.fk_project) {
          const projectData = await projectService.getProject(
            profileData.fk_project
          );
          setProjectData({
            projectServices: projectData.department || "",
            projectResp: projectData.User
              ? `${projectData.User.firstName} ${projectData.User.lastName}`.trim()
              : projectData.resp || "",
            projectStatus: projectData.status || "",
          });
          setIsProjectArchived(!!projectData.is_archived);
          // Set default tab based on status
          setDefaultTab(profileData.status || "publication");
        } else {
          setIsProjectArchived(false);
          setDefaultTab(profileData.status || "publication");
        }
      } catch (error) {
        console.error("Error fetching profile/project data:", error);
        showError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndProjectData();
  }, [profileId]);

  // Fetch existing job offer and platform descriptions when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [jobOffer, allPostings] = await Promise.all([
          publicationService.getJobOffer(profileId),
          jobPostingService.getAllPostings(),
        ]);

        if (jobOffer && jobOffer.description) {
          setJobDescription(jobOffer.description);
        }

        // Find postings for this profile's jobOfferId
        const jobOfferId = jobOffer?.id;
        if (jobOfferId) {
          const linkedinPosting = allPostings.find(
            (p) => p.fk_JobOffer === jobOfferId && p.plateform === "linkedin"
          );
          const indeedPosting = allPostings.find(
            (p) => p.fk_JobOffer === jobOfferId && p.plateform === "indeed"
          );
          setPlatformPreviews({
            linkedin: linkedinPosting?.description || "",
            indeed: indeedPosting?.description || "",
          });
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          showError("Failed to fetch existing descriptions");
        }
      }
    };

    if (profileId) {
      fetchInitialData();
    }
  }, [profileId]);

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
  };

  const handlePreviewGenerate = async () => {
    if (!jobDescription) {
      showError("Please generate or write the main description first");
      return;
    }
    try {
      setIsLoadingPreview(true);
      const options = {
        langue,
        ton,
        longueur,
        emojis,
      };
      console.log("Generating preview for platform:", selectedPlatform);
      console.log("Options:", options);

      if (selectedPlatform === "all") {
        const allPreviews = await publicationService.getAllPlatformPreviews(
          profileId,
          options
        );
        console.log("All previews response:", allPreviews);
        setPlatformPreviews((prev) => ({
          ...prev,
          linkedin: allPreviews.linkedin,
          indeed: allPreviews.indeed,
        }));
      } else {
        const result = await publicationService.generatePlatformPreview(
          profileId,
          selectedPlatform,
          options
        );
        console.log("Single platform response:", result);
        console.log("Platform key:", selectedPlatform.toLowerCase());

        setPlatformPreviews((prev) => {
          const updated = {
            ...prev,
            [selectedPlatform.toLowerCase()]:
              result.preview || result.description || result,
          };
          console.log("Updated platformPreviews:", updated);
          return updated;
        });
      }
      showSuccess("Preview generated successfully");
    } catch (error) {
      console.error("Error generating preview:", error);
      showError(error.response?.data?.error || "Failed to generate preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Fetch existing job offer when component mounts
  useEffect(() => {
    const fetchJobOffer = async () => {
      try {
        const offer = await publicationService.getJobOffer(profileId);
        if (offer && offer.description) {
          setJobDescription(offer.description);
        }
      } catch (error) {
        // Don't show error if job offer doesn't exist yet
        if (error.response?.status !== 404) {
          showError("Failed to fetch existing job description");
        }
      }
    };

    if (profileId) {
      fetchJobOffer();
    }
  }, [profileId]);

  const handleTabChange = async (value) => {
    if (profileId) {
      try {
        await profileService.setProfileStatus(profileId, value);
      } catch (e) {
        // Optionally handle error
      }
    }
    setActiveTab(value);
    if (value === "profile") {
      navigate(`/profile/${profileId}`);
    } else if (value === "publication") {
      navigate(`/profile/${profileId}/publication`);
    } else if (value === "candidate") {
      navigate(`/profile/${profileId}/candidate`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedLanguage) {
      showError("Please select a language first");
      return;
    }

    try {
      setIsGenerating(true);
      const result = await publicationService.generateClassicDescription(
        profileId,
        selectedLanguage
      );
      if (result.preview) {
        setJobDescription(result.preview);
        showSuccess("General Description generated successfully");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      showError(
        error.response?.data?.error || "Failed to generate description"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!jobDescription.trim()) {
      showError("Please generate or write a description first");
      return;
    }

    try {
      setIsExporting(true);
      await publicationService.exportDescription(profileId, jobDescription);
      showSuccess("Description exported successfully");
    } catch (error) {
      console.error("Error exporting description:", error);
      showError(error.response?.data?.error || "Failed to export description");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to get jobOfferId for a profile
  const getJobOfferId = async (profileId) => {
    const jobOffer = await publicationService.getJobOffer(profileId);
    return jobOffer?.id;
  };
  const handleSavePlatformDescription = async () => {
    try {
      setIsExporting(true);
      const jobOfferId = await getJobOfferId(profileId);
      if (!jobOfferId) throw new Error("No job offer found for this profile");
      console.log("selectedPlatform", selectedPlatform);
      if (selectedPlatform === "all") {
        await Promise.all([
          jobPostingService.savePlatformDescription(
            jobOfferId,
            "linkedin",
            platformPreviews.linkedin || ""
          ),
          jobPostingService.savePlatformDescription(
            jobOfferId,
            "indeed",
            platformPreviews.indeed || ""
          ),
        ]);
      } else {
        await jobPostingService.savePlatformDescription(
          jobOfferId,
          selectedPlatform,
          platformPreviews[selectedPlatform] || ""
        );
      }
      showSuccess("Platform description saved!");
    } catch (error) {
      showError(error.message || "Failed to save platform description");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublish = async () => {
    try {
      // Use the LinkedIn platform preview as the description
      const platformDescription = platformPreviews.linkedin;
      // Get the URL from your URL input state (assuming you have a state variable for it)
      // If not, you need to add a state for the URL input
      if (!platformDescription || !url) {
        showError("Please provide both a LinkedIn description and a URL.");
        return;
      }
      const response = await fetch("/api/publications/linkedin-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: platformDescription,
          url: url,
          profileId: profileId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || "Failed to trigger LinkedIn automation.");
        return;
      }

      showSuccess(
        "✅ LinkedIn post script launched. Your browser should open."
      );
    } catch (err) {
      console.error("❌ Error:", err);
      showError("Failed to trigger LinkedIn automation.");
    }
  };

  const handleConfirmCancel = async () => {
    try {
      if (profileId) {
        await profileService.deleteProfile(profileId);
        showSuccess("Profil supprimé avec succès");
        setShowValidationPopup(false);
        dismissToast(persistentToastId);
        navigate("/profile");
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

  const mainTabs = [
    { value: "profile", label: "Profile" },
    { value: "publication", label: "Publication" },
    { value: "candidate", label: "Candidate" },
    { value: "entretien", label: "Entretien" },
    { value: "contrat", label: "Contrat" },
  ];

  return (
    <Card className="w-full max-w-[1067px] mx-auto rounded-[5px] border border-[#EAE7E7]">
      <CardContent className="p-4 md:p-6 relative">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-[#214389]">Loading publication data...</div>
          </div>
        ) : (
          <>
            {isProjectArchived && (
              <div className="text-blue-600 text-center mb-2">
                Ce profil appartient à un projet archivé et la publication n'est
                plus modifiable.
              </div>
            )}
            {/* Top row inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Services
                </label>
                <Input
                  value={projectData.projectServices}
                  disabled
                  className="h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Resp
                </label>
                <Input
                  value={projectData.projectResp}
                  disabled
                  className="h-10 border-[#dfd4d4] font-['Montserrat',Helvetica] text-sm text-[#666666] bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-['Montserrat',Helvetica] text-base md:text-lg tracking-[0.10px] leading-6">
                  Status
                </label>
                <Select value={projectData.projectStatus} disabled>
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
            <div className="mb-8">
              <CustomTabs
                tabs={mainTabs}
                defaultValue={defaultTab}
                onValueChange={handleTabChange}
              />
            </div>
            {/* Main Content Grid */}
            <div
              className={`grid gap-x-2 ${
                isGeneralDescriptionHidden || isPlatformDescriptionHidden
                  ? "grid-cols-1"
                  : "grid-cols-[1fr_auto_1fr]"
              }`}
            >
              {/* Left Column: General Description */}
              {!isGeneralDescriptionHidden && (
                <div className="relative">
                  {/* Restore platform description arrow */}
                  {isPlatformDescriptionHidden &&
                    activeTab === "publication" && (
                      <div className="absolute -right-7 top-1/2 -translate-y-1/2 z-20 group">
                        <span className="absolute right-1/2 translate-x-1/2 bottom-full mb-2 bg-[#214389] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                          show platform description
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsPlatformDescriptionHidden(false)}
                          style={{ borderRadius: "50%" }}
                        >
                          <ArrowLeftCircle className="h-8 w-8 text-[#214389]" />
                        </Button>
                      </div>
                    )}
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-['Montserrat'] text-[18px] text-black">
                      Description de poste
                    </label>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                        disabled={isProjectArchived}
                      >
                        <SelectTrigger className="w-[150px] h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        className="h-10 px-4 border-[#E0D4D4] font-['Montserrat'] text-[14px]"
                        onClick={handleGenerate}
                        disabled={isGenerating || isProjectArchived}
                      >
                        {isGenerating ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Job Description"
                      className="min-h-[500px] w-full border border-[#E0D4D4] rounded-md font-['Montserrat'] text-[14px] text-[#666666] resize-none p-3"
                      disabled={isProjectArchived}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 p-0 hover:bg-transparent"
                      disabled={isProjectArchived}
                    >
                      <PencilIcon className="h-4 w-4 text-[#214389]" />
                    </Button>
                  </div>
                  <div className="mt-4 flex justify-start">
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-[#E0D4D4] font-['Montserrat'] text-[14px]"
                      onClick={handleExport}
                      disabled={
                        isExporting ||
                        !jobDescription.trim() ||
                        isProjectArchived
                      }
                    >
                      {isExporting ? "Saving..." : "Save Description"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Middle Column: Arrow Toggles (only when both columns are visible) */}
              {!isGeneralDescriptionHidden &&
                !isPlatformDescriptionHidden &&
                activeTab === "publication" && (
                  <div className="flex flex-col items-center justify-center gap-4">
                    {/* Hide general description (left arrow) */}
                    <div className="group relative inline-block mb-2">
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#214389] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        hide general description
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsGeneralDescriptionHidden(true)}
                        style={{ borderRadius: "50%" }}
                      >
                        <ArrowLeftCircle className="h-8 w-8 text-[#214389]" />
                      </Button>
                    </div>
                    {/* Hide platform description (right arrow) */}
                    <div className="group relative inline-block">
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#214389] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        hide platform description
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPlatformDescriptionHidden(true)}
                        style={{ borderRadius: "50%" }}
                      >
                        <ArrowRightCircle className="h-8 w-8 text-[#214389]" />
                      </Button>
                    </div>
                  </div>
                )}

              {/* Right Column: Platform Description */}
              {!isPlatformDescriptionHidden && (
                <div className="relative space-y-6 min-h-[500px]">
                  {/* Restore general description arrow */}
                  {isGeneralDescriptionHidden &&
                    activeTab === "publication" && (
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 z-20 group">
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#214389] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                          show general description
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsGeneralDescriptionHidden(false)}
                          style={{ borderRadius: "50%" }}
                        >
                          <ArrowRightCircle className="h-8 w-8 text-[#214389]" />
                        </Button>
                      </div>
                    )}
                  {/* Plateforme Section */}
                  <div>
                    <label className="block font-['Montserrat'] text-[18px] mb-2 text-black">
                      Plateforme:
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <Select
                          value={selectedPlatform}
                          onValueChange={handlePlatformChange}
                          disabled={isProjectArchived}
                        >
                          <SelectTrigger className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                            <SelectValue placeholder="Select Platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="indeed">Indeed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        className="h-10 px-4 border-[#E0D4D4] font-['Montserrat'] text-[14px]"
                        onClick={handlePreviewGenerate}
                        disabled={
                          isLoadingPreview ||
                          !jobDescription.trim() ||
                          isProjectArchived
                        }
                      >
                        {isLoadingPreview ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                    {/* Platform Options */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div>
                        <label className="font-medium">
                          Langue de sortie :
                        </label>
                        <Select
                          value={langue}
                          onValueChange={setLangue}
                          disabled={isProjectArchived}
                        >
                          <SelectTrigger className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                            <SelectValue placeholder="Langue de sortie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="français">Français</SelectItem>
                            <SelectItem value="anglais">Anglais</SelectItem>
                            <SelectItem value="espagnol">Espagnol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="font-medium">Ton souhaité :</label>
                        <Select
                          value={ton}
                          onValueChange={setTon}
                          disabled={isProjectArchived}
                        >
                          <SelectTrigger className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                            <SelectValue placeholder="Ton souhaité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professionnel">
                              Professionnel
                            </SelectItem>
                            <SelectItem value="amical">Amical</SelectItem>
                            <SelectItem value="motivant">Motivant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="font-medium">
                          Longueur maximale :
                        </label>
                        <Select
                          value={longueur}
                          onValueChange={setLongueur}
                          disabled={isProjectArchived}
                        >
                          <SelectTrigger className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                            <SelectValue placeholder="Longueur maximale" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="petit">Petit</SelectItem>
                            <SelectItem value="moyen">Moyen</SelectItem>
                            <SelectItem value="grand">Grand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(selectedPlatform === "linkedin" ||
                        selectedPlatform === "all") && (
                        <div>
                          <label className="font-medium">Émojis :</label>
                          <Select
                            value={emojis}
                            onValueChange={setEmojis}
                            disabled={isProjectArchived}
                          >
                            <SelectTrigger className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px]">
                              <SelectValue placeholder="Émojis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oui">Oui</SelectItem>
                              <SelectItem value="non">Non</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Platform Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 h-10 rounded-md ${
                        selectedPlatform === "linkedin"
                          ? "bg-[#21448A] text-white"
                          : "border border-[#21448A] text-[#21448A] bg-white"
                      }`}
                      onClick={() => setSelectedPlatform("linkedin")}
                      disabled={isProjectArchived}
                    >
                      LinkedIn
                    </Button>
                    <Button
                      className={`flex-1 h-10 rounded-md ${
                        selectedPlatform === "indeed"
                          ? "bg-[#21448A] text-white"
                          : "border border-[#21448A] text-[#21448A] bg-white"
                      }`}
                      onClick={() => setSelectedPlatform("indeed")}
                      disabled={isProjectArchived}
                    >
                      Indeed
                    </Button>
                  </div>

                  {/* Value Input Field */}
                  <div className="relative">
                    <Textarea
                      value={
                        selectedPlatform === "all"
                          ? `LINKEDIN PREVIEW:\n\n${
                              platformPreviews.linkedin || ""
                            }\n\n-------------------\n\nINDEED PREVIEW:\n\n${
                              platformPreviews.indeed || ""
                            }`
                          : platformPreviews[selectedPlatform] || ""
                      }
                      onChange={(e) => {
                        if (selectedPlatform !== "all") {
                          setPlatformPreviews((prev) => ({
                            ...prev,
                            [selectedPlatform]: e.target.value,
                          }));
                        }
                      }}
                      placeholder={`${
                        selectedPlatform === "all"
                          ? "Platform previews"
                          : selectedPlatform
                      } preview will appear here`}
                      className="w-full min-h-[300px] border-[#E0D4D4] font-['Montserrat'] text-[14px] text-[#666666] resize-none p-3"
                      disabled={isProjectArchived}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 p-0 hover:bg-transparent"
                      disabled={isProjectArchived}
                    >
                      <PencilIcon className="h-4 w-4 text-[#214389]" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-[#E0D4D4] font-['Montserrat'] text-[14px] mt-2"
                      onClick={handleSavePlatformDescription}
                      disabled={isExporting || isProjectArchived}
                    >
                      {isExporting
                        ? "Saving..."
                        : "Save " +
                          (selectedPlatform === "all"
                            ? "all"
                            : selectedPlatform) +
                          " description"}
                    </Button>
                  </div>

                  {/* URL Section */}
                  <div>
                    <label className="block font-['Montserrat'] text-[18px] mb-2 text-black">
                      URL:
                    </label>
                    <div className="relative">
                      <Input
                        className="w-full h-10 border-[#E0D4D4] font-['Montserrat'] text-[14px] text-[#666666] pr-10"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isProjectArchived}
                      />
                      <Button
                        variant="ghost"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0 h-auto hover:bg-transparent"
                        disabled={isProjectArchived}
                      >
                        <CopyIcon className="h-4 w-4 text-[#214389]" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="mt-8 flex justify-between items-center w-full">
                    <div className="flex gap-4">
                      <Button
                        className="bg-[#214389] text-white hover:bg-[#214389]/90"
                        onClick={handlePublish}
                        disabled={isProjectArchived}
                      >
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-between items-center w-full">
              <Button
                className="bg-[#214389] text-white hover:bg-[#214389]/90"
                onClick={() => navigate(`/profile/${profileId}`)}
                disabled={isProjectArchived}
              >
                Back
              </Button>
              <Button
                className="bg-[#214389] text-white hover:bg-[#214389]/90"
                onClick={() => handleTabChange("candidate")}
                disabled={isProjectArchived}
              >
                Next
              </Button>
            </div>
          </>
        )}
        {showValidationPopup && (
          <ValidationPopUp
            isOpen={showValidationPopup}
            onClose={handleCloseValidationPopup}
            onConfirm={handleConfirmCancel}
            type="profile"
            message="Êtes-vous sûr de vouloir supprimer ce profil ?"
          />
        )}
      </CardContent>
    </Card>
  );
};
