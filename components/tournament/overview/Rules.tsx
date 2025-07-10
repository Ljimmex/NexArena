import React, { useState } from "react";
import type { RulePoint, RuleSection, RulesMeta, RulesProps } from "@/types/tournament";

const Rules: React.FC<RulesProps> = ({ rulesSections = [], rulesMeta = {}, rulesFallback }) => {
  const [activeSection, setActiveSection] = useState(0);
  const hasSections = rulesSections && rulesSections.length > 0;

  // Helper to render points with nested numbering (e.g. 1, 1.1, 1.1.1)
  const renderPoints = (points: RulePoint[], prefix = "") => (
    <ol className={prefix === "" ? "pl-2 space-y-3" : "pl-6 space-y-2"}>
      {points.map((point, idx) => {
        const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        return (
          <li key={number} className="flex flex-row items-start gap-2">
            <span className="inline-flex items-center justify-center min-w-[2.1em] h-7 rounded-full bg-[#23283a] text-blue-300 font-bold text-sm mr-2 mt-0.5 shadow-sm border border-[#2a3140]">
              {number}
            </span>
            <div className="flex-1">
              <span className="text-gray-200 text-base leading-snug">{point.text}</span>
              {point.children && point.children.length > 0 && (
                <div className="mt-1">{renderPoints(point.children, number)}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="rounded-2xl p-6 shadow-md mb-4 flex flex-col md:flex-row gap-8">
      {/* Sidebar with sections */}
      <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0 md:mr-8">
        <div className="bg-[#161922] rounded-xl p-4 border border-[#23283a] shadow-sm">
          <div className="text-gray-400 font-semibold text-xs mb-3 tracking-wider">Sekcje Regulaminu</div>
          <ul className="flex flex-col gap-1">
            {hasSections ? rulesSections.map((section, idx) => (
              <li key={idx}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left transition font-semibold text-base shadow-sm border border-transparent
                    ${activeSection === idx
                      ? "bg-gradient-to-r from-blue-700/80 to-blue-500/60 text-white border-blue-400 shadow-lg scale-[1.04]"
                      : "text-gray-300 hover:bg-[#20232e] hover:scale-[1.02]"}
                  `}
                  style={{ transition: 'all 0.15s cubic-bezier(.4,2,.6,1)' }}
                  onClick={() => setActiveSection(idx)}
                >
                  <span className={`text-2xl md:text-3xl drop-shadow-sm ${activeSection === idx ? "" : "opacity-80"}`}>{section.icon}</span>
                  <span className="truncate font-bold tracking-wide">{section.title}</span>
                </button>
              </li>
            )) : (
              <li className="text-gray-400 italic">Brak sekcji</li>
            )}
          </ul>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {rulesMeta?.version && (
            <span className="bg-[#23283a] text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">Wersja {rulesMeta.version}</span>
          )}
          <span className="text-gray-400 text-xs">Aktualna wersja</span>
          {rulesMeta?.approvedDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="font-semibold text-white">Zatwierdzono:</span> <span className="text-white font-bold">{rulesMeta.approvedDate}</span>
            </span>
          )}
          {rulesMeta?.approvedBy && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="font-semibold text-white">Zatwierdził:</span> <span className="text-white font-bold">{rulesMeta.approvedBy}</span>
            </span>
          )}
          {/* Linki do regulaminu */}
          {rulesMeta?.pdfUrl && (
            <a href={rulesMeta.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 underline ml-2">PDF</a>
          )}
          {rulesMeta?.wordUrl && (
            <a href={rulesMeta.wordUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 underline ml-2">Word</a>
          )}
          {rulesMeta?.previewUrl && (
            <a href={rulesMeta.previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 underline ml-2">Podgląd online</a>
          )}
        </div>
        {/* Section content */}
        {hasSections ? (
          <div className="bg-[#181c23] rounded-xl p-6 border border-[#23283a]">
            <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
              <span className="text-2xl">{rulesSections[activeSection]?.icon}</span>
              {rulesSections[activeSection]?.title}
            </h3>
            <div className="text-gray-400 text-sm mb-4">Szczegółowe zasady dotyczące tej sekcji regulaminu</div>
            {renderPoints(rulesSections[activeSection]?.points || [])}
            <div className="mt-8 bg-[#20232e] border border-[#23283a] rounded-lg p-4 flex items-start gap-3">
              <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
              <div>
                <div className="font-semibold text-yellow-300 mb-1">Ważne</div>
                <div className="text-gray-300 text-sm">Wszystkie zasady są obowiązkowe dla wszystkich uczestników. Nieprzestrzeganie regulaminu może skutkować dyskwalifikacją z turnieju.</div>
              </div>
            </div>
          </div>
        ) : rulesFallback ? (
          <div className="bg-[#181c23] rounded-xl p-6 border border-[#23283a]">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded-full bg-[#23272f] text-lg flex items-center justify-center mr-2">📜</span>
              Regulamin
            </h3>
            <ol className="list-decimal pl-2 space-y-3">
              {rulesFallback.map((rule, idx) => (
                <li key={idx} className="text-gray-200 text-base leading-snug">{rule}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Rules; 