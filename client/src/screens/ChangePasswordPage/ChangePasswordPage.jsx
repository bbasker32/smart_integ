import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { userService } from "../../services/user.service";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../hooks/useToast";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      showError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Use userId from localStorage if not available in context
      const userId = user.userId || localStorage.getItem("userId");
      await userService.changePassword(userId, newPassword);
      showSuccess("Password changed! Please log in again.");
      // Remove forceChangePassword flag and userId
      localStorage.removeItem("forceChangePassword");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      showError("Failed to change password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#214389] flex items-center justify-center p-4">
      {/* Decorative circles like login page */}

      {/* Centered form card */}
      <div className=" w-full flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-[#214389] text-2xl font-semibold mb-2">
              Change Password
            </h1>
            <p className="text-[#214389] text-lg font-medium mb-2">
              Welcome{user.firstName ? `, ${user.firstName}` : ""}!
            </p>
            <p className="text-[#666666] text-sm mb-2">
              Pour des raisons de sécurité, vous devez changer votre mot de
              passe avant d'accéder à la plateforme.
            </p>
            <p className="text-[#666666] text-sm">
              Please enter your new password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#333333]">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full h-[45px] px-4 rounded-md border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#214389] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#333333]">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full h-[45px] px-4 rounded-md border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#214389] focus:border-transparent transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-[45px] bg-[#214389] text-white rounded-md hover:bg-[#1a3571] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
