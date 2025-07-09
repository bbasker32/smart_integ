import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye, EyeOff, Camera, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { userService } from "../../services/user.service";
import { useUser } from "../../contexts/UserContext";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "",
    avatar: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();
  const { user, updateUser } = useUser();

  useEffect(() => {
    loadUserData();
  }, []); // Remove user dependency to prevent form reset on every context change

  const loadUserData = async () => {
    try {
      // First, try to get user data from UserContext
      if (user.firstName || user.lastName) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          role: user.role || "",
          avatar: user.avatar || "",
          password: "",
        });
        return;
      }

      // Fallback to localStorage if UserContext doesn't have data
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setFormData({
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          email: parsedUser.email || "",
          phoneNumber: parsedUser.phoneNumber || "",
          role: parsedUser.role || "",
          avatar: parsedUser.avatar || "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showError("Erreur lors du chargement des données utilisateur");
    }
  };

  const refreshFormData = () => {
    // Refresh form data from current user context
    if (user.firstName || user.lastName) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        avatar: user.avatar || "",
        password: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom de famille est requis.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email invalide.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const userId = user.userId;
      const updateData = { ...formData };

      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }

      // Handle avatar upload if there's a preview
      if (avatarPreview) {
        const formData = new FormData();
        const file = fileInputRef.current.files[0];
        formData.append("avatar", file);

        const avatarResponse = await userService.uploadAvatar(formData);
        updateData.avatar = avatarResponse.avatarPath;
      }

      // Update user in database
      const response = await userService.updateUser(userId, updateData);

      // Update UserContext and localStorage with new data
      const updatedUserData = {
        ...user,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        avatar: updateData.avatar || formData.avatar,
      };

      // Update UserContext
      updateUser(updatedUserData);

      // Update form data with the new values
      setFormData((prev) => ({
        ...prev,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phoneNumber: updateData.phoneNumber,
        avatar: updateData.avatar || formData.avatar,
        password: "", // Clear password field
      }));

      showSuccess("Profil mis à jour avec succès");

      // Clear errors and avatar preview
      setErrors({});
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = (fieldName) => {
    const baseStyles =
      "h-[40px] border-[#E0D4D4] font-['Montserrat'] text-sm placeholder:text-[#666666] focus-visible:ring-0 focus-visible:ring-offset-0";
    const errorStyles = "border-red-500 focus-visible:ring-red-500";
    return `${baseStyles} ${errors[fieldName] ? errorStyles : ""}`;
  };

  // Avatar upload functions
  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Avatar clicked!"); // Debug log

    try {
      if (fileInputRef.current) {
        console.log("File input found, clicking..."); // Debug log
        fileInputRef.current.click();
      } else {
        console.log("File input ref not found"); // Debug log
      }
    } catch (error) {
      console.error("Error clicking file input:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Veuillez sélectionner une image valide");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelAvatarUpload = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "https://www.w3schools.com/howto/img_avatar.png";
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:5000${avatar}`; // Use your backend's base URL
  };

  return (
    <>
      <div className="py-4 md:py-6 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
          <h1 className="font-['Montserrat'] font-medium text-lg md:text-xl">
            Profile
          </h1>
          <div className="font-['Montserrat'] text-sm">Home &gt; Profile</div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        <div className="bg-white rounded-[5px] border border-[#eae7e7] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-['Montserrat',Helvetica] text-[#444444]">
              {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}{" "}
              Details
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-row gap-10 items-start">
              {/* Profile image and label */}
              <div className="flex flex-col items-center min-w-[180px]">
                <div
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <img
                    src={getAvatarUrl(avatarPreview || formData.avatar)}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-2 border-[#214389] object-cover transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1" />
                  </div>
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden mt-2 justify-center"
                />
                <div className="mt-3 text-lg font-semibold text-black font-['Montserrat']">
                  {formData.firstName} {formData.lastName}
                </div>
              </div>

              {/* Inputs */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      First Name
                      {errors.firstName && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter Your First Name"
                      className={inputStyles("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1 font-['Montserrat']">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      Last Name
                      {errors.lastName && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter Your Last Name"
                      className={inputStyles("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1 font-['Montserrat']">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      Email
                      {errors.email && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Your email"
                      className={inputStyles("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 font-['Montserrat']">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      Password
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Laisser vide pour ne pas changer"
                      className={inputStyles("password") + " pr-10"}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      Phone Number
                    </label>
                    <Input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter Your Phone Number"
                      className={inputStyles("phoneNumber")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700 font-['Montserrat']">
                      Role
                    </label>
                    <Input
                      type="text"
                      name="role"
                      value={formData.role}
                      disabled
                      className={
                        inputStyles("role") + " bg-gray-100 text-gray-700"
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    type="submit"
                    className="bg-[#214389] text-white font-['Montserrat'] text-sm hover:bg-[#214389]/90 h-[42px] px-16"
                    disabled={loading}
                  >
                    {loading ? "Mise à jour..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
