import React, { useRef } from "react";
import { Camera } from "lucide-react";

interface AppearanceSelectionProps {
  backgroundImage: string;
  setBackgroundImage: (value: string) => void;
  tournamentLogo: string;
  setTournamentLogo: (value: string) => void;
  organizerLogo: string;
  setOrganizerLogo: (value: string) => void;
}

export const AppearanceSelection: React.FC<AppearanceSelectionProps> = ({
  backgroundImage,
  setBackgroundImage,
  tournamentLogo,
  setTournamentLogo,
  organizerLogo,
  setOrganizerLogo,
}) => {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setter(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const logoInputRef = useRef<HTMLInputElement>(null);
  const orgLogoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-12 px-6 py-8 max-w-5xl mx-auto h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-1 text-white">Logo</h2>
        <p className="text-base text-blue-200 mb-4 text-center">
          Logo jest wyświetlane po lewej stronie baneru oraz w powiadomieniach o turnieju.
        </p>
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            <div
              className="absolute inset-0 rounded-full border border-dashed border-blue-400 bg-[#181c23] cursor-pointer flex items-center justify-center"
              onClick={() => logoInputRef.current?.click()}
              tabIndex={0}
              role="button"
              aria-label="Wgraj logo"
            >
              {tournamentLogo ? (
                <img
                  src={tournamentLogo}
                  alt="Podgląd logo turnieju"
                  className="rounded-full object-cover w-full h-full"
                />
              ) : null}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#181c23] shadow cursor-pointer"
              onClick={() => logoInputRef.current?.click()}
              tabIndex={-1}
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFileChange(e, setTournamentLogo)}
            />
          </div>
          <p className="text-xs text-blue-300 mt-2 text-center">
            Zalecamy obraz o wymiarach <b>256 × 256</b> pikseli.
          </p>
        </div>
      </div>

      {/* Logo organizatora */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-1 text-white">Logo organizatora</h2>
        <p className="text-base text-blue-200 mb-4 text-center">
          Logo organizatora pojawia się w nagłówku oraz informacjach o turnieju.
        </p>
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center" style={{ width: 90, height: 90 }}>
            <div
              className="absolute inset-0 rounded-full border border-dashed border-blue-400 bg-[#181c23] cursor-pointer flex items-center justify-center"
              onClick={() => orgLogoInputRef.current?.click()}
              tabIndex={0}
              role="button"
              aria-label="Wgraj logo organizatora"
            >
              {organizerLogo ? (
                <img
                  src={organizerLogo}
                  alt="Podgląd logo organizatora"
                  className="rounded-full object-cover w-full h-full"
                />
              ) : null}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-800 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#181c23] shadow cursor-pointer"
              onClick={() => orgLogoInputRef.current?.click()}
              tabIndex={-1}
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={orgLogoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFileChange(e, setOrganizerLogo)}
            />
          </div>
          <p className="text-xs text-blue-300 mt-2 text-center">
            Zalecamy obraz o wymiarach <b>64 × 64</b> piksele.
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-white">Baner</h2>
        <p className="text-base text-blue-200 mb-4 text-center">
          Baner jest wyświetlany na górze strony turnieju.
        </p>
        <div
          className="relative border border-dashed border-blue-400 rounded-lg bg-[#181c23] h-40 w-full max-w-3xl flex flex-col justify-center items-center cursor-pointer"
          style={{ minHeight: 140 }}
          onClick={() => bannerInputRef.current?.click()}
        >
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt="Podgląd baneru"
              className="w-full max-h-40 object-cover rounded"
              style={{ maxWidth: 600 }}
            />
          ) : (
            <span className="text-blue-300">Brak wybranego baneru</span>
          )}
          <button
            type="button"
            className="absolute top-4 right-4 bg-blue-800 border border-blue-400 px-4 py-2 rounded text-white hover:bg-blue-900 transition"
            onClick={(e) => {
              e.stopPropagation();
              bannerInputRef.current?.click();
            }}
          >
            {backgroundImage ? "Zmień baner" : "Wgraj baner"}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, setBackgroundImage)}
          />
        </div>
        <p className="text-xs text-blue-300 mt-2 text-center">
          Zalecamy obraz o wymiarach <b>2400 × 600</b> pikseli.
        </p>
      </div>
    </div>
  );
};