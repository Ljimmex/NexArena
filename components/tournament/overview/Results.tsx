import React from "react";

interface Result {
  place: number;
  teamName: string;
  logo?: string;
}

interface ResultsProps {
  results: Result[];
  prizePool?: string;
  prizeDistribution?: string;
  customPrizeDistribution?: Record<string, number>;
  teams?: { id: string; name: string; logo?: string }[];
}

const Results: React.FC<ResultsProps> = ({ results, prizePool, prizeDistribution, customPrizeDistribution, teams }) => {
  // NIE wyświetlaj drużyn jeśli results puste
  const displayResults = results && results.length > 0 ? results : [];

  // Parse prizePool as number (remove currency, spaces, etc.)
  let poolValue = 0;
  if (prizePool) {
    const match = prizePool.replace(/\s/g, '').match(/([\d,.]+)/);
    if (match) {
      poolValue = parseFloat(match[1].replace(',', '.'));
    }
  }

  // Prepare prize mapping: place -> amount
  let prizeMap: Record<number, number> = {};
  if (customPrizeDistribution && poolValue > 0) {
    for (const [place, percent] of Object.entries(customPrizeDistribution)) {
      const nPlace = Number(place);
      const pct = Number(percent);
      if (!isNaN(nPlace) && !isNaN(pct)) {
        prizeMap[nPlace] = Math.round(poolValue * pct / 100);
      }
    }
  }

  // Ustal maxPlace na podstawie customPrizeDistribution jeśli nie ma results
  let maxPlace = 0;
  if (displayResults.length > 0) {
    maxPlace = Math.max(...displayResults.map(r => r.place));
  } else if (customPrizeDistribution && Object.keys(customPrizeDistribution).length > 0) {
    maxPlace = Math.max(...Object.keys(customPrizeDistribution).map(Number));
  }

  // Ustal walutę (PLN/ZŁ) domyślnie jeśli nie wykryto
  function getCurrency(pool: string | undefined) {
    if (!pool) return 'PLN';
    const match = pool.match(/[\d.,]+\s*(\D+)/);
    if (match && match[1]) return match[1].trim().toUpperCase();
    return 'PLN';
  }
  const currency = getCurrency(prizePool);

  // --- GRUPOWANIE miejsc z tą samą nagrodą ---
  let groupedPlaces: { places: number[]; amount: number }[] = [];
  if (customPrizeDistribution && Object.keys(customPrizeDistribution).length > 0 && maxPlace > 0) {
    // Zbuduj tablicę: [{places: [1], amount: 500}, {places: [2], amount: 250}, ...]
    const placeAmounts: { place: number; amount: number }[] = [];
    for (let i = 1; i <= maxPlace; i++) {
      placeAmounts.push({ place: i, amount: prizeMap[i] !== undefined ? prizeMap[i] : 0 });
    }
    // Grupuj po amount (w tym amount = 0)
    let currentGroup: { places: number[]; amount: number } | null = null;
    for (let i = 0; i < placeAmounts.length; i++) {
      const { place, amount } = placeAmounts[i];
      if (!currentGroup || currentGroup.amount !== amount) {
        if (currentGroup) groupedPlaces.push(currentGroup);
        currentGroup = { places: [place], amount };
      } else {
        currentGroup.places.push(place);
      }
    }
    if (currentGroup) groupedPlaces.push(currentGroup);
  }

  return (
    <div className="bg-[#181c23] rounded-lg p-0 border border-[#333] mb-4 overflow-hidden">
      <div className="bg-[#23283a] px-6 py-3 border-b border-[#333]">
        <h3 className="text-lg font-bold tracking-widest text-gray-100 uppercase">Prizes (PLN)</h3>
        <div className="text-base font-semibold text-gray-300 mt-1">Prize Pool: <span className="text-yellow-400 font-bold">{prizePool ? `${prizePool} PLN` : '-'}</span></div>
      </div>
      {customPrizeDistribution && Object.keys(customPrizeDistribution).length > 0 && poolValue > 0 && groupedPlaces.length > 0 && (
        <ul className="divide-y divide-[#23283a]">
          {groupedPlaces.map((group, idx) => {
            const { places, amount } = group;
            // Format miejsca: 1., 2., 3-4., 5-8.
            let placeLabel = '';
            if (places.length === 1) {
              placeLabel = `${places[0]}${getOrdinalSuffix(places[0])}.`;
            } else {
              placeLabel = `${places[0]}-${places[places.length-1]}${getOrdinalSuffix(places[places.length-1])}.`;
            }
            return (
              <li key={idx} className="flex items-center justify-between px-6 py-3">
                <span className={amount > 0 ? "text-gray-200 font-medium text-base" : "text-gray-400 font-medium text-base"}>
                  {placeLabel}
                </span>
                <span className={amount > 0 ? "text-lg font-bold text-teal-300" : "text-lg font-bold text-gray-500"}>
                  {amount} <span className="ml-1 text-gray-400 text-base font-semibold">PLN</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {/* Fallback for prizeDistribution as text */}
      {prizeDistribution && !customPrizeDistribution && (
        <div className="px-6 py-4 text-gray-400 text-xs">{prizeDistribution}</div>
      )}
      {/* Wyniki drużyn */}
      {displayResults.length > 0 && (
        <div className="px-6 py-4">
          <ol className="space-y-2">
            {displayResults.map((result) => (
              <li key={result.place} className={`flex items-center gap-3 ${result.place <= 3 ? 'font-bold text-yellow-400' : 'text-gray-200'}`}>
                <span className="w-6 text-center">{result.place}.</span>
                {result.logo && <img src={result.logo} alt={result.teamName} className="w-6 h-6 rounded-full" />}
                <span>{result.teamName}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function getOrdinalSuffix(n: number) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export default Results; 