import React, { useState } from "react";

interface Admin {
  name: string;
  role: string;
  avatar?: string;
}

interface AdminsProps {
  admins: Admin[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Mod",
  caster: "Caster",
};

const Admins: React.FC<AdminsProps> = ({ admins }) => {
  const [showAll, setShowAll] = useState(false);
  const maxVisible = 4;
  const visibleAdmins = showAll ? admins : admins.slice(0, maxVisible);
  const hasMore = admins.length > maxVisible;

  return (
    <div className="rounded-lg p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Admins{` (${admins.length})`}
      </h3>
      <div className="flex flex-col gap-2">
        {visibleAdmins.map((admin, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-[#222] last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center overflow-hidden">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{admin.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white leading-tight">{admin.name}</span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#23272f] text-blue-300 uppercase font-semibold">
                    {ROLE_LABELS[admin.role] || admin.role}
                  </span>
                  {/* Możesz dodać inne informacje, np. "No game account" */}
                  <span className="text-gray-500">No game account</span>
                </span>
              </div>
            </div>
            {/* Trzy kropki lub inne akcje można dodać tutaj */}
            <span className="text-gray-400 text-xl cursor-pointer">&#8230;</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          className="mt-4 w-full py-2 border border-[#333] rounded-lg text-white font-semibold hover:bg-[#23272f] transition"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
};

export default Admins; 