import React from "react";

interface OrganizerDescriptionProps {
  description: string;
  logo?: string;
  name?: string;
  contact?: string;
  socials?: {
    [key: string]: string | undefined;
    discord?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    twitch?: string;
    kick?: string;
  };
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  discord: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#5865F2]" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.2a.117.117 0 0 0-.124.06c-.537.96-1.13 2.22-1.5 3.24-1.447-.217-2.885-.217-4.317 0-.377-1.02-.97-2.28-1.51-3.24a.115.115 0 0 0-.123-.06A19.736 19.736 0 0 0 3.677 4.369a.105.105 0 0 0-.047.04C.533 9.09-.32 13.58.099 18.02a.12.12 0 0 0 .045.082c2.052 1.507 4.042 2.422 5.992 3.03a.116.116 0 0 0 .127-.043c.462-.63.873-1.295 1.226-1.994a.112.112 0 0 0-.065-.16c-.652-.247-1.27-.548-1.87-.892a.117.117 0 0 1-.012-.194c.126-.094.252-.192.372-.291a.112.112 0 0 1 .114-.013c3.927 1.793 8.18 1.793 12.06 0a.112.112 0 0 1 .115.012c.12.099.246.197.372.291a.117.117 0 0 1-.011.194c-.6.344-1.219.645-1.87.893a.112.112 0 0 0-.066.159c.36.699.772 1.364 1.227 1.994a.115.115 0 0 0 .127.043c1.95-.608 3.94-1.523 5.992-3.03a.115.115 0 0 0 .045-.081c.5-5.177-.838-9.637-3.27-13.611a.104.104 0 0 0-.048-.04ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419Zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419Z" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#1877F3]" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M15.117 8.667h-1.2V7.6c0-.293.24-.533.533-.533h.667V5.333h-1.2a2.133 2.133 0 0 0-2.133 2.134v1.2h-1.2v2h1.2v5.333h2.133V10.667h1.2l.267-2Z" fill="currentColor" />
    </svg>
  ),
  instagram: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#E4405F]" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0 5.933a2.333 2.333 0 1 1 0-4.666 2.333 2.333 0 0 1 0 4.666Zm4.267-6.066a.867.867 0 1 1-1.733 0 .867.867 0 0 1 1.733 0ZM17.6 7.2a3.2 3.2 0 0 0-3.2-3.2H9.6A3.2 3.2 0 0 0 6.4 7.2v4.8a3.2 3.2 0 0 0 3.2 3.2h4.8a3.2 3.2 0 0 0 3.2-3.2V7.2Zm-1.067 4.8a2.133 2.133 0 0 1-2.133 2.133H9.6A2.133 2.133 0 0 1 7.467 12V7.2A2.133 2.133 0 0 1 9.6 5.067h4.8A2.133 2.133 0 0 1 16.533 7.2v4.8Z" fill="currentColor" />
    </svg>
  ),
  x: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47A.75.75 0 0 0 6.47 7.53L10.94 12l-4.47 4.47a.75.75 0 1 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06Z" fill="currentColor" />
    </svg>
  ),
  twitch: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#9147FF]" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M4 4v16h4v4h4v-4h4v-4h4V4H4Zm12 8h-2v2h2v-2Zm-4 0H8v2h2v-2Z" fill="currentColor" />
    </svg>
  ),
  kick: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#53FC18]" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#23272A" />
      <path d="M7 7h10v10H7V7Zm2 2v6h6V9H9Z" fill="currentColor" />
    </svg>
  ),
};

export default function OrganizerDescription({ description, logo, name, contact, socials }: OrganizerDescriptionProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 py-8 px-6">
      {logo && (
        <img
          src={logo}
          alt={name || "Organizer Logo"}
          className="w-32 h-24 object-contain shadow-lg mb-4 md:mb-0"
        />
      )}
      <div className="flex-1 w-full">
        <h3 className="text-2xl font-bold mb-1 text-white">{name || "Organizator"}</h3>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {contact && (
            <a
              href={contact.startsWith("http") ? contact : `mailto:${contact}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#23272A] text-white px-4 py-2 rounded-full font-medium shadow hover:bg-[#333] transition"
            >
              Skontaktuj się
            </a>
          )}
          {socials && Object.entries(socials).map(([key, url]) =>
            url && SOCIAL_ICONS[key] ? (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#23272A] hover:bg-[#333] transition shadow"
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {SOCIAL_ICONS[key]}
              </a>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
} 