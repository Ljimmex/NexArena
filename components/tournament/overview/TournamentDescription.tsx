import React from "react";
import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

interface TournamentDescriptionProps {
  description?: string;
}

const TournamentDescription: React.FC<TournamentDescriptionProps> = ({ description }) => {
  return (
    <div className="p-4 rounded max-w-3xl mx-auto">
      <div className="text-lg font-semibold mb-2 text-gray-200">Information</div>
      {(!description || description.trim() === "") ? (
        <div className="text-gray-400 italic">Brak opisu turnieju.</div>
      ) : (
        <MarkdownPreview source={description} style={{ background: "transparent", color: '#e5e7eb', fontFamily: 'inherit' }} />
      )}
    </div>
  );
};

export default TournamentDescription; 