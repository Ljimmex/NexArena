import type React from "react"
import type { Participant, Match } from "@/types/index"
import { getRequiredWinsLosses, calculateMaxRounds } from "@/components/generators/Swiss/BracketStructure"

interface SwissBracketTreeProps {
  standings: Participant[]
  requiredStats: { wins: number; losses: number }
  blockHistory?: Record<number, Record<string, Participant[]>>
  matches?: Match[]
}

// Poprawiona funkcja do generowania struktury Swiss bracket
function getSwissStructureDynamic(totalTeams: number) {
  const { wins: maxWins, losses: maxLosses } = getRequiredWinsLosses(totalTeams)
  const structure: any[] = []
  structure.push({
    type: "round",
    roundNum: 0,
    title: "0:0",
    blocks: [{ wins: 0, losses: 0 }],
    top: "50%",
    color: "neutral",
  })
  // Dla 32 drużyn: awanse i odpadnięcia (2,4,5,5)
  let advancementCounts: number[] = []
  let eliminationCounts: number[] = []
  if (totalTeams === 32) {
    advancementCounts = [2,4,5,5]
    eliminationCounts = [2,4,5,5]
  }
  // Zbierz stany awansu/eliminacji (tylko te, które są możliwe)
  const advancementStates: string[] = []
  const eliminationStates: string[] = []
  for (let l = 0; l < maxLosses; l++) advancementStates.push(`${maxWins}:${l}`)
  for (let w = 0; w < maxWins; w++) eliminationStates.push(`${w}:${maxLosses}`)
  // Generuj kolejne rundy dynamicznie
  for (let round = 1; round <= maxWins + maxLosses; round++) {
    const blocks: any[] = []
    for (let w = Math.max(0, round - maxLosses); w <= Math.min(round, maxWins); w++) {
      const l = round - w
      if (w > maxWins || l > maxLosses) continue
      if ((w === maxWins && l === maxLosses) || (w === maxWins && l >= maxLosses) || (l === maxLosses && w >= maxWins)) continue
      if (w === maxWins) {
        // AWANS
        let slots = undefined
        if (totalTeams === 32) slots = advancementCounts[l] // l = 0,1,2,3
        blocks.push({
          type: "advancement",
          roundNum: round,
          title: `AWANS: ${advancementStates.join(", ")}`,
          blocks: [{ wins: w, losses: l, isAdvancing: true, slots }],
          color: "green",
        })
      } else if (l === maxLosses) {
        // ODPADNIĘCIE
        let slots = undefined
        if (totalTeams === 32) slots = eliminationCounts[w] // w = 0,1,2,3
        blocks.push({
          type: "elimination",
          roundNum: round,
          title: `ODPADNIĘCIE: ${eliminationStates.join(", ")}`,
          blocks: [{ wins: w, losses: l, isEliminated: true, slots }],
          color: "red",
        })
      } else {
        // Standardowy blok
        blocks.push({
          type: "round",
          roundNum: round,
          title: `${w}:${l}`,
          blocks: [{ wins: w, losses: l }],
          color: "neutral",
        })
      }
    }
    // Najpierw awanse, potem rundy, potem eliminacje
    const advancements = blocks.filter(b => b.type === "advancement")
    const eliminations = blocks.filter(b => b.type === "elimination")
    const rounds = blocks.filter(b => b.type === "round")
    const ordered = [...advancements, ...rounds, ...eliminations]
    const n = ordered.length
    ordered.forEach((block, idx) => {
      block.top = `${((idx + 0.5) / n) * 100}%`
      structure.push(block)
    })
  }
  return structure
}

