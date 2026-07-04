import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string; // Material symbol name
  className?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, className = "", color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const iconColors = colorMap[color];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 flex items-center shadow-sm ${className}`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${iconColors}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
