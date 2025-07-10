// Simple test script for Swiss calculations
function calculateMaxRounds(participantCount) {
  if (participantCount <= 4) return 2;
  if (participantCount <= 8) return 3;
  if (participantCount <= 16) return 5;
  if (participantCount <= 32) return 6;
  if (participantCount <= 64) return 7;
  if (participantCount <= 128) return 8;
  if (participantCount <= 256) return 9;
  return Math.ceil(Math.log2(participantCount)) + 1;
}

function getRequiredWinsLosses(participantCount) {
  if (participantCount <= 4) return { wins: 1, losses: 1 };
  if (participantCount <= 8) return { wins: 2, losses: 2 };
  if (participantCount <= 16) return { wins: 3, losses: 3 };
  if (participantCount <= 32) return { wins: 4, losses: 4 };
  if (participantCount <= 64) return { wins: 5, losses: 5 };
  if (participantCount <= 128) return { wins: 6, losses: 6 };
  if (participantCount <= 256) return { wins: 7, losses: 7 };
  return { wins: Math.ceil(Math.log2(participantCount)), losses: Math.ceil(Math.log2(participantCount)) };
}

function calculateMatchesPerRound(participantCount, round) {
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  let players = Array.from({ length: participantCount }, (_, i) => ({ wins: 0, losses: 0 }));
  
  for (let r = 1; r < round; r++) {
    const stillPlaying = players.filter(p => p.wins < requiredWins && p.losses < requiredLosses);
    const activePlayers = stillPlaying.length;
    
    // Jeśli nie ma wystarczająco graczy do sparowania, zakończ
    if (activePlayers < 2) {
      return 0;
    }
    
    const matchesInThisRound = Math.floor(activePlayers / 2);
    
    for (let i = 0; i < stillPlaying.length; i++) {
      if (i < matchesInThisRound) {
        stillPlaying[i].wins += 1;
      } else if (i < matchesInThisRound * 2) {
        stillPlaying[i].losses += 1;
      }
      if (activePlayers % 2 === 1 && i === stillPlaying.length - 1) {
        stillPlaying[i].wins += 1;
      }
    }
  }
  
  const stillPlaying = players.filter(p => p.wins < requiredWins && p.losses < requiredLosses);
  const activePlayers = stillPlaying.length;
  
  // Jeśli nie ma wystarczająco graczy do sparowania, zwróć 0
  if (activePlayers < 2) {
    return 0;
  }
  
  return Math.floor(activePlayers / 2);
}

function testSwissCalculations(participantCount) {
  const maxRounds = calculateMaxRounds(participantCount);
  const { wins: requiredWins, losses: requiredLosses } = getRequiredWinsLosses(participantCount);
  
  console.log(`=== Swiss Calculations for ${participantCount} participants ===`);
  console.log(`Max rounds: ${maxRounds}`);
  console.log(`Required wins: ${requiredWins}, Required losses: ${requiredLosses}`);
  console.log('Matches per round:');
  
  for (let round = 1; round <= maxRounds; round++) {
    const matchesInRound = calculateMatchesPerRound(participantCount, round);
    console.log(`  Round ${round}: ${matchesInRound} matches`);
  }
  console.log('=====================================');
}

// Test different participant counts
testSwissCalculations(16);
testSwissCalculations(8);
testSwissCalculations(32); 