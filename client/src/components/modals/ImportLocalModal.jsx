import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UploadCloud, FileText, XCircle, RefreshCcw, CheckCircle } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { useToast } from '../../hooks/useToast';

export function ImportLocalModal({ isOpen, onClose, profileId, onCandidatesCreated }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [showCreateCandidatesButton, setShowCreateCandidatesButton] = useState(false);
  const [scrapeSensitiveInfo, setScrapeSensitiveInfo] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      name: file.name,
      status: 'Pending',
      progress: 0,
    }));
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    setShowCreateCandidatesButton(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      status: 'Pending',
      progress: 0,
    }));
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    e.target.value = null; // Clear the input so same file can be selected again
    setShowCreateCandidatesButton(false);
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    if (files.filter(f => f.status !== 'Pending').length === 1 && files[indexToRemove].status !== 'Pending') {
      setShowCreateCandidatesButton(false);
    }
  };

  const handlePrepareCandidates = () => {
    setFiles(prevFiles => prevFiles.map(f => ({
      ...f,
      status: f.status === 'Pending' ? 'ReadyToCreate' : f.status,
      progress: f.status === 'Pending' ? 100 : f.progress,
    })));
    setShowCreateCandidatesButton(true);
  };

  const handleCreateCandidates = async () => {
    if (!profileId) {
      console.error("Profile ID is not available for creation.");
      showError("Profile ID is not available for candidate creation. Please select a profile from the sidebar.");
      return;
    }

    const creationPromises = files.map(async (fileItem, index) => {
      if (fileItem.status === 'ReadyToCreate') {
        try {
          setFiles(prevFiles => prevFiles.map((f, i) => 
            i === index ? { ...f, status: 'Uploading' } : f
          ));
          // For createCandidate, we send candidateData (empty for now) and the file
          await candidateService.createCandidate({ fk_profile: profileId }, fileItem.file);
          setFiles(prevFiles => prevFiles.map((f, i) => 
            i === index ? { ...f, status: 'Success', progress: 100 } : f
          ));
          showSuccess(`${fileItem.name} created successfully!`);
        } catch (error) {
          console.error(`Error creating candidate from ${fileItem.name}:`, error);
          setFiles(prevFiles => prevFiles.map((f, i) => 
            i === index ? { ...f, status: 'Failed', progress: 0 } : f
          ));
          showError(`Failed to create ${fileItem.name}.`);
        }
      }
    });

    await Promise.all(creationPromises);
    if (onCandidatesCreated) {
      onCandidatesCreated();
    }
    // Optionally close modal or give feedback after all creations
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[562px] p-0 overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-center font-['Montserrat'] text-[25px] font-semibold uppercase">
            Upload File
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 ">
          <div
            className="flex flex-col items-center justify-between w-full bg-[#FCFAFA] border border-dashed border-[#CCBCBC] rounded-[5px] text-center p-6"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <UploadCloud size={80} className="text-[#B8ACAC] mb-6" />
            <p className="font-['Montserrat'] text-base font-medium uppercase text-black mb-2">
              Drag & Drop your file here
            </p>
            <p className="font-['Montserrat'] text-base font-medium uppercase text-black mb-6">or</p>
            <input
              type="file"
              webkitdirectory=""
              directory=""
              multiple=""
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={handleBrowseClick}
              className="bg-transparent text-black font-['Montserrat'] text-base font-medium uppercase border border-[#E0D4D4] h-[36px] px-6 py-2 rounded-[5px] hover:bg-transparent mb-0"
            >
              Browse to upload files
            </Button>
            <p className="font-['Montserrat'] text-[12px] font-medium uppercase text-black mt-auto">
              Only PDF, Excel and jpeg formats with size 200 MB
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
              <p className="font-['Montserrat'] text-sm font-semibold mb-2">Selected Files:</p>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'Pending' && <RefreshCcw size={16} className="text-blue-500" />}
                    {file.status === 'ReadyToCreate' && <CheckCircle size={16} className="text-green-500" />}
                    {file.status === 'Uploading' && (
                      <div className="flex items-center gap-1">
                        <RefreshCcw size={16} className="text-blue-500 animate-spin" />
                        <span>{file.progress}%</span>
                      </div>
                    )}
                    {file.status === 'Success' && <CheckCircle size={16} className="text-green-500" />}
                    {file.status === 'Failed' && <XCircle size={16} className="text-red-500" />}
                    <button onClick={() => handleRemoveFile(index)}>
                      <XCircle size={16} className="text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
          {!showCreateCandidatesButton && (files.length > 0 && files.every(f => f.status === 'Pending')) && (
            <Button
              onClick={handlePrepareCandidates}
              className="bg-[#214389] text-white font-['Montserrat'] text-base font-medium uppercase h-[36px] px-6 py-2 rounded-[5px] hover:bg-[#214389]/90"
              disabled={files.length === 0}
            >
              Prepare Candidates
            </Button>
          )}
          {showCreateCandidatesButton && (
            <div className="flex items-center gap-2">
              {/* <input
                type="checkbox"
                id="scrapeSensitiveInfo"
                checked={scrapeSensitiveInfo}
                onChange={(e) => setScrapeSensitiveInfo(e.target.checked)}
                className="h-4 w-4 text-[#214389] focus:ring-[#214389] border-gray-300 rounded"
              />
              <label htmlFor="scrapeSensitiveInfo" className="text-sm font-['Montserrat'] text-gray-700">
                Scrape Sensitive Information
              </label> */}
              <Button
                onClick={handleCreateCandidates}
                className="bg-green-600 text-white font-['Montserrat'] text-base font-medium uppercase h-[36px] px-6 py-2 rounded-[5px] hover:bg-green-700"
                disabled={files.length === 0 || !files.every(f => f.status === 'ReadyToCreate' || f.status === 'Success' || f.status === 'Failed')}
              >
                Create Candidates
              </Button>
            </div>
          )}
           <Button
            onClick={onClose}
            variant="outline"
            className="text-[#222] font-['Montserrat'] text-base font-medium uppercase border border-[#E0D4D4] h-[36px] px-6 py-2 rounded-[5px] hover:bg-transparent"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 