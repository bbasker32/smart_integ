import { PublicationSection } from "./PublicationSection/PublicationSection";

export const VueProjectPublication = () => {
  return (
    <>
      <div className="py-4 md:py-6 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
          <h1 className="font-['Montserrat',Helvetica] font-medium text-lg md:text-xl">
            Profile 1
          </h1>
          <div className="font-['Montserrat',Helvetica] text-sm">
            Home &gt; Profile 1 &gt; Publication
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        <PublicationSection />
      </div>
    </>
  );
}; 