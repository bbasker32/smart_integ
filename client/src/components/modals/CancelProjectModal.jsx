import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ValidationPopUp } from "./ValidationPopUp";
import { projectService } from "../../services/project.service";
import { useToast } from "../../hooks/useToast";

export function CancelProjectModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const { showWarning } = useToast();

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      setShowValidation(false);
    }
  }, [isOpen, projectName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Reason for cancellation is required.");
      return;
    }
    setShowValidation(true);
  };

  const handleConfirm = async () => {
    setShowValidation(false);
    if (onSubmit) onSubmit(reason);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[400px] p-8">
          <DialogHeader>
            <DialogTitle className="text-center font-['Montserrat'] text-2xl font-semibold">
              Annulation
            </DialogTitle>
          </DialogHeader>
          {projectId && projectName && projectService && (
            <div className="mb-4 text-center text-sm text-gray-500">
              {/* Optionally, fetch project details to check if archived and show a message */}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="font-['Montserrat'] text-base font-semibold mb-2">
              Project Details
            </div>
            <div className="space-y-2">
              <label className="font-['Montserrat'] text-base">
                Project Name
              </label>
              <Input
                value={projectName || ""}
                disabled
                className="h-[40px] border-[#E0D4D4] font-['Montserrat'] text-sm placeholder:text-[#666666] bg-gray-100"
                placeholder="Project Name"
              />
            </div>
            <div className="space-y-2">
              <label className="font-['Montserrat'] text-base">
                Reason for Cancellation
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-[40px] border-[#E0D4D4] font-['Montserrat'] text-sm">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Projet similaire déjà en cours">
                    Projet similaire déjà en cours
                  </SelectItem>
                  <SelectItem value="Contraintes budgétaires">
                    Contraintes budgétaires
                  </SelectItem>
                  <SelectItem value="Non-pertinent ou plus nécessaire">
                    Non-pertinent ou plus nécessaire
                  </SelectItem>
                </SelectContent>
              </Select>
              {error && (
                <div className="text-red-500 text-xs mt-1">{error}</div>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-[180px] h-[42px] border-[#214389] text-[#214389] font-['Montserrat'] text-sm"
                onClick={() => {
                  showWarning(
                    "If you delete a project, all its profiles and job offers will also be deleted."
                  );
                  setShowValidation(true);
                }}
                disabled={/* Optionally, pass a prop or fetch project to check if archived */ false}
              >
                Annuler Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ValidationPopUp
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        onConfirm={handleConfirm}
        message={"Êtes-vous sûr de vouloir annuler le projet ?"}
      />
    </>
  );
}
