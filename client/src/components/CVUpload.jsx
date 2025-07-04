import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import api from '../services/api';

export default function CVUpload() {
  const { profileId } = useParams();
  const { user } = useUser();
  const [cvFile, setCvFile] = useState(null);
  const [profileTitle, setProfileTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profiles/${profileId}`);
        const profile = res.data;
        setProfileTitle(profile.title || 'Profil');
        const creationDate = profile.creationDate?.slice(0, 10) || profile.creation_date?.slice(0, 10);
        setCreatedAt(creationDate || new Date().toISOString().slice(0, 10));
        
        // Utiliser les informations du projet associé (maintenant incluses dans la réponse)
        if (profile.Project && profile.Project.title) {
          setProjectName(profile.Project.title);
        } else {
          setProjectName('Projet_Default');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil', err);
      }
    };

    fetchProfile();
  }, [profileId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setMessage('❌ Seuls les fichiers PDF sont acceptés.');
      setCvFile(null);
      e.target.value = '';
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) return setMessage('Veuillez choisir un fichier.');

    setIsUploading(true);
    setMessage('📤 Envoi en cours...');

    const formData = new FormData();
    formData.append('profileId', profileId);
    formData.append('profileTitle', profileTitle);
    formData.append('projectName', projectName);
    formData.append('createdAt', createdAt);
    formData.append('cv', cvFile);
    formData.append('recruiterEmail', user?.email);

    try {
      const res = await api.post('/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('✅ CV bien envoyé !');
    } catch (err) {
      console.error(err);
      setMessage('❌ Une erreur est survenue.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-extrabold mb-2 text-center text-blue-700">Déposer votre CV</h2>
      <p className="text-gray-500 text-center mb-6">Format PDF uniquement. Taille max : 5 Mo.</p>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Fichier CV (.pdf)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded-lg font-bold transition ${
            isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            "Envoyer mon CV"
          )}
        </button>
        {message && !isUploading && (
          <div
            className={`text-center mt-2 text-sm px-3 py-2 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-100 text-green-700'
                : message.includes('❌')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
