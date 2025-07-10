"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Trophy, X, Shuffle, PlusCircle, Users, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Participant } from "@/types/participants"
import { predefinedTeams, TeamData } from "@/data/teamsData"
import Image from "next/image"

export default function TeamSelector({
  selectedTeams = [],
  setSelectedTeams,
  substituteTeams = [],
  setSubstituteTeams,
  teamCount,
  customTeamCount,
  customCount
}: {
  selectedTeams?: Participant[];
  setSelectedTeams: React.Dispatch<React.SetStateAction<Participant[]>>;
  substituteTeams?: Participant[];
  setSubstituteTeams: React.Dispatch<React.SetStateAction<Participant[]>>;
  teamCount: string;
  customTeamCount: boolean;
  customCount: number;
}) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Oblicz wymaganą liczbę drużyn na podstawie propsów
  const requiredTeamCount = customTeamCount ? customCount : parseInt(teamCount);
  
  // Filtruj drużyny na podstawie wyszukiwania
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return predefinedTeams;
    
    return predefinedTeams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  
  // Dodaj drużynę do odpowiedniej listy
  const addTeam = (team: TeamData) => {
    if (selectedTeams.some(t => t.id === team.id) || substituteTeams.some(t => t.id === team.id)) return;
    if (selectedTeams.length < requiredTeamCount) {
      setSelectedTeams([...selectedTeams, { ...team, status: 'registered' }]);
    } else {
      setSubstituteTeams([...substituteTeams, { ...team, status: 'substitute' }]);
    }
  };
  
  // Usuwanie z głównych
  const removeTeam = (teamId: string) => {
    setSelectedTeams(selectedTeams.filter(team => team.id !== teamId));
  };
  // Usuwanie z rezerwowych
  const removeSubstitute = (teamId: string) => {
    setSubstituteTeams(substituteTeams.filter(team => team.id !== teamId));
  };
  
  // Funkcja do dodawania losowych drużyn
  const addRandomTeams = () => {
    const remainingSlots = requiredTeamCount - selectedTeams.length;
    if (remainingSlots <= 0) return;

    // Get teams that aren't already selected
    const availableTeams = predefinedTeams.filter(
      team => !selectedTeams.some(t => t.id === team.id) && !substituteTeams.some(t => t.id === team.id)
    );

    const shuffled = [...availableTeams].sort(() => 0.5 - Math.random());
    const teamsToAdd = shuffled.slice(0, remainingSlots);
    const extraTeams = shuffled.slice(remainingSlots);

    setSelectedTeams([
      ...selectedTeams,
      ...teamsToAdd.map(team => ({ ...team, status: 'registered' as 'registered' }))
    ]);
    setSubstituteTeams([
      ...substituteTeams,
      ...extraTeams.map(team => ({ ...team, status: 'substitute' as 'substitute' }))
    ]);
  };
  
  // Przetasuj drużyny
  const shuffleTeams = () => {
    const shuffled = [...selectedTeams]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setSelectedTeams(shuffled)
  }

  // Filtruj backupy do osobnej sekcji
  // const backupTeams = useMemo(() => {
  //   // Backup teams to te, które nie są wybrane jako główne (czyli nie są w selectedTeams)
  //   return predefinedTeams.filter(team => !selectedTeams.some(t => t.id === team.id));
  // }, [selectedTeams]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-xl font-bold text-yellow-500">Tournament Teams</h3>
        <div className="ml-auto bg-yellow-500 text-black font-medium px-3 py-1 rounded-full text-sm">
          {selectedTeams.length}/{requiredTeamCount} Selected
        </div>
      </div>
      
      <p className="text-gray-400">Select teams to compete in your tournament</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lewa kolumna - wyszukiwanie i lista drużyn */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-[#333]"
            />
          </div>
          
          <div className="h-[400px] overflow-y-auto border border-[#333] rounded-md bg-[#0a0a0a] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
              {filteredTeams
                .filter(team => !selectedTeams.some(t => t.id === team.id))
                .map((team) => {
                  // const isSelected = selectedTeams.some(t => t.id === team.id); // już niepotrzebne
                  const isDisabled = false; // nie blokujemy dodawania
                  return (
                    <div 
                      key={team.id}
                      className={`flex items-center justify-between p-3 rounded-md border border-[#222] bg-[#111] hover:border-[#444]`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#222] rounded-md overflow-hidden flex items-center justify-center">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{team.name}</div>
                        </div>
                      </div>
                      
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-[#222] hover:bg-[#333] h-8 w-8"
                        onClick={() => addTeam(team)}
                        disabled={isDisabled}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        
        {/* Prawa kolumna - wybrane drużyny */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h4 className="font-medium">Selected Teams</h4>
          </div>
          
          <div className="h-[400px] overflow-y-auto border border-[#333] rounded-md bg-[#0a0a0a] custom-scrollbar">
            {selectedTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Users className="h-12 w-12 text-gray-600 mb-2" />
                <p className="text-gray-500">No teams selected yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Select teams from the list or add random teams
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 bg-[#222] hover:bg-[#333] border-[#444]"
                  onClick={addRandomTeams}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Random Teams
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {selectedTeams.map((team, index) => (
                  <div 
                    key={team.id}
                    className="flex items-center justify-between p-2 rounded-md bg-[#1a1a1a] border border-[#333] hover:border-[#444]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-[#333] text-xs font-medium px-2 py-0.5 rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="w-6 h-6 bg-[#222] rounded-md overflow-hidden flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                        )}
                      </div>
                      <div className="font-medium text-sm">{team.name}</div>
                      {/* Przywróć labelkę Registered */}
                      {team.status === 'substitute' && (
                        <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-purple-900 text-purple-300">
                          Substitute
                        </span>
                      )}
                      {team.status === 'registered' && (
                        <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-yellow-700 text-yellow-200">
                          Registered
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-900/20 hover:text-red-500"
                      onClick={() => removeTeam(team.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Sekcja rezerwowych drużyn */}
          {substituteTeams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mt-4">
                <Trophy className="h-4 w-4 text-purple-400" />
                <h4 className="font-medium text-purple-300">Substitute Teams</h4>
              </div>
              <div className="p-2 space-y-2">
                {substituteTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-2 rounded-md bg-[#18112a] border border-[#333] hover:border-[#444]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-[#333] text-xs font-medium px-2 py-0.5 rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="w-6 h-6 bg-[#222] rounded-md overflow-hidden flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                        )}
                      </div>
                      <div className="font-medium text-sm">{team.name}</div>
                      <span className="ml-2 text-xs font-semibold rounded px-2 py-0.5 capitalize bg-purple-900 text-purple-300">
                        Substitute
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-900/20 hover:text-red-500"
                      onClick={() => removeSubstitute(team.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedTeams.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-[#222] hover:bg-[#333] border-[#444]"
              onClick={shuffleTeams}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle Teams
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}