// Poprawiona funkcja do liczenia ilości drużyn w bloku
function getExpectedTeamCount(wins: number, losses: number, totalTeams: number, slots?: number): number {
  if (slots !== undefined) return slots
  if (wins === 0 && losses === 0) return totalTeams
  // Dla awansów/eliminacji: tylko te drużyny, które mają dokładnie maxWins lub maxLosses
  const { wins: maxWins, losses: maxLosses } = getRequiredWinsLosses(totalTeams)
  if (wins === maxWins && losses <= maxLosses) {
    // Licz tylko te, które mają dokładnie maxWins
    // Przybliżenie: binomial(sum, maxWins) * totalTeams / 2^sum
    const sum = wins + losses
    function binomial(n: number, k: number): number {
      if (k < 0 || k > n) return 0
      if (k === 0 || k === n) return 1
      let res = 1
      for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i
      }
      return res
    }
    const approx = totalTeams * (binomial(sum, maxWins) / Math.pow(2, sum))
    return Math.max(1, Math.round(approx))
  }
  if (losses === maxLosses && wins <= maxWins) {
    // Licz tylko te, które mają dokładnie maxLosses
    const sum = wins + losses
    function binomial(n: number, k: number): number {
      if (k < 0 || k > n) return 0
      if (k === 0 || k === n) return 1
      let res = 1
      for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i
      }
      return res
    }
    const approx = totalTeams * (binomial(sum, losses) / Math.pow(2, sum))
    return Math.max(1, Math.round(approx))
  }
  // Pozostałe bloki: standardowe przybliżenie
  const sum = wins + losses
  if (sum === 0) return totalTeams
  function binomial(n: number, k: number): number {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1
    let res = 1
    for (let i = 1; i <= k; i++) {
      res = res * (n - i + 1) / i
    }
    return res
  }
  const approx = totalTeams * (binomial(sum, wins) / Math.pow(2, sum))
  return Math.max(1, Math.round(approx))
}

