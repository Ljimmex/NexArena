import React from "react";

interface FormatDescriptionProps {
  formatName: string;
  description: string;
}

const FormatDescription: React.FC<FormatDescriptionProps> = ({ formatName, description }) => (
  <div className="bg-[#181c23] rounded-lg p-6 border border-[#333] mb-4">
    <h3 className="text-lg font-semibold mb-2 text-white">Format: {formatName}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

export default FormatDescription; 