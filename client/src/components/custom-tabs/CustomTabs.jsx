import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export const CustomTabs = ({ 
  tabs, 
  defaultValue, 
  onValueChange,
  className = "w-[60%]"
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const activeTabStyle = "data-[state=active]:border-b-2 data-[state=active]:border-[#214389] data-[state=active]:text-[#214389] data-[state=active]:font-medium rounded-[50px] h-[30px] px-6 min-w-[180px] text-center";
  
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
        <TabsList className="flex justify-between w-full rounded-[50px] p-0 h-[30px] bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={activeTabStyle}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}; 