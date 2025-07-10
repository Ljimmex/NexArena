"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { predefinedTeams } from "@/data/teamsData";
import { Clock, Trophy, Users, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { games } from "@/data/gamesData";
import SingleEliminationIcon from "@/components/icons/SingleEliminationIcon";
import DoubleEliminationIcon from "@/components/icons/DoubleEliminationIcon";
import RoundRobinIcon from "@/components/icons/RoundRobinIcon";
import SwissBracketIcon from "@/components/icons/SwissBracketIcon";

// W interfejsie props dodaj nowe pola
interface TournamentHeaderProps {
  tournamentName: string;
  tournamentLogo?: string;
  game?: string;
  gameIcon?: string;
  teamCount?: number;
  format?: string;
  formatsArray?: string[];
  organizer?: string;
  organizerLogo?: string;
  backgroundImage?: string;
  teams?: Array<{id: string; name: string; logo: string}>;
  teamFormat?: string;
  substituteCount?: number;
  startDate?: string;
  startTime?: string;
  prizePool?: string;
  prizeDistribution?: string;
  registeredTeams?: number;
  maxTeams?: number;
  eventName?: string;
  registrationEndDate?: string;
  registrationEndTime?: string;
  confirmationEndDate?: string;
  confirmationEndTime?: string;
}

export default function TournamentHeader({
  tournamentName,
  tournamentLogo,
  game = "cs2",
  gameIcon,
  format = "Double Elimination",
  formatsArray,
  organizer = "Tournament Organizer",
  organizerLogo,
  backgroundImage,
  teamFormat = "5v5",
  substituteCount = undefined,
  startDate = "",
  startTime = "18:00",
  registrationEndDate = "",
  confirmationEndDate = "",
  prizePool = "$64",
  registeredTeams = 12,
  maxTeams = 64,
}: TournamentHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: string; hours: string; minutes: string; seconds: string }>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  // Funkcja do formatowania liczby jako dwucyfrowej
  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  // Obliczanie pozostałego czasu do rozpoczęcia turnieju
  useEffect(() => {
    if (!startDate || !startTime) return;

    const calculateTimeLeft = () => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const targetDate = new Date(startDate);
      targetDate.setHours(hours, minutes, 0);
      
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }
      
      const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({
        days: formatNumber(daysLeft),
        hours: formatNumber(hoursLeft),
        minutes: formatNumber(minutesLeft),
        seconds: formatNumber(secondsLeft)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [startDate, startTime]);

  // Formatowanie daty rozpoczęcia
  const formattedDate = () => {
    if (!startDate) return "";
    
    const date = new Date(startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year} ${startTime}`;
  };

  // Sprawdzenie czy są wolne miejsca
  const hasAvailableSpots = registeredTeams < maxTeams;

  // Liczba drużyn rezerwowych (jeśli przekazana lub wyliczona z selectedTeams)
  let substituteTeams = typeof substituteCount === 'number' ? substituteCount : 0;
  let registeredTeamsCount = typeof registeredTeams === 'number' ? registeredTeams : 0;
  // NIE nadpisuj registeredTeamsCount localStorage, jeśli props jest podany!
  // Preferuj osobną listę substituteTeams, jeśli istnieje w localStorage
  if ((typeof window !== 'undefined')) {
    try {
      const data = localStorage.getItem('tournamentData');
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof substituteCount !== 'number') {
          if (Array.isArray(parsed.substituteTeams)) {
            substituteTeams = parsed.substituteTeams.length;
          } else if (Array.isArray(parsed.selectedTeams)) {
            substituteTeams = parsed.selectedTeams.filter((t: any) => t.status === 'substitute').length;
          }
        }
      }
    } catch {}
  }
  // Jeśli slotów registered/substitute jest więcej niż maxTeams, pokazuj registeredTeamsCount jako max
  if (registeredTeamsCount + substituteTeams > maxTeams) {
    registeredTeamsCount = maxTeams - substituteTeams;
  }

  // Znajdź pełną nazwę gry i ikonę na podstawie ID gry
  const gameData = games.find(g => g.id === game) || { name: game, icon: gameIcon || "/games/css2.png" };
  const fullGameName = gameData.name;
  const gameIconPath = gameData.icon;

  return (
    <div className="relative w-full overflow-hidden rounded-lg mb-(-8)">
      {/* Tło nagłówka */}
      <div className="relative w-full h-40 overflow-hidden bg-purple-900">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-800/70 to-purple-900/90"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-purple-900/50 to-transparent" />
      </div>

      {/* Zawartość nagłówka */}
      <div className="relative z-10 px-6 py-5 flex flex-col -mt-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            {/* Logo gry i nazwa */}
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-sm">
                <img 
                  src={gameIconPath} 
                  alt={fullGameName} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="ml-3 text-white font-medium">
                {fullGameName}
              </div>
            </div>

            {/* Typ turnieju */}
            <div className="bg-purple-800/80 backdrop-blur-sm px-4 py-1.5 rounded-md flex items-center">
              {/* Render icons for each format if formatsArray is provided */}
              {formatsArray && formatsArray.length > 1 && (
                <span className="flex items-center gap-1 mr-2">
                  {formatsArray.map((f, idx) => (
                    <span key={f + idx} className="flex items-center">
                      {f.toLowerCase().includes('swiss') && <SwissBracketIcon className="h-4 w-4 mr-0.5" />}
                      {f.toLowerCase().includes('single elimination') && <SingleEliminationIcon className="h-4 w-4 mr-0.5" />}
                      {f.toLowerCase().includes('double elimination') && <DoubleEliminationIcon className="h-4 w-4 mr-0.5" />}
                      {f.toLowerCase().includes('round robin') && <RoundRobinIcon className="h-4 w-4 mr-0.5" />}
                      {idx < formatsArray.length - 1 && <span className="mx-0.5 text-white font-bold">+</span>}
                    </span>
                  ))}
                </span>
              )}
              <span className="text-sm text-white font-medium">
                {format}
              </span>
            </div>
          </div>

          {/* Przycisk rejestracji */}
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm">Rejestracja otwarta</span>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Register
            </Button>
          </div>
        </div>

        {/* Główne informacje o turnieju */}
        <div className="flex justify-between items-start mt-2">
          <div className="flex items-start gap-6">
            {/* Logo turnieju */}
            {tournamentLogo && (
              <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-sm mr-4">
                <img 
                  src={tournamentLogo} 
                  alt={tournamentName} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white leading-tight">{tournamentName}</span>
              <div className="flex flex-row gap-4 items-center text-sm text-gray-300">
                <span>
                  {teamFormat}
                  {typeof substituteCount === 'number' && substituteCount > 0 ? ` (+${substituteCount})` : ''}
                </span>
              </div>
            </div>
          </div>
          
          {/* Timer do rozpoczęcia turnieju - przesunięty do góry */}
          <div className="flex items-center gap-3 -mt-2">
            <div className="flex flex-col items-center">
              <div className="bg-purple-900/80 backdrop-blur-sm px-3 py-2 rounded-md text-white font-bold text-xl">
                {timeLeft.days || "00"}
              </div>
              <span className="text-xs text-gray-300 mt-1">Days</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-900/80 backdrop-blur-sm px-3 py-2 rounded-md text-white font-bold text-xl">
                {timeLeft.hours}
              </div>
              <span className="text-xs text-gray-300 mt-1">Hours</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-900/80 backdrop-blur-sm px-3 py-2 rounded-md text-white font-bold text-xl">
                {timeLeft.minutes}
              </div>
              <span className="text-xs text-gray-300 mt-1">Minutes</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-900/80 backdrop-blur-sm px-3 py-2 rounded-md text-white font-bold text-xl">
                {timeLeft.seconds}
              </div>
              <span className="text-xs text-gray-300 mt-1">Seconds</span>
            </div>
          </div>
        </div>
        
        {/* Pozostała zawartość - połączona z górnym prostokątem */}
        <div className="flex justify-between items-center mt-2 bg-[#111]/80 backdrop-blur-sm p-4 -mx-6 px-6 w-[calc(100%+48px)]">
          <div className="flex items-center gap-8">
            {/* Zarejestrowane drużyny - dynamiczna liczba */}
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-sm">Registered Teams</div>
              <div className="text-white font-medium">
                {registeredTeamsCount}/{maxTeams}
                {substituteTeams > 0 && (
                  <span className="ml-1 text-purple-400 text-sm font-semibold">+{substituteTeams}</span>
                )}
              </div>
            </div>
            
            {/* Rozmiar drużyny */}
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-sm">Team Size</div>
              <div className="text-white font-medium">
                {teamFormat}
                {typeof substituteCount === 'number' && substituteCount > 0 ? ` (+${substituteCount})` : ''}
              </div>
            </div>
            
            {/* Pierwsza nagroda - zaktualizowana sekcja */}
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-sm">Prize Pool</div>
              <div className="text-white font-medium">{prizePool}</div>
            </div>
          </div>
          
          {/* Organizator */}
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-sm">Hosted by:</div>
            <div className="flex items-center gap-2">
              {organizerLogo ? (
                <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-[#222]">
                  <img 
                    src={organizerLogo} 
                    alt={organizer} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-[#222]">
                  <span className="text-xl font-bold text-white">{organizer.charAt(0)}</span>
                </div>
              )}
              <span className="text-white font-medium">{organizer}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}