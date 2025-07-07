import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export const CustomStyledTabs = ({
  tabs,
  defaultValue,
  onValueChange,
  className = "w-[60%]"
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const tabBaseStyle = "text-[#555] text-xs leading-6 tracking-[0.00833em] font-medium bg-transparent transition-colors duration-200 whitespace-nowrap";
  const activeTabStyle = "data-[state=active]:rounded-[50px] data-[state=active]:h-[26px] data-[state=active]:px-6 data-[state=active]:py-1 data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-[#214389] data-[state=active]:text-[#214389] data-[state=active]:text-base data-[state=active]:tracking-[0.00625em] data-[state=active]:leading-6";
  
  const handleValueChange = (value) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  useEffect(() => {
    setActiveTab(defaultValue);
  }, [defaultValue]);

  return (
    <div className="mb-8 w-full">
      <Tabs value={activeTab} onValueChange={handleValueChange} className={className}>
        <TabsList className="flex rounded-t-[10px] bg-[#F7F4F4] overflow-x-auto justify-start min-w-0 h-[82px] pl-[22px] pt-[29px] pb-[27px] gap-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`${tabBaseStyle} ${activeTabStyle}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}; 