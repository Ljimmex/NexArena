import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface HostTabProps {
  organizerName: string;
  setOrganizerName: (v: string) => void;
  organizerDescription: string;
  setOrganizerDescription: (v: string) => void;
  organizerContact: string;
  setOrganizerContact: (v: string) => void;
  organizerSocials: {
    [key: string]: string;
    discord: string;
    facebook: string;
    instagram: string;
    x: string;
    twitch: string;
    kick: string;
  };
  setOrganizerSocials: (v: any) => void;
}

const SOCIALS = [
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/your-server" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/your-page" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/your-profile" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/your-profile" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/your-channel" },
  { key: "kick", label: "Kick", placeholder: "https://kick.com/your-channel" },
];

const HostTab: React.FC<HostTabProps> = ({
  organizerName,
  setOrganizerName,
  organizerDescription,
  setOrganizerDescription,
  organizerContact,
  setOrganizerContact,
  organizerSocials,
  setOrganizerSocials,
}) => {
  return (
    <div className="space-y-6 bg-[#181c23] border border-[#333] rounded-md p-6 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Nazwa organizatora</label>
          <Input value={organizerName} onChange={e => setOrganizerName(e.target.value)} placeholder="Nazwa organizatora" className="bg-[#23272f] border-[#333] text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Kontakt (np. Discord, e-mail)</label>
          <Input value={organizerContact} onChange={e => setOrganizerContact(e.target.value)} placeholder="https://discord.gg/your-server lub mailto:example@mail.com" className="bg-[#23272f] border-[#333] text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Opis organizatora</label>
        <Textarea value={organizerDescription} onChange={e => setOrganizerDescription(e.target.value)} placeholder="Opis organizatora, np. kim jesteście, doświadczenie, misja..." className="bg-[#23272f] border-[#333] text-white min-h-[80px]" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Social media</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIALS.map(social => (
            <div key={social.key}>
              <label className="block text-xs font-semibold mb-1 text-gray-400">{social.label}</label>
              <Input
                value={organizerSocials[social.key] || ""}
                onChange={e => setOrganizerSocials((prev: any) => ({ ...prev, [social.key]: e.target.value }))}
                placeholder={social.placeholder}
                className="bg-[#23272f] border-[#333] text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostTab; 