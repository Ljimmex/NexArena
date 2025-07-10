import React from "react";

interface MapType {
  id: string;
  name: string;
  image?: string;
  game?: string;
  selected?: boolean;
}

interface GameSettingsProps {
  maps: MapType[];
}

const GameSettings: React.FC<GameSettingsProps> = ({ maps }) => {
  return (
    <div className="bg-[#181c23] rounded-lg p-6 border border-[#333] mb-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Game Settings</h3>
      <div className="text-white text-sm mb-2">Maps in this tournament ({maps.length}):</div>
      {maps.length === 0 ? (
        <div className="text-gray-400">No maps selected.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {maps.map((map) => (
            <div key={map.id} className="flex flex-col items-center bg-[#23283a] rounded-lg p-3 shadow border border-[#2d3347]">
              {map.image ? (
                <img
                  src={map.image}
                  alt={map.name}
                  className="w-full h-24 object-cover rounded-md mb-2 border border-[#333]"
                  style={{ maxWidth: '120px', minHeight: '80px', background: '#181c23' }}
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-[#181c23] rounded-md mb-2 text-gray-400 border border-[#333]" style={{ maxWidth: '120px', minHeight: '80px' }}>
                  No image
                </div>
              )}
              <span className="text-white text-sm font-medium text-center truncate w-full" title={map.name}>{map.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameSettings; 