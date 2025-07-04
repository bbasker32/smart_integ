import React from "react";
import { LoginForm } from "../../components/LoginForm/LoginForm";

export const LoginPage = () => {
  const handleLogin = (formData) => {
    // Ici vous pouvez ajouter votre logique d'authentification
    console.log("Login attempt with:", formData);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Cercles décoratifs */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-[#3557A7] opacity-50 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#3557A7] opacity-50 blur-3xl" />
      
      {/* Formulaire de connexion */}
      <LoginForm 
        onSubmit={handleLogin}
        title="Sign In To Admin Pannel"
        subtitle="Please Enter Your Details To Continue"
      />
    </div>
  );
}; 