import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { userService } from "../../services/user.service";
import { CancelProjectModal } from "./CancelProjectModal";
import { projectService } from "../../services/project.service";

// Get user role from localStorage
const getUserRole = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      return JSON.parse(user).role || "";
    } catch {
      return "";
    }
  }
  return "";
};

export function AddProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  onProjectDeleted,
}) {
  const [formData, setFormData] = useState({
    title: "",
    department: "RH",
    status: "en cours",
    startDate: "",
    endDate: "",
    resp: "",
    participants: [],
    description: "",
  });
  const [users, setUsers] = useState([]);
  const [showParticipantsDropdown, setShowParticipantsDropdown] =
    useState(false);
  const [errors, setErrors] = useState({});
  const participantsInputRef = useRef(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const userRole = getUserRole();

  // Helper to determine if we are editing
  const isEditMode = !!project;
  // Lecture seule si archivé
  const isReadOnly = isEditMode && project?.is_archived;

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title || "",
        department: project.department || "",
        status: project.status,
        startDate: project.startDate
          ? project.startDate.slice(0, 10)
          : project.creation_date
          ? project.creation_date.slice(0, 10)
          : "",
        endDate: project.endDate ? project.endDate.slice(0, 10) : "",
        resp: project.fk_user ? String(project.fk_user) : "",
        participants: project.participants
          ? typeof project.participants === "string"
            ? project.participants.split(",").map(Number)
            : Array.isArray(project.participants)
            ? project.participants
            : []
          : [],
        description: project.description || "",
      });
    } else if (!isOpen) {
      setFormData({
        title: "",
        department: "",
        status: "En Cours",
        startDate: "",
        endDate: "",
        resp: "",
        participants: [],
        description: "",
      });
    }
    setErrors({});
  }, [isOpen, project]);

  useEffect(() => {
    if (isOpen) {
      userService.getAllUsers().then(setUsers);
    }
  }, [isOpen]);

  useEffect(() => {
    // Synchroniser le champ 'resp' dès que les utilisateurs sont chargés et que le projet est en mode édition
    if (
      isOpen &&
      isEditMode &&
      users.length > 0 &&
      project &&
      !formData.resp &&
      project.fk_user
    ) {
      setFormData((prev) => ({
        ...prev,
        resp: String(project.fk_user),
      }));
    }
  }, [users, isOpen, isEditMode, project, formData.resp]);

  const inputStyles =
    "h-[40px] border-[#E0D4D4] font-['Montserrat'] text-sm placeholder:text-[#666666] focus-visible:ring-0 focus-visible:ring-offset-0";

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Intitule est requis.";
    if (!formData.department) newErrors.department = "Service est requis.";
    if (!formData.startDate) newErrors.startDate = "Date debut est requis.";
    if (!formData.endDate) newErrors.endDate = "Date fin est requis.";
    if (!formData.resp) newErrors.resp = "Responsable est requis.";
    if (!formData.description.trim())
      newErrors.description = "Description est requis.";
    if (!formData.participants || formData.participants.length === 0)
      newErrors.participants = "Au moins un participant est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) onSubmit(formData);
    onClose();
  };

  const handleRemoveParticipant = (userId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((id) => id !== userId),
    }));
  };

  const handleParticipantsInputClick = () => {
    setShowParticipantsDropdown((prev) => !prev);
  };

  const handleSelectParticipant = (userId) => {
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, userId],
    }));
    setShowParticipantsDropdown(false);
  };

  const handleCancelProject = async (reason) => {
    setShowCancelModal(false);
    if (project && project.id) {
      await projectService.deleteProject(project.id);
      if (onProjectDeleted) onProjectDeleted();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-center font-['Montserrat'] text-2xl font-semibold">
            Information de Projet
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isReadOnly && (
            <div className="text-blue-600 text-center mb-2">
              Ce projet est archivé et ne peut plus être modifié.
            </div>
          )}
          {userRole === "recruteur" && (
            <div className="text-red-500 text-center">
              Vous n'avez pas le droit de créer, modifier ou annuler un projet.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">
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
                className={inputStyles}
                placeholder="Intitule"
                disabled={userRole === "recruteur" || isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">Service</label>
                {errors.department && (
                  <span className="text-red-500 text-xs">
                    {errors.department}
                  </span>
                )}
              </div>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
                disabled={userRole === "recruteur" || isReadOnly}
              >
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder="department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">Statut</label>
              </div>
              {isEditMode ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={userRole === "recruteur" || isReadOnly}
                >
                  <SelectTrigger className={inputStyles}>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Cours">En Cours</SelectItem>
                    <SelectItem value="Terminé">Terminé</SelectItem>
                    <SelectItem value="En Attente">En Attente</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name="status"
                  value={formData.status}
                  className={inputStyles}
                  disabled
                />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">
                  Date debut
                </label>
                {errors.startDate && (
                  <span className="text-red-500 text-xs">
                    {errors.startDate}
                  </span>
                )}
              </div>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={inputStyles}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">
                  Date fin
                </label>
                {errors.endDate && (
                  <span className="text-red-500 text-xs">{errors.endDate}</span>
                )}
              </div>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={inputStyles}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-['Montserrat'] text-base">
                  Responsible
                </label>
                {errors.resp && (
                  <span className="text-red-500 text-xs">{errors.resp}</span>
                )}
              </div>
              <Select
                value={formData.resp}
                onValueChange={(value) => handleSelectChange("resp", value)}
                disabled={userRole === "recruteur" || isReadOnly}
              >
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-['Montserrat'] text-base">
                Participants
              </label>
              {errors.participants && (
                <span className="text-red-500 text-xs">
                  {errors.participants}
                </span>
              )}
            </div>
            <div className="relative">
              <div
                ref={participantsInputRef}
                className="flex flex-wrap gap-2 min-h-[40px] border border-[#E0D4D4] rounded px-2 py-1 bg-white cursor-pointer"
                onClick={isReadOnly ? undefined : handleParticipantsInputClick}
                tabIndex={0}
                style={
                  isReadOnly ? { pointerEvents: "none", opacity: 0.6 } : {}
                }
              >
                {formData.participants.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  if (!user) return null;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 rounded px-2 py-1 bg-[#ecf3ff]"
                    >
                      <img
                        src="/avatar.png"
                        alt={user.firstName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs">
                        {user.firstName} {user.lastName}
                      </span>
                      <span
                        className="ml-1 text-[#214389] cursor-pointer"
                        onClick={(e) => {
                          if (isReadOnly) return;
                          e.stopPropagation();
                          handleRemoveParticipant(user.id);
                        }}
                        style={
                          isReadOnly
                            ? { pointerEvents: "none", opacity: 0.6 }
                            : {}
                        }
                      >
                        ×
                      </span>
                    </div>
                  );
                })}
                <span className="text-xs text-gray-400 select-none">
                  {formData.participants.length === 0 ? "Select users..." : ""}
                </span>
              </div>
              {showParticipantsDropdown && !isReadOnly && (
                <div className="absolute left-0 z-10 mt-1 w-full bg-white border border-[#E0D4D4] rounded shadow-lg max-h-48 overflow-auto">
                  {users.filter((u) => !formData.participants.includes(u.id))
                    .length === 0 ? (
                    <div className="p-2 text-xs text-gray-400">
                      No more users
                    </div>
                  ) : (
                    users
                      .filter((u) => !formData.participants.includes(u.id))
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-[#ecf3ff] cursor-pointer"
                          onClick={() => handleSelectParticipant(user.id)}
                        >
                          <img
                            src="/avatar.png"
                            alt={user.firstName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.email}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-['Montserrat'] text-base">
                Description
              </label>
              {errors.description && (
                <span className="text-red-500 text-xs">
                  {errors.description}
                </span>
              )}
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full min-h-[100px] border border-[#E0D4D4] rounded font-['Montserrat'] text-sm p-2"
              placeholder="Description"
              disabled={userRole === "recruteur" || isReadOnly}
            />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              type="submit"
              className="w-[180px] h-[42px] bg-[#214389] hover:bg-[#214389]/90 text-white font-['Montserrat'] text-sm"
              disabled={userRole === "recruteur" || isReadOnly}
            >
              {isEditMode ? "Modifier" : "Enregister"}
            </Button>
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                className="w-[180px] h-[42px] border-[#214389] text-[#214389] font-['Montserrat'] text-sm"
                disabled={userRole === "recruteur" || isReadOnly}
                onClick={() => setShowCancelModal(true)}
              >
                Annuler Project
              </Button>
            )}
          </div>
        </form>
        {/* Cancel Project Modal */}
        {isEditMode && (
          <CancelProjectModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            projectId={project.id}
            projectName={formData.title}
            onSubmit={handleCancelProject}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
