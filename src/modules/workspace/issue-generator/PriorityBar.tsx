import React from "react";
import { AlertCircle } from "lucide-react";

interface PriorityBarProps {
  priorityLevel: number;
}

const PriorityBar = ({
  priorityLevel,
}: PriorityBarProps) => {
  if (priorityLevel === 0) {
    // No Priority
    return (
      <div className="gray-400 opacity-50">
        ---
      </div>
    );
  }

  if (priorityLevel === 1) {
    return <AlertCircle size={40} color="gray-400" />;
  }

  return (
    <div className="scale-y-[-1] flex flex-row gap-x-1">
      {/* Bar 1 */}
      <div className={`${priorityLevel > 4 ? "opacity-30" : "opacity-100"} bg-gray-400 w-[5px] h-[10px] rounded-lg`}></div>
      {/* Bar 2 */}
      <div className={`${priorityLevel > 3 ? "opacity-30" : "opacity-100"} bg-gray-400 w-[5px] h-[20px] rounded-lg`}></div>
      {/* Bar 3 */}
      <div className={`${priorityLevel > 2 ? "opacity-30" : "opacity-100"} bg-gray-400 w-[5px] h-[30px] rounded-lg`}></div>
    </div>
  );
};

export default PriorityBar;