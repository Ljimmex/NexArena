import React from "react";
import { BracketView } from "@/components/tournament/BracketView";

interface Stage {
  id: number;
  name: string;
  format: string;
}

interface StageBracketViewProps {
  stage: Stage;
  index: number;
  activeStage: number;
  hasSeeding: boolean;
  seededTeams: any[];
  getStageOptions: (format: string) => any;
  getStageParticipants: (stageId: number) => any[];
  isSwissStageComplete: (stageId: number) => boolean;
  isRoundRobinStageComplete: (stageId: number) => boolean;
  isSingleEliminationStageComplete: (stageId: number) => boolean;
  isDoubleEliminationStageComplete: (stageId: number) => boolean;
  maxTeams: number;
}

const StageBracketView: React.FC<StageBracketViewProps> = ({
  stage,
  index,
  activeStage,
  hasSeeding,
  seededTeams,
  getStageOptions,
  getStageParticipants,
  isSwissStageComplete,
  isRoundRobinStageComplete,
  isSingleEliminationStageComplete,
  isDoubleEliminationStageComplete,
  maxTeams
}) => {
  const participants = getStageParticipants(stage.id);
  const previousStageId = undefined; // można przekazać jeśli potrzebne
  const previousStageFormat = undefined; // można przekazać jeśli potrzebne

  // Check if previous stage is completed based on its format
  let isPreviousStageComplete = true;
  // (W page.tsx jest logika do wyliczania tego, można przekazać jako props jeśli potrzeba)

  const isEmptyBracket = !!(previousStageId && !isPreviousStageComplete);

  // Single Elimination: obsługa seedingu i pustej drabinki dla pierwszego/jedynego etapu
  if (stage.format === 'single-elimination' && index === 0) {
    return (
      <div key={stage.id} className={`mt-4 ${activeStage === stage.id ? 'block' : 'hidden'}`}>
        <div>
          <BracketView
            participants={hasSeeding ? seededTeams : []}
            options={{
              ...getStageOptions(stage.format),
              stageId: stage.id,
              emptyBracket: !hasSeeding,
            }}
          />
        </div>
      </div>
    );
  }

  // Double Elimination: obsługa seedingu i pustej drabinki dla pierwszego/jedynego etapu
  if (stage.format === 'double-elimination' && index === 0) {
    return (
      <div key={stage.id} className={`mt-4 ${activeStage === stage.id ? 'block' : 'hidden'}`}>
        <div>
          <BracketView
            participants={hasSeeding ? seededTeams : []}
            options={{
              ...getStageOptions(stage.format),
              stageId: stage.id,
              emptyBracket: !hasSeeding,
              bracketSize: maxTeams
            }}
          />
        </div>
      </div>
    );
  }

  // Inne formaty
  return (
    <div 
      key={stage.id} 
      className={`mt-4 ${activeStage === stage.id ? 'block' : 'hidden'}`}
    >
      <div>
        <BracketView 
          participants={participants}
          options={{
            ...getStageOptions(stage.format),
            stageId: stage.id,
            emptyBracket: isEmptyBracket,
            bracketSize: maxTeams // <-- dodajemy bracketSize do options
          }}
        />
      </div>
    </div>
  );
};

export default StageBracketView; 