// Funkcja do renderowania drużyn - różne dla normalnych rund i awansów/eliminacji
function renderTeamsInBlock(
  teams: Participant[],
  expectedCount: number,
  previousResults: { teamId: string; won: boolean }[],
  isSpecialSection = false,
) {
  const teamsToShow = [...teams]

  while (teamsToShow.length < expectedCount) {
    teamsToShow.push(null as any)
  }

  if (isSpecialSection) {
    // For advancement/elimination sections - single teams without "vs"
    if (expectedCount <= 2) {
      // Handle 0, 1, or 2 teams in a single row
      return (
        <div className="flex flex-row gap-2 justify-center">
          {teamsToShow.map((team, idx) => (
            <div key={idx} className="flex items-center justify-center p-2 bg-black/20 rounded border border-gray-600">
              {team ? (
                <div className="flex items-center gap-2">
                  <img
                    src={team.logo || "/placeholder.svg"}
                    alt={team.name}
                    className="w-8 h-8 rounded-full border border-gray-400"
                  />
                  <span className="text-xs text-white font-medium truncate max-w-[80px]">{team.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
                    <span className="text-xs text-gray-400">TBD</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    } else {
      // Split into two columns for more than 2 teams
      const mid = Math.ceil(teamsToShow.length / 2)
      const col1 = teamsToShow.slice(0, mid)
      const col2 = teamsToShow.slice(mid)

      const renderTeamCard = (team: Participant | null, key: number) => (
        <div key={key} className="flex items-center justify-start p-2 bg-black/20 rounded border border-gray-600 w-full">
          {team ? (
            <div className="flex items-center gap-2">
              <img
                src={team.logo || "/placeholder.svg"}
                alt={team.name}
                className="w-8 h-8 rounded-full border border-gray-400"
              />
              <span className="text-xs text-white font-medium truncate max-w-[80px]">{team.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
                <span className="text-xs text-gray-400">TBD</span>
              </div>
            </div>
          )}
        </div>
      )

      return (
        <div className="flex flex-row gap-2 justify-center">
          <div className="flex flex-col gap-2">
            {col1.map((team, idx) => renderTeamCard(team, idx))}
          </div>
          <div className="flex flex-col gap-2">
            {col2.map((team, idx) => renderTeamCard(team, mid + idx))}
          </div>
        </div>
      )
    }
  }

  // Standardowe pary z "vs" dla normalnych rund
  const pairs = []
  for (let i = 0; i < teamsToShow.length; i += 2) {
    pairs.push([teamsToShow[i], teamsToShow[i + 1]])
  }

  return (
    <div className="flex flex-col gap-1">
      {pairs.map((pair, pairIdx) => (
        <div
          key={pairIdx}
          className="flex items-center justify-center gap-2 px-2 py-1 bg-black/20 rounded border border-gray-600"
        >
          {/* Pierwsza drużyna */}
          {pair[0] ? (
            <div className="relative">
              {previousResults.find((r) => r.teamId === pair[0].id)?.won && (
                <div className="absolute -inset-1 bg-green-400 rounded-full opacity-30"></div>
              )}
              <img
                src={pair[0].logo || "/placeholder.svg"}
                alt={pair[0].name}
                className={`w-6 h-6 rounded-full border border-gray-400 relative z-10 ${
                  previousResults.find((r) => r.teamId === pair[0].id && !r.won) ? "opacity-50 grayscale" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}

          <span className="text-xs text-gray-400 font-bold">vs</span>

          {/* Druga drużyna */}
          {pair[1] ? (
            <div className="relative">
              {previousResults.find((r) => r.teamId === pair[1].id)?.won && (
                <div className="absolute -inset-1 bg-green-400 rounded-full opacity-30"></div>
              )}
              <img
                src={pair[1].logo || "/placeholder.svg"}
                alt={pair[1].name}
                className={`w-6 h-6 rounded-full border border-gray-400 relative z-10 ${
                  previousResults.find((r) => r.teamId === pair[1].id && !r.won) ? "opacity-50 grayscale" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Funkcja do określania kolorów bloków
function getBlockColors(color?: string, type?: string) {
  if (type === "advancement" || type === "side_by_side_advancement" || color === "green") {
    return {
      bg: "bg-green-800/90",
      border: "border-green-500",
      text: "text-green-100",
      badge: "border-green-400",
    }
  }
  if (type === "elimination" || type === "side_by_side_elimination" || color === "red") {
    return {
      bg: "bg-red-800/90",
      border: "border-red-500",
      text: "text-red-100",
      badge: "border-red-400",
    }
  }
  if (color === "orange") {
    return {
      bg: "bg-orange-800/90",
      border: "border-orange-500",
      text: "text-orange-100",
      badge: "border-orange-400",
    }
  }
  // Neutral color for 2-0, 2-1, 1-2, 0-2
  return {
    bg: "bg-gray-800/90",
    border: "border-gray-600",
    text: "text-white",
    badge: "border-gray-500",
  }
}

// Komponent dla linii łączących z dokładnym przepływem
const BracketConnections: React.FC<{
  roundGroups: { [key: number]: any[] }
  containerWidth: number
  containerHeight: number
  blockHeight: number
  blockGap: number
}> = ({ roundGroups, containerWidth, containerHeight, blockHeight, blockGap }) => {
  const columnWidth = 240
  const columnGap = 32
  const blockWidth = 240 // szerokość bloku zgodna z CSS

  const getElementPosition = (roundNum: number, itemIndex: number, totalItems: number) => {
    const totalBlocksHeight = totalItems * blockHeight + (totalItems - 1) * blockGap
    const startY = (containerHeight - totalBlocksHeight) / 2
    return startY + itemIndex * (blockHeight + blockGap) + blockHeight / 2
  }
  const getColumnX = (roundNum: number) => {
    return roundNum * (columnWidth + columnGap) + columnWidth / 2
  }

  // --- MAPA POŁĄCZEŃ zgodnie z opisem użytkownika ---
  const manualConnections: Record<string, { to: string; win: boolean }[]> = {
    '0:0': [ { to: '1:0', win: true }, { to: '0:1', win: false } ],
    '1:0': [ { to: '2:0', win: true }, { to: '1:1', win: false } ],
    '0:1': [ { to: '1:1', win: true }, { to: '0:2', win: false } ],
    '2:0': [ { to: 'advancement', win: true }, { to: '2:1', win: false } ],
    '1:1': [ { to: '2:1', win: true }, { to: '1:2', win: false } ],
    '0:2': [ { to: '1:2', win: true }, { to: 'elimination', win: false } ],
    '2:1': [ { to: 'advancement', win: true }, { to: '2:2', win: false } ],
    '1:2': [ { to: '2:2', win: true }, { to: 'elimination', win: false } ],
    '2:2': [ { to: 'advancement', win: true }, { to: 'elimination', win: false } ],
  }

  // 1. Zbuduj mapę pozycji bloków
  const blockPositions: Record<string, { x: number; y: number; round: number; idx: number }> = {}
  Object.entries(roundGroups).forEach(([roundNum, roundItems]) => {
    const r = Number(roundNum)
    roundItems.forEach((item, idx) => {
      const x = getColumnX(r)
      const y = getElementPosition(r, idx, roundItems.length)
      let key = ""
      if (item.type === "advancement" || item.type === "side_by_side_advancement") {
        key = "advancement"
      } else if (item.type === "elimination" || item.type === "side_by_side_elimination") {
        key = "elimination"
      } else if (item.blocks && item.blocks[0]) {
        key = `${item.blocks[0].wins}:${item.blocks[0].losses}`
      }
      if (key) blockPositions[key] = { x, y, round: r, idx }
    })
  })

  // --- LOGOWANIE STRUKTURY ---
  console.log('--- ROUND GROUPS STRUCTURE ---')
  Object.entries(roundGroups).forEach(([roundNum, roundItems]) => {
    console.log(`Runda ${roundNum}:`)
    roundItems.forEach((item, idx) => {
      const bilans = item.blocks && item.blocks[0] ? `${item.blocks[0].wins}:${item.blocks[0].losses}` : ''
      console.log(`  [${idx}] type: ${item.type}, title: ${item.title}, bilans: ${bilans}`)
    })
  })

  const connections: Array<{
    fromX: number
    fromY: number
    toX: number
    toY: number
    isWin: boolean
  }> = []

  Object.entries(roundGroups).forEach(([roundNum, roundItems]) => {
    const currentRound = Number.parseInt(roundNum)
    roundItems.forEach((item, itemIndex) => {
      if (!item.blocks) return
      const block = item.blocks[0]
      const key = `${block.wins}:${block.losses}`
      if (!manualConnections[key]) return

      const fromPos = blockPositions[key]

      manualConnections[key].forEach(conn => {
        const toKey = conn.to // "1:0", "advancement", "elimination", etc.
        const toPos = blockPositions[toKey]

        if (!fromPos || !toPos) return
        
        // --- LOGUJEMY POŁĄCZENIE ---
        const fromInfo = `[${fromPos.round}][${fromPos.idx}] ${item.type} ${item.title} ${key}`
        const toInfo = `[${toPos.round}][${toPos.idx}] ...`
        console.log(`LINIA: ${fromInfo} -> ${toInfo} (${conn.win ? 'WIN' : 'LOSE'})`)
        connections.push({
          fromX: fromPos.x + blockWidth / 2,
          fromY: fromPos.y,
          toX: toPos.x - blockWidth / 2,
          toY: toPos.y,
          isWin: conn.win,
        })
      })
    })
  })

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {connections.map((connection, index) => {
        const color = connection.isWin ? "#10b981" : "#ef4444"
        const midX = (connection.fromX + connection.toX) / 2
        return (
          <path
            key={index}
            d={`M ${connection.fromX} ${connection.fromY} Q ${midX} ${connection.fromY} ${connection.toX} ${connection.toY}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
        )
      })}
    </svg>
  )
}

// --- ZMIANA: Funkcja pomocnicza do sprawdzania czy tytuł to bilans ---
function isScoreTitle(title: string) {
  return /^\d+:\d+$/.test(title)
}

// --- ZMIANA: Funkcja pomocnicza do sprawdzania czy blok to awans/eliminacja ---
function isAdvancement(type: string) {
  return type === "advancement" || type === "side_by_side_advancement"
}
function isElimination(type: string) {
  return type === "elimination" || type === "side_by_side_elimination"
}

// Ta funkcja zastąpi `renderTeamsInBlock` dla bloków z meczami
function renderMatchesInBlock(matches: Match[], expectedMatchCount: number) {
  const matchesToShow = [...matches]
  while (matchesToShow.length < expectedMatchCount) {
    matchesToShow.push({ id: `placeholder-${matchesToShow.length}`, round: 0, position: 0 } as any)
  }

  return (
    <div className="flex flex-col gap-1">
      {matchesToShow.map(match => (
        <div
          key={match.id}
          className="flex items-center justify-center gap-2 px-2 py-1 bg-black/20 rounded border border-gray-600"
        >
          {match.participant1 ? (
            <div className="relative">
              {match.winner?.id === match.participant1.id && (
                <div className="absolute -inset-1 bg-green-400 rounded-full opacity-30"></div>
              )}
              <img
                src={match.participant1.logo || "/placeholder.svg"}
                alt={match.participant1.name}
                className={`w-6 h-6 rounded-full border border-gray-400 relative z-10 ${
                  match.winner && match.winner.id !== match.participant1.id ? "opacity-50 grayscale" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}
          <span className="text-xs text-gray-400 font-bold">vs</span>
          {match.participant2 ? (
            <div className="relative">
              {match.winner?.id === match.participant2.id && (
                <div className="absolute -inset-1 bg-green-400 rounded-full opacity-30"></div>
              )}
              <img
                src={match.participant2.logo || "/placeholder.svg"}
                alt={match.participant2.name}
                className={`w-6 h-6 rounded-full border border-gray-400 relative z-10 ${
                  match.winner && match.winner.id !== match.participant2.id ? "opacity-50 grayscale" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const SwissBracketTree: React.FC<SwissBracketTreeProps> = ({
  standings,
  requiredStats,
  blockHistory,
  matches,
}) => {
  const totalTeams = standings.length || 16
  // Ustal wymagane wygrane/przegrane na podstawie liczby drużyn
  const { wins: maxWins, losses: maxLosses } = getRequiredWinsLosses(totalTeams)
  // Ustal strukturę dynamicznie
  const structure = getSwissStructureDynamic(totalTeams)

  // Grupuj drużyny po bilansie
  const grouped: Record<string, Participant[]> = {}
  standings.forEach((team) => {
    const key = `${team.wins}:${team.losses}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(team)
  })

  const getPreviousRoundResults = (currentWins: number, currentLosses: number): { teamId: string; won: boolean }[] => {
    const results: { teamId: string; won: boolean }[] = []

    if (currentWins > 0) {
      const prevWinners = grouped[`${currentWins - 1}:${currentLosses}`] || []
      prevWinners.forEach((team) => results.push({ teamId: team.id, won: true }))
    }

    if (currentLosses > 0) {
      const prevLosers = grouped[`${currentWins}:${currentLosses - 1}`] || []
      prevLosers.forEach((team) => results.push({ teamId: team.id, won: false }))
    }

    return results
  }

  // Grupuj strukturę po rundach dla lepszego layoutu
  const roundGroups: { [key: number]: any[] } = {}
  structure.forEach((item) => {
    if (!roundGroups[item.roundNum]) roundGroups[item.roundNum] = []
    roundGroups[item.roundNum].push(item)
  })

  // Obliczamy wysokość bloku dla lepszego pozycjonowania linii
  const containerWidth = Object.keys(roundGroups).length * 272 // 240px width + 32px gap
  const containerHeight = 800
  const blockHeight = 120 // szacowana wysokość bloku (musi być zgodna z min-h-[80px] + padding)
  const blockGap = 32

  const getTeamsForState = (wins: number, losses: number): Participant[] => {
    if (!blockHistory) return []
    const teams = new Map<string, Participant>()

    // First, try to get teams from the most recent round that has this state
    const rounds = Object.keys(blockHistory).map(Number).sort((a, b) => b - a) // Sort rounds descending
    
    for (const round of rounds) {
      const teamsInState = blockHistory[round][`${wins}:${losses}`] || []
      if (teamsInState.length > 0) {
        // Use teams from the most recent round that has this state
        teamsInState.forEach(team => {
          if (!teams.has(team.id)) {
            teams.set(team.id, team)
          }
        })
        // If we found teams in this round, use them (don't look at older rounds)
        console.log(`Found ${teamsInState.length} teams for ${wins}:${losses} in round ${round}`)
        break
      }
    }

    // If no teams found in history, try to derive from matches
    if (teams.size === 0 && matches) {
      const teamsWithRecord = standings.filter(team => 
        (team.wins || 0) === wins && (team.losses || 0) === losses
      )
      teamsWithRecord.forEach(team => teams.set(team.id, team))
      if (teamsWithRecord.length > 0) {
        console.log(`Found ${teamsWithRecord.length} teams for ${wins}:${losses} from current standings`)
      }
    }

    return Array.from(teams.values())
  }

  const getMatchesForBlock = (
    roundOfBlock: number,
    requiredWins: number,
    requiredLosses: number,
  ): Match[] => {
    if (!matches) return []
    const roundOfMatches = roundOfBlock + 1

    // 1. Get all matches for the target round.
    const targetRoundMatches = matches.filter(m => m.round === roundOfMatches)
    if (targetRoundMatches.length === 0) return []

    // 2. Filter for matches where BOTH participants had the required record BEFORE this round.
    const qualifyingMatches = targetRoundMatches.filter(match => {
      if (!match.participant1 || !match.participant2) return false

      // Helper to calculate record
      const getRecord = (participantId: string) => {
        const matchesBefore = matches.filter(
          m => m.winner && m.round < roundOfMatches && (m.participant1?.id === participantId || m.participant2?.id === participantId),
        )
        const wins = matchesBefore.filter(m => m.winner?.id === participantId).length
        return { wins, losses: matchesBefore.length - wins }
      }

      const p1Record = getRecord(match.participant1.id)
      const p2Record = getRecord(match.participant2.id)

      return (
        p1Record.wins === requiredWins &&
        p1Record.losses === requiredLosses &&
        p2Record.wins === requiredWins &&
        p2Record.losses === requiredLosses
      )
    })

    return qualifyingMatches
  }

  return (
    <div className="relative w-full overflow-x-auto py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      {/* Nagłówek turnieju */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-orange-400 mb-2">CS2 MAJOR</h1>
        <h2 className="text-xl font-bold text-white mb-1">COPENHAGEN</h2>
        <p className="text-sm text-orange-300">ELIMINATION STAGE</p>
        <p className="text-xs text-gray-400">MARCH 21ST - MARCH 24TH</p>
      </div>

      <div
        className="relative flex flex-row justify-center gap-8 px-4"
        style={{ minWidth: `${containerWidth}px`, height: `${containerHeight}px` }}
      >
        {/* Linie łączące w tle */}
        <BracketConnections
          roundGroups={roundGroups}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          blockHeight={blockHeight}
          blockGap={blockGap}
        />

        {Object.entries(roundGroups).map(([roundNum, roundItems]) => (
          <div
            key={roundNum}
            className="relative flex flex-col justify-center"
            style={{ minWidth: "240px", height: "100%" }}
          >
            {/* Elementy rundy rozłożone pionowo */}
            <div className="relative h-full flex flex-col justify-around">
              {roundItems.map((item, itemIdx) => {
                const colors = getBlockColors(item.color, item.type)
                const isSpecialSection =
                  item.type === "advancement" ||
                  item.type === "elimination" ||
                  item.type === "side_by_side_advancement" ||
                  item.type === "side_by_side_elimination"
                // --- Specjalny nagłówek dla awansu/eliminacji ---
                let customTitle = item.title
                if (isAdvancement(item.type)) {
                  customTitle = structure.find(s => s.type === "advancement")?.title || item.title
                }
                if (isElimination(item.type)) {
                  customTitle = structure.find(s => s.type === "elimination")?.title || item.title
                }
                if (item.type === "side_by_side_advancement" || item.type === "side_by_side_elimination") {
                  // Side-by-side layout for consolidated blocks
                  return (
                    <div key={itemIdx} className="relative z-10 mb-4">
                      {/* Nagłówek - tylko tytuł */}
                      <div className="text-center mb-3">
                        <div
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.text}`}
                        >
                          {customTitle}
                        </div>
                      </div>
                      {/* Side-by-side bloki */}
                      <div className="flex gap-2">
                        {/* Lewy blok */}
                        <div className="flex-1">
                          {(() => {
                            const bilans = item.leftBlock
                            const teams = getTeamsForState(bilans.wins, bilans.losses)
                            const expectedCount = getExpectedTeamCount(
                              bilans.wins,
                              bilans.losses,
                              totalTeams,
                              bilans.slots,
                            )
                            const previousResults = getPreviousRoundResults(bilans.wins, bilans.losses)
                            return (
                              <div
                                className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                              >
                                <div className="flex flex-col items-center">
                                  {renderTeamsInBlock(teams, expectedCount, previousResults, true)}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        {/* Prawy blok */}
                        <div className="flex-1">
                          {(() => {
                            const bilans = item.rightBlock
                            const teams = getTeamsForState(bilans.wins, bilans.losses)
                            const expectedCount = getExpectedTeamCount(
                              bilans.wins,
                              bilans.losses,
                              totalTeams,
                              bilans.slots,
                            )
                            const previousResults = getPreviousRoundResults(bilans.wins, bilans.losses)
                            return (
                              <div
                                className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                              >
                                <div className="flex flex-col items-center">
                                  {renderTeamsInBlock(teams, expectedCount, previousResults, true)}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                }
                // Standardowy layout dla pojedynczych bloków
                return (
                  <div key={itemIdx} className="relative z-10 mb-4">
                    {/* Nagłówek - tylko tytuł */}
                    <div className="text-center mb-3">
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.text}`}>
                        {customTitle}
                      </div>
                    </div>
                    {/* Bloki */}
                    {item.blocks.map((bilans: any, bilansIdx: number) => {
                      const key = `${bilans.wins}:${bilans.losses}`
                      if (isSpecialSection) {
                        const teams = getTeamsForState(bilans.wins, bilans.losses)
                        const expectedCount = getExpectedTeamCount(
                          bilans.wins,
                          bilans.losses,
                          totalTeams,
                          bilans.slots,
                        )
                        const previousResults = getPreviousRoundResults(bilans.wins, bilans.losses)
                        return (
                          <div key={key} className="relative">
                            <div
                              className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                            >
                              <div className="flex flex-col items-center">
                                {renderTeamsInBlock(teams, expectedCount, previousResults, true)}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      
                      const matchesForBlock = getMatchesForBlock(item.roundNum, bilans.wins, bilans.losses)
                      const expectedTeamCount = getExpectedTeamCount(
                        bilans.wins,
                        bilans.losses,
                        totalTeams,
                        bilans.slots,
                      )
                      
                      // Get teams for this state (either from history or current standings)
                      const teamsForState = getTeamsForState(bilans.wins, bilans.losses)
                      const previousResults = getPreviousRoundResults(bilans.wins, bilans.losses)
                      
                      // If we have completed matches for this block, show them
                      if (matchesForBlock.length > 0 && matchesForBlock.some(m => m.participant1 && m.participant2)) {
                        const expectedMatchCount = Math.floor(expectedTeamCount / 2)
                        return (
                          <div key={key} className="relative">
                            <div
                              className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                            >
                              <div className="flex flex-col items-center">
                                {renderMatchesInBlock(matchesForBlock, expectedMatchCount)}
                              </div>
                            </div>
                          </div>
                        )
                      } 
                      // If we have teams for this state (from completed matches or standings), show them
                      else if (teamsForState.length > 0) {
                        return (
                          <div key={key} className="relative">
                            <div
                              className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                            >
                              <div className="flex flex-col items-center">
                                {renderTeamsInBlock(teamsForState, expectedTeamCount, previousResults, true)}
                              </div>
                            </div>
                          </div>
                        )
                      } 
                      // Only show placeholders if we have no teams and no matches
                      else {
                        return (
                          <div key={key} className="relative">
                            <div
                              className={`${colors.bg} ${colors.border} rounded-lg border-2 p-3 min-h-[80px] backdrop-blur-sm`}
                            >
                              <div className="flex flex-col items-center">
                                {renderTeamsInBlock([], expectedTeamCount, previousResults, true)}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
