import React from "react";
import { CandidatesSection } from "./CandidateSection/CandidatesSection";
import { Card } from '../../components/ui/card';
import { useProfile } from '../../contexts/ProfileContext';



export const VueProjectCandidate = () => {
  console.log('VueProjectCandidate mounted');
  const { activeProfileTitle } = useProfile();
  return (
    <>
      <div className="py-4 md:py-6 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
          <h1 className="font-['Montserrat',Helvetica] font-medium text-lg md:text-xl">
            {activeProfileTitle || 'Loading Profile...'}
          </h1>
          <div className="font-['Montserrat',Helvetica] text-sm">
            Home &gt; {activeProfileTitle || 'Profile'}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        <CandidatesSection />
        {/* <DndTest /> */}
      </div >
    </>

  );
}; 