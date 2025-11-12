/**
 * ActivityItem Component
 * Single activity item in the activity feed
 */

import React from "react";

interface ActivityItemProps {
  title: string;
  timestamp: string;
  color: "green" | "blue" | "orange";
}

const colorMap = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

export const ActivityItem = React.memo(
  ({ title, timestamp, color }: ActivityItemProps) => (
    <div className="flex items-center space-x-4">
      <div className={`w-2 h-2 ${colorMap[color]} rounded-full`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{timestamp}</p>
      </div>
    </div>
  )
);
ActivityItem.displayName = "ActivityItem";
