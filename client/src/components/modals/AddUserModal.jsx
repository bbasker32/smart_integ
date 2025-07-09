import { useState, useEffect } from "react";
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
import { useToast } from "../../hooks/useToast";

export function AddUserModal({
  isOpen,
  onClose,
  editMode = false,
  user = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (editMode && user) {
      setFormData({
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
        password: "",
        role: user.role || "",
      });
    } else {
      setFormData({ fullName: "", email: "", password: "", role: "" });
    }
  }, [editMode, user, isOpen]);

  const validate = () => {
    if (!formData.fullName.trim()) return "Le nom complet est requis.";
    if (!formData.email.trim()) return "L'email est requis.";
    if (!formData.role.trim()) return "Le rôle est requis.";
    if (!editMode && !formData.password.trim())
      return "Le mot de passe est requis.";
    // Simple email regex
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Email invalide.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      showError(error);
      return;
    }
    setLoading(true);
    try {
      const [firstName, ...lastArr] = formData.fullName.trim().split(" ");
      const lastName = lastArr.join(" ");
      if (editMode && user) {
        // Update user
        await userService.updateUser(user.id, {
          firstName,
          lastName,
          email: formData.email,
          role: formData.role,
          // Only send password if changed
          ...(formData.password ? { password: formData.password } : {}),
        });
        if (onSuccess) onSuccess();
      } else {
        // Create user
        await userService.createUser({
          firstName,
          lastName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          status: "active",
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showError("Erreur lors de la sauvegarde de l'utilisateur.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputStyles =
    "h-[40px] border-[#E0D4D4] font-['Montserrat'] text-sm placeholder:text-[#666666] focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[452px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center font-['Montserrat'] text-2xl font-semibold">
            {editMode ? "Modifier l'utilisateur" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="font-['Montserrat'] text-lg">Full Name</label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={inputStyles}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <label className="font-['Montserrat'] text-lg">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputStyles}
              placeholder="Enter email address"
              disabled={editMode}
            />
          </div>

          <div className="space-y-2">
            <label className="font-['Montserrat'] text-lg">Role</label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className={inputStyles}>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="recruteur">Recruteur</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-['Montserrat'] text-lg">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={inputStyles}
              placeholder={
                editMode ? "Laisser vide pour ne pas changer" : "Enter password"
              }
              required={!editMode}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[42px] bg-[#214389] hover:bg-[#214389]/90 text-white font-['Montserrat'] text-sm"
            disabled={loading}
          >
            {loading
              ? editMode
                ? "Modification..."
                : "Ajout..."
              : editMode
              ? "Modifier"
              : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
