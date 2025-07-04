import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Upload } from "lucide-react";
import { CustomTabs } from "../../components/custom-tabs/CustomTabs";

export default function ParametrePage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [fileName, setFileName] = useState("template_file.xlsx");
  const [mappings, setMappings] = useState([
    { placeholder: "First Name", systemField: "First Name" },
    { placeholder: "Last Name", systemField: "Last Name" },
    { placeholder: "Start Date", systemField: "Start Date" },
  ]);

  const systemFields = ["First Name", "Last Name", "Start Date"];

  const tabs = [
    { value: "upload", label: "Upload Template" },
    { value: "user", label: "User Management" },
  ];

  const handleTabChange = (value) => setActiveTab(value);

  const handleMappingChange = (idx, field, value) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMapping = () => {
    setMappings((prev) => [
      ...prev,
      { placeholder: "", systemField: systemFields[0] },
    ]);
  };

  const handleRemoveMapping = (idx) => {
    setMappings((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
          <h1 className="font-['Montserrat'] font-medium text-lg md:text-xl">
            Paramètres
          </h1>
          <div className="font-['Montserrat'] text-sm">Home &gt; Settings</div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[5px] border border-[#eae7e7] p-6">
          {/* Tabs */}
          <div className="mb-6 width-1/2">
            <CustomTabs
              tabs={tabs}
              defaultValue="upload"
              onValueChange={handleTabChange}
              value={activeTab}
            />
          </div>

          {/* Upload Section */}
          {activeTab === "upload" && (
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#E0D4D4] font-['Montserrat'] text-[14px] h-10"
              >
                <Upload className="w-5 h-5" />
                Upload Word Template
              </Button>
              <span className="text-[#666] font-['Montserrat'] text-[15px]">
                {fileName}
              </span>
            </div>
          )}

          {/* Placeholder Mapping Table */}
          <div className="bg-[#faf7f7] rounded-md border border-[#eae7e7]">
            <div className="p-4 border-b border-[#eae7e7] bg-[#f7f2f2] rounded-t-md">
              <span className="font-['Montserrat'] text-base font-medium">
                Placeholder Mapping
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#f7f2f2]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666] font-['Montserrat']">
                      Placeholder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#666] font-['Montserrat']">
                      System Field
                    </th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => (
                    <tr
                      key={idx}
                      className="bg-white border-b border-[#eae7e7]"
                    >
                      <td className="px-6 py-2">
                        <Input
                          value={mapping.placeholder}
                          onChange={(e) =>
                            handleMappingChange(
                              idx,
                              "placeholder",
                              e.target.value
                            )
                          }
                          className="h-9 text-sm font-['Montserrat'] bg-white border-[#eae7e7]"
                        />
                      </td>
                      <td className="px-6 py-2">
                        <select
                          value={mapping.systemField}
                          onChange={(e) =>
                            handleMappingChange(
                              idx,
                              "systemField",
                              e.target.value
                            )
                          }
                          className="h-9 w-full border border-[#eae7e7] rounded-md text-sm font-['Montserrat'] bg-white px-2"
                        >
                          {systemFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMapping(idx)}
                          className="text-[#666] hover:text-red-500"
                          title="Remove"
                        >
                          &#128465;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                className="text-sm font-['Montserrat']"
                onClick={handleAddMapping}
              >
                Add New Mapping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
