import React, { ReactNode } from "react";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import SingleEliminationIcon from "@/components/icons/SingleEliminationIcon";
import DoubleEliminationIcon from "@/components/icons/DoubleEliminationIcon";
import RoundRobinIcon from "@/components/icons/RoundRobinIcon";
import SwissBracketIcon from "@/components/icons/SwissBracketIcon";
import { useRouter } from "next/navigation";

interface Stage {
  id: number;
  name: string;
  format: string;
}

interface StageTabsProps {
  stages: Stage[];
  activeStage: number;
  setActiveStage: (id: number) => void;
  stageProgress: Record<number, number>;
  menuOpenIdx: number | null;
  setMenuOpenIdx: (idx: number | null) => void;
  menuPosition: { x: number; y: number } | null;
  setMenuPosition: (pos: { x: number; y: number } | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  isReadyWindowClosed?: boolean;
}

const StageTabs: React.FC<StageTabsProps> = ({
  stages,
  activeStage,
  setActiveStage,
  stageProgress,
  menuOpenIdx,
  setMenuOpenIdx,
  menuPosition,
  setMenuPosition,
  menuRef,
  children,
  isReadyWindowClosed
}) => {
  const router = useRouter();
  return (
    <div className="mb-8">
      {/* Stage Selector */}
      <div className="mb-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-full pb-5">
          {stages.map((stage, idx) => (
            <React.Fragment key={`stage-${stage.id}-${idx}`}>
              <button
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center justify-between w-full max-w-[1000px] flex-1 px-8 py-2 rounded-lg border transition-all duration-200 text-left
                  ${activeStage === stage.id 
                    ? 'bg-yellow-500 text-[#181818] font-semibold border-yellow-600' 
                    : 'bg-[#222] text-white hover:bg-[#333] border-[#333]'}`}
                style={{ minWidth: "350px" }}
              >
                {/* Lewa część: ikona + opis */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center mr-3">
                    {stage.format === 'single-elimination' && (
                      <SingleEliminationIcon className="h-7 w-7" />
                    )}
                    {stage.format === 'double-elimination' && (
                      <DoubleEliminationIcon className="h-7 w-7" />
                    )}
                    {stage.format === 'round-robin' && (
                      <RoundRobinIcon className="h-7 w-7" />
                    )}
                    {stage.format === 'swiss' && (
                      <SwissBracketIcon className="h-7 w-7" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`font-semibold text-base leading-tight ${activeStage === stage.id ? "text-[#181818]" : "text-white"}`}>{stage.name}</span>
                    <span className={`text-xs mt-0.5 ${activeStage === stage.id ? "text-[#181818]/80" : "text-gray-400"}`}>{/* liczba drużyn */}</span>
                    <span className={`text-xs mt-1 ${activeStage === stage.id ? "text-[#181818]/70" : "text-gray-400"}`}>{stage.format.replace("-", " ")}</span>
                  </div>
                </div>
                {/* Prawa część: trzy kropki dla single-elimination (tylko pierwszy/jedyny etap) */}
                {(stage.format === "single-elimination" || stage.format === "double-elimination") && idx === 0 && (
                  <>
                    <button
                      className="ml-3 p-1 rounded hover:bg-gray-700"
                      title="Seeding"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuOpenIdx(idx);
                        setMenuPosition({
                          x: rect.right + 8,
                          y: rect.top,
                        });
                      }}
                    >
                      <span className="sr-only">Seeding</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {menuOpenIdx === idx && menuPosition && (
                      <div
                        ref={menuRef}
                        className="fixed z-[99999] min-w-[220px] rounded-lg border-2 border-yellow-500 bg-[#222] text-white shadow-xl pointer-events-auto"
                        style={{ left: menuPosition.x, top: menuPosition.y }}
                        onClick={e => e.stopPropagation()}
                      >
                        {isReadyWindowClosed && (
                          <>
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] rounded-t-lg w-full text-left"
                              onClick={e => {
                                e.stopPropagation();
                                setMenuOpenIdx(null);
                                setMenuPosition(null);
                                router.push("/seeding");
                              }}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Seeding
                            </button>
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed w-full text-left"
                              disabled
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <polygon points="5,3 19,12 5,21" fill="none" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Start tournament
                            </button>
                            <button
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed rounded-b-lg w-full text-left"
                              disabled
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Reset tournament
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
                {/* Prawa część: trzy kropki tylko dla round-robin */}
                {stage.format === "round-robin" && (
                  <>
                    <button
                      className="ml-3 p-1 rounded hover:bg-gray-700"
                      title="Więcej"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuOpenIdx(idx);
                        setMenuPosition({
                          x: rect.right + 8,
                          y: rect.top,
                        });
                      }}
                    >
                      <span className="sr-only">Więcej</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {menuOpenIdx === idx && menuPosition && (
                      <div
                        ref={menuRef}
                        className="fixed z-[9999] min-w-[220px] rounded-lg border border-[#333] bg-[#222] text-white shadow-xl"
                        style={{ left: menuPosition.x, top: menuPosition.y }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:bg-[#333] rounded-t-lg w-full text-left"
                          onClick={e => {
                            e.stopPropagation();
                            setMenuOpenIdx(null);
                            setMenuPosition(null);
                            router.push("/seeding");
                          }}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Seed
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed w-full text-left"
                          disabled
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <polygon points="5,3 19,12 5,21" fill="none" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Start tournament
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed rounded-b-lg w-full text-left"
                          disabled
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Reset tournament
                        </button>
                      </div>
                    )}
                  </>
                )}
              </button>
              {/* Strzałka między etapami */}
              {idx < (stages?.length ?? 0) - 1 && (
                <div className="flex items-center justify-center px-1">
                  <ArrowRight 
                    className={`h-5 w-5 ${
                      stages &&
                      stages[idx + 1] &&
                      stageProgress[stages[idx + 1].id] > 0
                        ? 'text-yellow-500'
                        : 'text-gray-600'
                    }`} 
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Stage Content przekazywany jako children */}
      {children}
    </div>
  );
};

export default StageTabs; 