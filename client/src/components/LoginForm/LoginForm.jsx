import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useUser } from "../../contexts/UserContext";

export const LoginForm = ({
  title = "Sign In To Admin Pannel",
  subtitle = "Please Enter Your Details To Continue",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { setUserFromLogin } = useUser();

  // Rediriger l'utilisateur déjà connecté vers la page d'accueil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authService.login(formData);
      if (response.must_change_password) {
        // Store userId and forceChangePassword flag
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("forceChangePassword", "true");
        showSuccess(
          "Vous devez changer votre mot de passe avant de continuer."
        );
        navigate("/change-password");
        setLoading(false);
        return;
      }
      // Immediately update UserContext with login response data
      setUserFromLogin(response);
      showSuccess("Connexion réussie!");
      navigate("/");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Une erreur s'est produite lors de la connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#214389] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-[#214389] text-2xl font-semibold mb-2">
            {title}
          </h1>
          <p className="text-[#666666] text-sm">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#333333]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full h-[45px] px-4 rounded-md border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#214389] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#333333]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-[45px] px-4 pr-12 rounded-md border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#214389] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[45px] bg-[#214389] text-white rounded-md hover:bg-[#1a3571] transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};
