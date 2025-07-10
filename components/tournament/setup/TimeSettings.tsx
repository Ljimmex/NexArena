import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export interface TimeSettingsProps {
  startDateTime: string;
  setStartDateTime: (val: string) => void;
  registrationOpenDateTime: string;
  setRegistrationOpenDateTime: (val: string) => void;
  registrationCloseDateTime: string;
  setRegistrationCloseDateTime: (val: string) => void;
  readyOpenDateTime: string;
  setReadyOpenDateTime: (val: string) => void;
  readyCloseDateTime: string;
  setReadyCloseDateTime: (val: string) => void;
}

export default function TimeSettings({
  startDateTime,
  setStartDateTime,
  registrationOpenDateTime,
  setRegistrationOpenDateTime,
  registrationCloseDateTime,
  setRegistrationCloseDateTime,
  readyOpenDateTime,
  setReadyOpenDateTime,
  readyCloseDateTime,
  setReadyCloseDateTime
}: TimeSettingsProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const fields = [
      { label: "Registration Opens", value: registrationOpenDateTime },
      { label: "Registration Ends", value: registrationCloseDateTime },
      { label: "Confirmation Opens", value: readyOpenDateTime },
      { label: "Confirmation Closes", value: readyCloseDateTime },
      { label: "Tournament Start", value: startDateTime },
    ];
    if (fields.some(f => !f.value)) return;
    const values = fields.map(f => f.value);
    const unique = new Set(values);
    if (unique.size !== values.length) {
      setError("All dates must be unique.");
      return;
    }
    for (let i = 0; i < fields.length - 1; i++) {
      if (fields[i].value >= fields[i+1].value) {
        setError(`${fields[i].label} must be before ${fields[i+1].label}.`);
        return;
      }
    }
  }, [registrationOpenDateTime, registrationCloseDateTime, readyOpenDateTime, readyCloseDateTime, startDateTime]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-white">Tournament Schedule</h3>
        <p className="text-sm text-gray-400 mb-6">
          Set the dates and times for your tournament. All fields require both date and time.
        </p>
        {error && (
          <div className="text-red-500 font-semibold mb-4">{error}</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tournament Start */}
        <div className="space-y-4 p-6 border border-[#333] rounded-xl bg-[#20232d] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-yellow-500" />
            <h4 className="font-semibold text-lg text-white">Tournament Start</h4>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="startDateTime"
              type="datetime-local"
              value={startDateTime}
              onChange={e => setStartDateTime(e.target.value)}
              className="bg-[#23283a] border-[#444] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Registration Opens */}
        <div className="space-y-4 p-6 border border-[#333] rounded-xl bg-[#20232d] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h4 className="font-semibold text-lg text-white">Registration Opens</h4>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationOpenDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="registrationOpenDateTime"
              type="datetime-local"
              value={registrationOpenDateTime}
              onChange={e => {
                setRegistrationOpenDateTime(e.target.value);
                if (e.target.value === startDateTime) {
                  const d = new Date(e.target.value);
                  d.setDate(d.getDate() + 1);
                  d.setSeconds(0, 0);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  const toLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  setStartDateTime(toLocal(d));
                }
              }}
              className="bg-[#23283a] border-[#444] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        {/* Registration Closes */}
        <div className="space-y-4 p-6 border border-[#333] rounded-xl bg-[#20232d] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-red-400" />
            <h4 className="font-semibold text-lg text-white">Registration Closes</h4>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationCloseDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="registrationCloseDateTime"
              type="datetime-local"
              value={registrationCloseDateTime}
              onChange={e => setRegistrationCloseDateTime(e.target.value)}
              className="bg-[#23283a] border-[#444] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
        {/* Ready Window Opens */}
        <div className="space-y-4 p-6 border border-[#333] rounded-xl bg-[#20232d] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-green-400" />
            <h4 className="font-semibold text-lg text-white">Ready Window Opens</h4>
          </div>
          <div className="space-y-2">
            <Label htmlFor="readyOpenDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="readyOpenDateTime"
              type="datetime-local"
              value={readyOpenDateTime}
              onChange={e => setReadyOpenDateTime(e.target.value)}
              className="bg-[#23283a] border-[#444] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
        {/* Ready Window Closes */}
        <div className="space-y-4 p-6 border border-[#333] rounded-xl bg-[#20232d] shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <h4 className="font-semibold text-lg text-white">Ready Window Closes</h4>
          </div>
          <div className="space-y-2">
            <Label htmlFor="readyCloseDateTime" className="text-gray-300">Date & Time</Label>
            <Input
              id="readyCloseDateTime"
              type="datetime-local"
              value={readyCloseDateTime}
              onChange={e => setReadyCloseDateTime(e.target.value)}
              className="bg-[#23283a] border-[#444] text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}