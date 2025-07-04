import {
  ChevronRightIcon,
  LayoutGridIcon,
  PlusIcon,
  UserIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { projectService } from "../../services/project.service";
import { profileService } from "../../services/profile.service";
import { AddProjectModal } from "../modals/AddProjectModal";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUser } from "../../contexts/UserContext";

export const SidebarSection = ({
  isOpen = false,
  onClose = () => {},
  onRefreshNeeded = () => {},
}) => {
  const [expandedProject, setExpandedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectProfiles, setProjectProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [creationDateFilter, setCreationDateFilter] = useState("");
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoProject, setInfoProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const { user, loading } = useUser(); // Get user and loading from context
  const userRole = user.role; // Get role from context
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch projects with filters
  const fetchProjects = async (filters = {}) => {
    setIsLoading(true);
    try {
      const currentUserId = user.userId; // Get userId from context
      const currentUserRole = user.role; // Get user role from context
      const data = Object.keys(filters).length
        ? await projectService.getFilteredProjects(
            filters,
            currentUserId,
            currentUserRole
          )
        : await projectService.getAllProjects(currentUserId, currentUserRole);
      const currentProjectId = expandedProject;
      setProjects(
        data
          .filter((project) =>
            statusFilter === "Archiver"
              ? project.is_archived
              : !project.is_archived
          )
          .map((project) => ({
            ...project,
            isActive: project.id === currentProjectId,
          }))
      );
      // Set first project as active if exists
      if (data.length > 0) {
        setExpandedProject(data[0].id);
        setProjects((prev) =>
          prev.map((p, idx) => ({
            ...p,
            isActive: idx === 0,
          }))
        );
        // Fetch profiles for first project
        fetchProjectProfiles(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Only show the error if it's not a 403 (forbidden)
      if (error.response?.status !== 403) {
        showError("Failed to load projects");
      }
      // Optionally, you can clear projects if forbidden
      if (error.response?.status === 403) {
        setProjects([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch (corrigé pour éviter les boucles)
  useEffect(() => {
    if (!loading && user.userId && !hasFetched) {
      fetchProjects();
      setHasFetched(true);
    }
    // eslint-disable-next-line
  }, [loading, user.userId, hasFetched]);

  // Handle filter changes
  useEffect(() => {
    fetchProjects({
      status: statusFilter === "all" ? undefined : statusFilter,
      creationDate: creationDateFilter,
    });
    // eslint-disable-next-line
  }, [statusFilter, creationDateFilter]);

  // Fetch profiles for a specific project
  const fetchProjectProfiles = async (projectId) => {
    try {
      const profiles = await projectService.getProjectProfiles(projectId);
      setProjectProfiles((prev) => ({
        ...prev,
        [projectId]: profiles,
      }));
    } catch (error) {
      console.error(`Error fetching profiles for project ${projectId}:`, error);
      showError("Failed to load project profiles");
    }
  };

  const handleProjectClick = async (projectId) => {
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === projectId,
      }))
    );

    const newExpandedState = expandedProject === projectId ? null : projectId;
    setExpandedProject(newExpandedState);

    // Always fetch profiles to ensure they're up to date
    if (newExpandedState !== null) {
      await fetchProjectProfiles(projectId);
    }
  };

  const handleProfileClick = (profileId) => {
    setSelectedProfile(profileId);
    // Find the profile object to get its title
    let profileName = "";
    for (const profiles of Object.values(projectProfiles)) {
      const found = profiles.find((p) => p.id === profileId);
      if (found) {
        profileName = found.title || `ID ${profileId}`;
        break;
      }
    }
    navigate(`/profile/${profileId}`);
    showSuccess(`Vous avez sélectionné le profil ${profileName}`);
  };

  const handleAddProfile = async (projectId) => {
    try {
      // Create a new empty profile with just the project ID

      if (!projectId) {
        console.error("No project ID provided for new profile");
        showError("Aucun projet sélectionné pour le nouveau profil");
        return;
      }
      const response = await profileService.createProfile({
        fk_project: projectId,
        title: "New Profile", // Temporary title that will be updated when saved
      });

      // Add the new profile to the local state
      setProjectProfiles((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), response],
      }));

      // Navigate to the new profile's edit page
      navigate(`/profile/${response.id}`);
    } catch (error) {
      console.error("Error creating new profile:", error);
      showError("Failed to create new profile");
    }
  };

  // Helper to convert participants array to comma-separated string
  function prepareProjectFormData(formData) {
    return {
      ...formData,
      participants: Array.isArray(formData.participants)
        ? formData.participants.join(",")
        : formData.participants,
    };
  }

  // Modal component for project info
  function ProjectInfoModal({ open, onClose, project }) {
    if (!project) return null;
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[500px] p-8">
          <DialogHeader>
            <DialogTitle className="text-center font-['Montserrat'] text-2xl font-semibold">
              Project Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <div>
              <b>Title:</b> {project.title}
            </div>
            <div>
              <b>Description:</b> {project.description}
            </div>
            <div>
              <b>Department:</b> {project.department}
            </div>
            <div>
              <b>Status:</b> {project.status}
            </div>
            <div>
              <b>Creation Date:</b>{" "}
              {project.creation_date || project.creationDate}
            </div>
            <div>
              <b>Participants:</b> {project.participants}
            </div>
            <div>
              <b>Responsible (fk_user):</b> {project.fk_user}
            </div>
            {/* Add more fields as needed */}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectOpen || !!editProject}
        onClose={() => {
          setIsAddProjectOpen(false);
          setEditProject(null);
        }}
        onSubmit={async (formData) => {
          try {
            const preparedData = prepareProjectFormData(formData);
            if (editProject) {
              await projectService.updateProject(editProject.id, preparedData);
            } else {
              await projectService.createProject(preparedData);
            }
            setIsAddProjectOpen(false);
            setEditProject(null);
            showSuccess(
              editProject
                ? "Projet mis à jour avec succès"
                : "Projet créé avec succès"
            );
            onRefreshNeeded();
          } catch (err) {
            showError(
              editProject
                ? "Échec de la mise à jour du projet"
                : "Échec de la création du projet"
            );
          }
        }}
        project={editProject}
        onProjectDeleted={() => {
          fetchProjects();
          showSuccess("Projet supprimé avec succès");
          showInfo(
            "Tous les profils et offres d'emploi à l'intérieur de ce projet ont également été supprimés."
          );
        }}
      />

      {/* Project Info Modal */}
      <ProjectInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        project={infoProject}
      />

      <nav
        className={cn(
          "fixed top-[98px] w-[312px] h-[calc(100vh-98px)] border-r border-[#eae7e7] py-10 px-8 flex flex-col bg-white z-30 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Dashboard Button */}
        <div className="w-[242px] h-[39px] rounded-[10px] overflow-hidden flex items-center px-5 mb-6 hover:bg-[#ecf3ff] transition-colors duration-300 cursor-pointer">
          <LayoutGridIcon className="w-5 h-5 text-[#474444]" />
          <span className="ml-4 font-['Montserrat',Helvetica] font-medium text-[#474444] text-xs">
            Dashboard
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex flex-col">
            <span className="font-['Montserrat',Helvetica] font-medium text-[#444444] text-xs mb-1">
              Status
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[108px] h-[31px] rounded-[5px] border-[#cbc2c2] text-[11px] font-['Montserrat',Helvetica] font-normal">
                <SelectValue placeholder="In Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="En Cours">En Cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="En Attente">En Attente</SelectItem>
                <SelectItem value="Archiver">Archiver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <span className="font-['Montserrat',Helvetica] font-medium text-[#444444] text-xs mb-1">
              Creation Date
            </span>
            <Input
              type="date"
              value={creationDateFilter}
              onChange={(e) => setCreationDateFilter(e.target.value)}
              className="w-[100%] h-[31px] rounded-[5px] border-[#cbc2c2] text-[11px] font-['Montserrat',Helvetica] font-normal"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex flex-col space-y-2">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500">
              Loading projects...
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="relative">
                <div
                  className={cn(
                    "w-[242px] h-[39px] rounded-[10px] overflow-hidden flex items-center px-5 cursor-pointer transition-all duration-300",
                    project.isActive ? "bg-[#ecf3ff]" : "hover:bg-[#ecf3ff]/50"
                  )}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <img
                    className="w-5 h-5"
                    alt="Folder open"
                    src="/folder-open-24dp-1f1f1f-fill0-wght400-grad0-opsz24-1.svg"
                  />
                  <span
                    className={cn(
                      "ml-3 font-['Montserrat',Helvetica] font-medium text-xs",
                      project.isActive ? "text-[#21448a]" : "text-[#464444]"
                    )}
                  >
                    {project.title}
                    {project.is_archived && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded">
                        Archivé
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <ChevronRightIcon
                      className={cn(
                        "w-3 h-3 text-[#1f1f1f] transition-transform duration-300",
                        expandedProject === project.id
                          ? "transform rotate-90"
                          : ""
                      )}
                    />
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-full border border-[#214389] text-[#214389] bg-white hover:bg-[#ecf3ff] focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProject(project);
                      }}
                      title="Project Info"
                    >
                      !
                    </button>
                  </div>
                </div>

                {/* Profiles for Project */}
                {project.isActive && expandedProject === project.id && (
                  <div className="ml-12 mt-1 space-y-2">
                    {projectProfiles[project.id]?.map((profile) => (
                      <div
                        key={profile.id}
                        className={cn(
                          "w-[191px] h-9 rounded-[10px] overflow-hidden flex items-center px-5 cursor-pointer transition-colors duration-300",
                          selectedProfile === profile.id
                            ? "bg-[#ecf3ff]"
                            : "hover:bg-[#ecf3ff]/50"
                        )}
                        onClick={() => handleProfileClick(profile.id)}
                      >
                        <UserIcon className="w-[18px] h-[18px] text-[#1f1f1f]" />
                        <span
                          className={cn(
                            "ml-3 font-['Montserrat',Helvetica] font-medium text-xs",
                            selectedProfile === profile.id
                              ? "text-[#21448a]"
                              : "text-[#474444]"
                          )}
                        >
                          {profile.title}
                        </span>
                      </div>
                    ))}

                    {/* Add Profile Button - disabled if archived */}
                    {!project.is_archived && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProfile(project.id);
                        }}
                        className="w-[191px] h-9 rounded-[10px] overflow-hidden flex items-center px-5 cursor-pointer hover:bg-[#ecf3ff]/50 transition-colors duration-300"
                      >
                        <div className="relative w-5 h-[18px]">
                          <UserIcon className="w-[18px] h-[18px] text-[#1f1f1f]" />
                          <PlusIcon className="w-2 h-2 absolute top-1 left-3 text-[#1f1f1f]" />
                        </div>
                        <span className="ml-3 font-['Montserrat',Helvetica] font-medium text-[#474444] text-xs">
                          Add Profile
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Project Button */}
          <div className="w-[242px] h-[39px] mt-2">
            <div
              className={cn(
                "w-[242px] h-[39px] rounded-[10px] overflow-hidden flex items-center px-6 transition-colors duration-300",
                userRole === "recruteur"
                  ? "bg-gray-100 cursor-not-allowed opacity-50"
                  : "bg-[#ecf3ff78] cursor-pointer hover:bg-[#ecf3ff]"
              )}
              onClick={() => {
                if (userRole !== "recruteur") {
                  setIsAddProjectOpen(true);
                }
              }}
              title={
                userRole === "recruteur"
                  ? "Vous n'avez pas le droit de créer un projet"
                  : "Ajouter un nouveau projet"
              }
            >
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-[9px] flex items-center justify-center",
                  userRole === "recruteur" ? "bg-gray-400" : "bg-[#214389]"
                )}
              >
                <PlusIcon className="w-2.5 h-2.5 text-white" />
              </div>
              <span
                className={cn(
                  "ml-3 font-['Montserrat',Helvetica] font-medium text-xs",
                  userRole === "recruteur" ? "text-gray-500" : "text-[#474444]"
                )}
              >
                Add Project
              </span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
