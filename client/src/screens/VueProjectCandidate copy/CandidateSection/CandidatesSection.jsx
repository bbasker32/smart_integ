import React, { useState, useEffect, useCallback } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CustomTabs } from '../../../components/custom-tabs/CustomTabs';
import { Input } from '../../../components/ui/input';
import { BadgeCheck, XCircle, FileText, X, SquareCheckBig, SquareX } from 'lucide-react';
import { CustomStyledTabs } from '../../../components/custom-tabs/CustomStyledTabs';
import { ImportLocalModal } from '../../../components/modals/ImportLocalModal';
import { useProfile } from '../../../contexts/ProfileContext';
import { candidateService } from '../../../services/candidateService';
import { useLoading } from '../../../hooks/useLoading';
import { Progress } from '../../../components/ui/progress';
import Pagination from '../../../components/ui/Pagination';
import { useToast } from "../../../hooks/useToast";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ModalLoading } from '../../../components/modals/ModalLoading';

export const CandidatesSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { profileId } = useParams();

  const [importTab, setImportTab] = useState('local');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailTab, setDetailTab] = useState('candidat');
  const [isImportLocalModalOpen, setIsImportLocalModalOpen] = useState(false);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [currentCVUrl, setCurrentCVUrl] = useState(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const { activeProfileId } = useProfile();
  const progress = useLoading(isLoadingCandidates);
  const [candidateStatus, setCandidateStatus] = useState({});
  const [loadingCandidateId, setLoadingCandidateId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const notDiscarded = candidates.filter(c => c.status !== 'discarded');
  const discarded = candidates.filter(c => c.status === 'discarded');
  const notDiscardedTotalPages = Math.max(1, Math.ceil(notDiscarded.length / pageSize));
  const totalPages = discarded.length > 0 ? notDiscardedTotalPages + 1 : notDiscardedTotalPages;

  let currentNotDiscarded = [];
  let currentDiscarded = [];
  if (currentPage < totalPages) {
    currentNotDiscarded = notDiscarded.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    currentDiscarded = [];
  } else {
    // Last page: show remaining notDiscarded and all discarded
    currentNotDiscarded = notDiscarded.slice((currentPage - 1) * pageSize);
    currentDiscarded = discarded;
  }

  // Filtrage des candidats selon la recherche
  const filteredNotDiscarded = currentNotDiscarded.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDiscarded = currentDiscarded.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const refreshCandidates = useCallback(async () => {

    if (profileId) {
      try {
        setIsLoadingCandidates(true);
        const fetchedCandidates = await candidateService.getTratedCandidatesByProfile(profileId);


        setCandidates(fetchedCandidates);
        if (fetchedCandidates.length > 0) {
          setSelectedCandidate(fetchedCandidates[0]);
        } else {
          setSelectedCandidate(null);
        }
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoadingCandidates(false);
      }
    }
  }, [profileId]);


  useEffect(() => {
    refreshCandidates();
  }, [refreshCandidates]);

  useEffect(() => {
    setCurrentPage(1);

  }, [profileId]);


  useEffect(() => {
    const total = notDiscarded.length;
    const newTotalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [candidates]);

  const mainTabs = [
    { value: "profile", label: "Profile" },
    { value: "publication", label: "Publication" },
    { value: "candidate", label: "Candidates" },
    { value: "entretien", label: "Entretien" },
    { value: "contrat", label: "Contrat" }
  ];


  const handleTabChange = async (value) => {
    if (profileId) {
      try {
        await profileService.setProfileStatus(profileId, value);
      } catch (e) {
        // Optionally handle error
      }
    }
    if (value === "publication") {
      navigate(`/profile/${profileId}/publication`);
    } else if (value === "candidate") {
      navigate(`/profile/${profileId}/candidate`);
    } else if (value === "entretien") {
      navigate(`/profile/${profileId}/entretien`);
    } else if (value === "contrat") {
      navigate(`/profile/${profileId}/contrat`);
    } else {
      navigate(`/profile/${profileId}`);
    }
  };
  const handleViewCV = async (e, candidateId) => {
    e.stopPropagation();
    try {
      const response = await candidateService.downloadCandidateCV(candidateId);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setCurrentCVUrl(url);
      setIsCVModalOpen(true);
    } catch (error) {
      console.error('Error loading CV:', error);
    }
  };

  const closeCVModal = () => {
    setIsCVModalOpen(false);
    if (currentCVUrl) {
      window.URL.revokeObjectURL(currentCVUrl);
      setCurrentCVUrl(null);
    }
  };

  const handleCheck = (id) => {
    setCandidateStatus((prev) => ({ ...prev, [id]: prev[id] === 'checked' ? undefined : 'checked' }));
  };

  const handleReject = async (candidateId, currentStatus) => {
    setLoadingCandidateId(candidateId);
    try {
      if (currentStatus === 'discarded') {
        showInfo('Ce candidat est déjà rejeté.');
        // return;
      }
      const newStatus = currentStatus === 'discarded' ? 'traited' : 'discarded';
      await candidateService.updateCandidate(candidateId, { status: newStatus });
      await refreshCandidates();
      if (newStatus === 'discarded') {
        setCurrentPage(Math.max(1, Math.ceil((notDiscarded.length) / pageSize + 1)));
        showWarning('Le candidat a été rejeté.');
      } else {
        showInfo('Le candidat a été remis en liste.');
      }
    } catch (error) {
      showError('Une erreur est survenue lors de la modification du statut.');
    } finally {
      setLoadingCandidateId(null);
    }
  };

  const handleValidate = async (candidateId, currentStatus) => {
    setLoadingCandidateId(candidateId);
    try {
      if (currentStatus === 'validated') {
        showInfo('Ce candidat est déjà validé.');
        // Tu peux return ici si tu ne veux pas toggler
        // return;
      }
      const newStatus = currentStatus === 'validated' ? 'traited' : 'validated';
      await candidateService.updateCandidate(candidateId, { status: newStatus });
      refreshCandidates();
      if (newStatus === 'validated') {
        showSuccess('Le candidat a été validé.');
      } else {
        showWarning('Le candidat a été remis en liste.');
      }
    } catch (error) {
      showError('Une erreur est survenue lors de la modification du statut.');
    } finally {
      setLoadingCandidateId(null);
    }
  };

  // Helper to reorder array
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    setIsLoadingCandidates(true);
    try {
      // Only reorder notDiscarded
      const start = (currentPage - 1) * pageSize;
      let pageSlice;
      if (currentPage < totalPages) {
        pageSlice = notDiscarded.slice(start, start + pageSize);
      } else {
        pageSlice = notDiscarded.slice(start);
      }
      const reordered = reorder(pageSlice, result.source.index, result.destination.index);
      // Update notDiscarded in candidates
      const newNotDiscarded = [...notDiscarded];
      for (let i = 0; i < reordered.length; i++) {
        newNotDiscarded[start + i] = reordered[i];
      }
      // Prepare manual_rank updates for all notDiscarded
      const candidatesWithRanks = newNotDiscarded.map((c, idx) => ({ id: c.id, manual_rank: idx + 1 }));
      await candidateService.updateCandidatesManualRanks(candidatesWithRanks);
      // Merge with discarded and update state for immediate feedback
      setCandidates([...newNotDiscarded, ...discarded]);
      // Refresh from backend to ensure order is correct
      await refreshCandidates();
      showSuccess('Classement des candidats mis à jour.');
    } catch (error) {
      showError('Erreur lors de la mise à jour du classement.');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  return (
    <div className="p-6 border border-[#EAE7E7] rounded-[5px]">
      <ModalLoading open={isLoadingCandidates} progress={progress} />

      {/* Main Tabs */}
      <div className="mb-8">
        <CustomTabs
          tabs={mainTabs}
          defaultValue="candidate"
          onValueChange={handleTabChange}
        />
      </div>

      {/* Import Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          className={`px-6 py-2 font-medium text-sm border-none focus:outline-none rounded-[10px] shadow-md ${importTab === 'local' ? 'bg-[#808080] text-[#222]' : 'bg-[#BDBDBD] text-[#222]'}`}
          onClick={() => setIsImportLocalModalOpen(true)}
        >
          Importation local
        </Button>

        {/* <Button

        <Button


      </div>

      {/* Champ de recherche global */}
      <div className="mb-4 flex justify-start">
        <Input
          type="text"
          placeholder="Rechercher par nom ou prénom..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full max-w-xs"
        />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-[1fr_2fr] gap-6 w-full">
        {/* Candidate Table */}
        <div>
          <div className="bg-white rounded-lg border border-gray-100 p-2">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="candidate-table">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {/* Header */}
                    <div className="flex w-full text-xs font-medium text-gray-600 tracking-wide border-b border-gray-200 bg-gray-200 rounded-t-md" style={{paddingTop: '8px', paddingBottom: '8px'}}>
                      <div className="w-12 py-2 px-3">Order</div>
                      <div className="flex-1 py-2 px-3">Nom Complet</div>
                      <div className="w-24 py-2 px-3">Score/10</div>
                      <div className="w-32 py-2 px-3">Type Importation</div>
                      <div className="w-28 py-2 px-3">Actions</div>
                    </div>
                    {/* Draggable notDiscarded candidates */}
                    {filteredNotDiscarded.map((candidate, index) => (
                      <Draggable key={candidate.id} draggableId={candidate.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex w-full items-center transition-colors cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-gray-50' : ''} hover:bg-gray-100 ${snapshot.isDragging ? 'ring-2 ring-blue-200' : ''}`}
                            style={{ height: '38px', ...provided.draggableProps.style }}
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            {/* Drag handle */}
                            <div
                              className="w-8 flex items-center justify-center cursor-grab select-none"
                              {...provided.dragHandleProps}
                              title="Drag to reorder"
                              onClick={e => e.stopPropagation()}
                            >
                              <span className="text-lg text-gray-400 select-none">≡</span>
                            </div>
                            <div className="w-12 py-1 px-2 text-sm text-gray-800 font-normal">{(currentPage - 1) * pageSize + index + 1}</div>
                            <div className="flex-1 py-1 px-2 text-sm text-gray-900 font-medium">{candidate.name}</div>
                            <div className="w-24 py-1 px-2 text-sm flex items-center gap-1">{candidate.score_value}/10</div>
                            <div className="w-32 py-1 px-2 text-sm text-gray-700">{candidate.type_importation || '-'}</div>
                            <div className="w-28 py-1 px-2">
                              <div className="flex items-center gap-2">
                                <button
                                  className={`p-1 rounded-full transition-colors ${candidate.status === 'validated' ? 'bg-green-50' : 'hover:bg-green-50'}`}
                                  title="Valider"
                                  onClick={e => { e.stopPropagation(); handleValidate(candidate.id, candidate.status); }}
                                  disabled={loadingCandidateId === candidate.id}
                                  style={{ lineHeight: 0 }}
                                >
                                  <SquareCheckBig size={18} className={candidate.status === 'validated' ? 'text-green-600' : 'text-gray-400'} />
                                </button>
                                <button
                                  className={`p-1 rounded-full transition-colors ${candidate.status === 'discarded' ? 'bg-red-50' : 'hover:bg-red-50'}`}
                                  title="Rejeter"
                                  onClick={e => { e.stopPropagation(); handleReject(candidate.id, candidate.status); }}
                                  disabled={loadingCandidateId === candidate.id}
                                  style={{ lineHeight: 0 }}
                                >
                                  <SquareX size={18} className={candidate.status === 'discarded' ? 'text-red-600' : 'text-gray-400'} />
                                </button>
                                <button
                                  onClick={e => handleViewCV(e, candidate.id)}
                                  className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 p-1 rounded-full transition-colors hover:bg-blue-50"
                                  title="Voir CV"
                                  style={{ lineHeight: 0 }}
                                >
                                  <FileText size={16} />
                                  <span className="text-xs font-medium">CV</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {/* Static discarded candidates on last page */}
                    {filteredDiscarded.map((candidate, index) => (
                      <div
                    key={candidate.id}
                        className={`flex w-full items-center transition-colors cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-gray-50' : ''} hover:bg-gray-100 opacity-60`}
                        style={{ height: '38px' }}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                        <div className="w-12 py-1 px-2 text-sm text-gray-800 font-normal">{notDiscarded.length + index + 1}</div>
                        <div className="flex-1 py-1 px-2 text-sm text-gray-900 font-medium">{candidate.name}</div>
                        <div className="w-24 py-1 px-2 text-sm flex items-center gap-1">{candidate.score_value}/10</div>
                        <div className="w-32 py-1 px-2 text-sm text-gray-700">{candidate.type_importation || '-'}</div>
                        <div className="w-28 py-1 px-2">
                      <div className="flex items-center gap-2">
                        <button
                              className={`p-1 rounded-full transition-colors ${candidate.status === 'validated' ? 'bg-green-50' : 'hover:bg-green-50'}`}
                          title="Valider"
                              onClick={e => { e.stopPropagation(); handleValidate(candidate.id, candidate.status); }}
                          disabled={loadingCandidateId === candidate.id}
                              style={{ lineHeight: 0 }}
                        >
                              <SquareCheckBig size={18} className={candidate.status === 'validated' ? 'text-green-600' : 'text-gray-400'} />
                        </button>
                        <button
                              className={`p-1 rounded-full transition-colors ${candidate.status === 'discarded' ? 'bg-red-50' : 'hover:bg-red-50'}`}
                          title="Rejeter"
                              onClick={e => { e.stopPropagation(); handleReject(candidate.id, candidate.status); }}
                          disabled={loadingCandidateId === candidate.id}
                              style={{ lineHeight: 0 }}
                        >
                              <SquareX size={18} className={candidate.status === 'discarded' ? 'text-red-600' : 'text-gray-400'} />
                        </button>
                        <button
                              onClick={e => handleViewCV(e, candidate.id)}
                              className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 p-1 rounded-full transition-colors hover:bg-blue-50"
                          title="Voir CV"
                              style={{ lineHeight: 0 }}
                        >
                              <FileText size={16} />
                          <span className="text-xs font-medium">CV</span>
                        </button>
                          </div>
                        </div>
                      </div>
                ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>

        {/* Candidate Detail */}
        <div>
        
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <CustomStyledTabs
              tabs={[
                { value: 'candidat', label: 'Candidat' },
                { value: 'experience', label: 'Experience' },
                { value: 'formation', label: 'Formation' },
                { value: 'competence', label: 'Compétence' },
                { value: 'resume', label: 'Resume' }
              ]}
              defaultValue="candidat"
              onValueChange={setDetailTab}
              className="w-full mb-4"
            />
            {detailTab === 'candidat' && selectedCandidate && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-900">{selectedCandidate.name}</span></p>
                    <p><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{selectedCandidate.email}</span></p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-900">{selectedCandidate.phone || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-900">{selectedCandidate.location || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700">Current Position:</span> <span className="text-gray-900">{selectedCandidate.current_position || 'N/A'}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-semibold text-gray-700">Years of Experience:</span> <span className="text-gray-900">{selectedCandidate.years_of_experience || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700">Status:</span> <span className="text-gray-900">{selectedCandidate.status}</span></p>
                    <p><span className="font-semibold text-gray-700">Score:</span> <span className="text-gray-900">{selectedCandidate.score_value}/10</span></p>
                    <p><span className="font-semibold text-gray-700">Creation Date:</span> <span className="text-gray-900">{new Date(selectedCandidate.creation_date).toLocaleDateString()}</span></p>
                    
                  </div>
                </div>
                {selectedCandidate.score_description && (
                  <div className="pt-2">
                    <span className="font-semibold text-gray-700">Score Description:</span>
                    <span className="text-gray-700 ml-2">{selectedCandidate.score_description}</span>
                  </div>
                )}
              </div>
            )}
            {detailTab === 'experience' && selectedCandidate && (
              <div className="space-y-4">
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.technical_skills?.split(',').map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">{skill.trim()}</span>
                    )) || <p className="text-gray-500">No technical skills available</p>}
                  </div>
                </div>
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.soft_skills?.split(',').map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">{skill.trim()}</span>
                    )) || <p className="text-gray-500">No soft skills available</p>}
                  </div>
                </div>
              </div>
            )}
            {detailTab === 'formation' && selectedCandidate && (
              <div className="space-y-4">
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Education</h3>

                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.education
                      ? selectedCandidate.education.split(',').map((formation, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                            {formation.trim()}
                          </span>
                        ))
                      : <p className="text-gray-500">No education information available</p>
                    }
                  </div>

                </div>
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.certifications?.split(',').map((cert, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">{cert.trim()}</span>
                    )) || <p className="text-gray-500">No certifications available</p>}
                  </div>
                </div>
              </div>
            )}
            {detailTab === 'competence' && selectedCandidate && (
              <div className="space-y-4">
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.languages?.split(',').map((lang, i) => (
                      <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">{lang.trim()}</span>
                    )) || <p className="text-gray-500">No languages available</p>}
                  </div>
                </div>
                <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                  <h3 className="font-semibold mb-2 text-gray-700">Hobbies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.hobbies?.split(',').map((hobby, i) => (
                      <span key={i} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-sm">{hobby.trim()}</span>
                    )) || <p className="text-gray-500">No hobbies available</p>}
                  </div>
                </div>
              </div>
            )}
            {detailTab === 'resume' && selectedCandidate && (
              <div className="h-40 w-full border rounded-md overflow-y-auto p-4">
                <h3 className="font-semibold mb-2 text-gray-700">CV Summary</h3>
                <p className="text-gray-700">{selectedCandidate.summary || 'No summary available'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV Modal */}
      {isCVModalOpen && currentCVUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Candidate CV</h3>
              <button
                onClick={closeCVModal}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <object
                data={currentCVUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Unable to display PDF file. 
                    <a 
                      href={currentCVUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 ml-1"
                    >
                      Download instead
                    </a>
                  </p>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}

      <ImportLocalModal
        isOpen={isImportLocalModalOpen}
        onClose={() => setIsImportLocalModalOpen(false)}

        profileId={profileId}

        onCandidatesCreated={refreshCandidates}
      />
    </div>
  );
}; 
