import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { CustomTabs } from '../../components/custom-tabs/CustomTabs';
import { CandidatesSection } from './CandidateSection/CandidatesSection';
import { useNavigate } from 'react-router-dom';

export const VueProjectCandidate = () => {
  const navigate = useNavigate();

  const tabs = [
    { value: "profile", label: "Profile" },
    { value: "publication", label: "Publication" },
    { value: "candidate", label: "Candidate" }
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-['Montserrat'] text-xl font-medium">
          Profile 1
        </h1>
        <div className="font-['Montserrat'] text-sm">
          Home &gt; Profile 1
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="w-full max-w-[1067px] mx-auto mb-6 border-[#EAE7E7]">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block font-['Montserrat'] text-lg">Name</label>
              <Input
                defaultValue="Project 1h"
                className="border-[#E0D4D4]"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-['Montserrat'] text-lg">Services</label>
              <Select defaultValue="rh">
                <SelectTrigger className="border-[#E0D4D4]">
                  <SelectValue>RH</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block font-['Montserrat'] text-lg">Resp</label>
              <Select defaultValue="alae">
                <SelectTrigger className="border-[#E0D4D4]">
                  <SelectValue>Alae LARAKI</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alae">Alae LARAKI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card className="w-full max-w-[1067px] mx-auto border-[#EAE7E7]">
        <CardContent className="p-6">
          {/* Import Sections */}
          <div className="mb-8">
            <div className="flex gap-8 items-center">
              <div>
                <h2 className="font-['Montserrat'] text-xl font-semibold mb-2">
                  Importation local
                </h2>
                <div className="bg-[#A9A7A7] rounded-lg h-[50px] w-[320px] shadow-md" />
              </div>
              <div>
                <h2 className="font-['Montserrat'] text-xl font-semibold mb-2">
                  Importation plateformes
                </h2>
                <div className="bg-[#A9A7A7] rounded-lg h-[50px] w-[320px] shadow-md" />
              </div>
            </div>
          </div>

          {/* Candidates Section */}
          <CandidatesSection />

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button className="bg-[#214389] text-white hover:bg-[#214389]/90 rounded-full px-8">
              Back
            </Button>
            <div className="flex gap-4">
              <Button className="bg-[#214389] text-white hover:bg-[#214389]/90 rounded-full px-8">
                Publish
              </Button>
              <Button className="bg-[#214389] text-white hover:bg-[#214389]/90 rounded-full px-8">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 