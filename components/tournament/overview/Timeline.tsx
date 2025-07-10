import React from "react";

interface TimelineEvent {
  date: string; // ISO string or date
  time?: string; // extracted time
  title: string;
  description: string;
}

interface TimelineProps {
  tournamentData: any;
}

// Dodaj funkcję do parsowania lokalnego czasu
function parseLocalDateTime(str: string) {
  if (!str) return new Date();
  // str: "YYYY-MM-DDTHH:mm"
  const [date, time] = str.split('T');
  if (!date || !time) return new Date(str);
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

const formatDateParts = (dateStr: string) => {
  if (!dateStr) return { day: "--", month: "---", weekday: "---" };
  const date = parseLocalDateTime(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const weekday = date.toLocaleString("en-US", { weekday: "short" });
  return { day, month, weekday };
};

const getTime = (dateTime: string) => {
  if (!dateTime) return undefined;
  const t = parseLocalDateTime(dateTime);
  return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Timeline: React.FC<TimelineProps> = ({ tournamentData }) => {
  // Fallbacky zgodne z domyślną logiką kreatora
  function getDateTimePlusMinutes(base: string | undefined, offset: number) {
    let d = base ? new Date(base) : new Date();
    d.setMinutes(d.getMinutes() + offset);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }

  // Fallback: registrationOpenDateTime = teraz jeśli brak
  const registrationOpen = tournamentData.registrationOpenDateTime || new Date().toISOString().slice(0, 16);
  // Fallback: readyOpen/readyClose jeśli brak w tournamentData
  const readyOpen = tournamentData.readyOpenDateTime || getDateTimePlusMinutes(registrationOpen, 4);
  const readyClose = tournamentData.readyCloseDateTime || getDateTimePlusMinutes(registrationOpen, 7);

  const events: TimelineEvent[] = [
    tournamentData.registrationOpenDateTime && {
      date: registrationOpen,
      time: getTime(registrationOpen),
      title: "Registration Opens",
      description: "Registration opens for the tournament."
    },
    tournamentData.registrationCloseDateTime && {
      date: tournamentData.registrationCloseDateTime,
      time: getTime(tournamentData.registrationCloseDateTime),
      title: "Registration Closes",
      description: "Registration closes for the tournament."
    },
    // Ready Window Open zawsze obecny
    {
      date: readyOpen,
      time: getTime(readyOpen),
      title: "Ready Window Opens",
      description: "Ready window opens for teams."
    },
    // Ready Window Close zawsze obecny
    {
      date: readyClose,
      time: getTime(readyClose),
      title: "Ready Window Closes",
      description: "Ready window closes for teams."
    },
    tournamentData.startDateTime && {
      date: tournamentData.startDateTime,
      time: getTime(tournamentData.startDateTime),
      title: "Tournament Start",
      description: "The tournament starts and you will get notified about your first match."
    }
  ].filter(Boolean) as TimelineEvent[];

  // Sort events by date ascending
  events.sort((a, b) => {
    const dateA = parseLocalDateTime(a.date).getTime();
    const dateB = parseLocalDateTime(b.date).getTime();
    return dateA - dateB;
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-white">Timeline</h3>
      <ul className="relative pl-8">
        {events.map((event, idx) => {
          const { day, month, weekday } = formatDateParts(event.date);
          return (
            <li key={idx} className="flex items-start mb-8 relative">
              {/* Vertical line */}
              {idx < events.length - 1 && (
                <span className="absolute left-8 top-12 h-full w-0.5 bg-[#333] z-0" />
              )}
              {/* Date box */}
              <div className="flex flex-col items-center z-10">
                <div className="bg-gradient-to-br from-[#23283a] to-[#1a1d2b] rounded-xl shadow-lg px-3 py-2 text-center mb-2 min-w-[56px] border-2 border-[#2d3347] relative transition-transform duration-200 hover:-translate-y-1">
                  <div className="text-[10px] text-blue-300 font-bold tracking-widest uppercase mb-0.5">{month}</div>
                  <div className="text-2xl font-extrabold text-white leading-none drop-shadow-sm">{day}</div>
                  {event.time && (
                    <div className="text-xs text-blue-200 font-mono mt-1 bg-[#23283a] rounded px-1 py-0.5 inline-block shadow-inner border border-[#2d3347]">{event.time}</div>
                  )}
                </div>
              </div>
              {/* Event content */}
              <div className="ml-6 flex-1">
                <div className="text-xs text-gray-400 mb-1">
                  {weekday} {event.time}
                </div>
                <div className="font-bold text-white">{event.title}</div>
                <div className="text-gray-400 text-sm">{event.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline; 