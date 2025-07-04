import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { XIcon } from 'lucide-react';
import { CustomTabs } from '../../../components/custom-tabs/CustomTabs';

const candidatesData = [
  { id: 1, name: 'Alea LARAKI', score: '95.0', cvScore: '8.8' },
  { id: 2, name: 'Alea LARAKI', score: '95.0', cvScore: '8.8' },
  { id: 3, name: 'Alea LARAKI', score: '95.0', cvScore: '8.8' },
  { id: 4, name: 'Alea LARAKI', score: '95.0', cvScore: '8.8' },
  { id: 5, name: 'Alea LARAKI', score: '95.0', cvScore: '8.8' },
];

const CandidateDetails = ({ candidate }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EAE7E7]">
      <div className="w-[50px] text-center">{candidate.id}</div>
      <div className="w-[200px]">{candidate.name}</div>
      <div className="w-[100px] text-center">{candidate.score}</div>
      <div className="w-[100px] text-center">{candidate.cvScore}</div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs border-[#E02226] text-[#E02226] hover:bg-[#E02226] hover:text-white"
        >
          <XIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-4 text-xs bg-[#F5F5F5] border-none hover:bg-[#E0E0E0]"
        >
          CV
        </Button>
      </div>
    </div>
  );
};

export const CandidatesSection = () => {
  const [activeTab, setActiveTab] = useState('candidats');

  const mainTabs = [
    { value: "profile", label: "Profile" },
    { value: "publication", label: "Publication" },
    { value: "candidate", label: "Candidate" },
    { value: "entretien", label: "Entretien" },
    { value: "contrat", label: "Contrat" }
  ];
  const handleTabChange = (value) => {
    if (value === "profile") {
      navigate("/profile");
    }
    else if (value === "publication") {
      navigate("/publication");
    }
    else if (value === "candidate") {
      navigate("/candidate");
    }
  };


  return (
    <div className="p-6">
      {/* Main Tabs */}
      <div className="mb-8">
        <CustomTabs
          tabs={mainTabs}
          defaultValue="candidate"
          onValueChange={handleTabChange}
         
        />
      </div>

      <Card className="w-full border-[#EAE7E7]">
        <CardContent className="p-6">
          {/* Header */}
          <div className="bg-[#F7F4F4] p-4 rounded-t-lg">
            <div className="flex items-center text-sm font-medium">
              <div className="w-[50px] text-center">Order</div>
              <div className="w-[200px]">Nom Complet</div>
              <div className="w-[100px] text-center">Score</div>
              <div className="w-[100px] text-center">Score/10</div>
              <div className="flex-1"></div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="mt-2">
            {candidatesData.map((candidate) => (
              <CandidateDetails key={candidate.id} candidate={candidate} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center text-[#21448A] text-xs font-medium">
            <div className="space-x-4">
              {[1, 2, 3, 4, 5, '...', 10, 12].map((page, index) => (
                <span
                  key={index}
                  className={`cursor-pointer ${
                    page === 1 ? 'text-[#21448A]' : 'text-gray-500'
                  }`}
                >
                  {page}
                </span>
              ))}
            </div>
          </div>

          {/* Candidate Details Card */}
          <Card className="mt-6 border-[#EAE7E7]">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> Alea LARAKI
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> alealaraki@gmail.com
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone Number:</span> 91-9874563210
              </p>
              <p className="text-sm">
                <span className="font-medium">Address:</span> 45/12, Rosewood Apartments,
                Bannerghatta Road, Bengaluru, Karnataka – 560076
              </p>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <CustomTabs
              tabs={[
                { value: 'candidat', label: 'Candidat' },
                { value: 'experience', label: 'Experience' },
                { value: 'formation', label: 'Formation' },
                { value: 'competence', label: 'Compétence' },
                { value: 'resume', label: 'Resume' }
              ]}
              defaultValue="candidat"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 