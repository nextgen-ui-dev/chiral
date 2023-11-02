import React from "react";
import { AlertCircle } from "lucide-react";

enum PriorityLabel {
  "No Priority",
  "Urgent",
  "High",
  "Medium",
  "Low"
};

interface PriorityBarProps {
  priorityLevel: number;
  small?: boolean;
}

const PriorityBar = ({
  priorityLevel,
  small
}: PriorityBarProps) => {
  if (priorityLevel === 0) {
    // No Priority
    return (
      <div 
        title={`${PriorityLabel[priorityLevel]}`} 
        className="gray-400 opacity-50"
      >
        ---
      </div>
    );
  }

  if (priorityLevel === 1) {
    // Urgent
    return (
      <div title={`${PriorityLabel[priorityLevel]}`}>
        <AlertCircle size={small ? 20 : 40} color="gray-400" />;
      </div>);
  }

  return (
    <div title={`${PriorityLabel[priorityLevel]}`} className="scale-y-[-1] flex flex-row gap-x-1">
      {/* Bar 1 */}
      <div className={`${priorityLevel > 4 ? "opacity-30" : "opacity-100"} bg-gray-400 rounded-lg ${small ? "w-[2.5px] h-[5px]" : "w-[5px] h-[10px]"}`}></div>
      {/* Bar 2 */}
      <div className={`${priorityLevel > 3 ? "opacity-30" : "opacity-100"} bg-gray-400 rounded-lg ${small ? "w-[2.5px] h-[10px]" : "w-[5px] h-[20px]"}`}></div>
      {/* Bar 3 */}
      <div className={`${priorityLevel > 2 ? "opacity-30" : "opacity-100"} bg-gray-400 rounded-lg ${small ? "w-[2.5px] h-[15px]" : "w-[5px] h-[30px]"}`}></div>
    </div>
  );
};

export default PriorityBar;