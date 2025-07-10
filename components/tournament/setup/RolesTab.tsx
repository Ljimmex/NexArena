import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "caster", label: "Caster" },
  { value: "unassigned", label: "Unassigned" },
];

export interface RoleEntry {
  id: number;
  name: string;
  role: string;
}

export interface RolesTabProps {
  roles: RoleEntry[];
  setRoles: React.Dispatch<React.SetStateAction<RoleEntry[]>>;
}

const RolesTab: React.FC<RolesTabProps> = ({ roles, setRoles }) => {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState(ROLE_OPTIONS[0].value);
  const [editModal, setEditModal] = React.useState<{ open: boolean; role?: RoleEntry }>({ open: false });

  const addRole = () => {
    if (!name.trim()) return;
    setRoles([...roles, { id: Date.now(), name, role }]);
    setName("");
    setRole(ROLE_OPTIONS[0].value);
  };

  const openEdit = (role: RoleEntry) => setEditModal({ open: true, role });
  const closeEdit = () => setEditModal({ open: false });

  const saveEdit = () => {
    if (!editModal.role) return;
    if (editModal.role.role === 'unassigned') {
      setRoles(roles.filter(r => r.id !== editModal.role!.id));
    } else {
      setRoles(roles.map(r => r.id === editModal.role!.id ? editModal.role! : r));
    }
    closeEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="User name" className="bg-[#23272f] border-[#333] text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Role</label>
          <select
            className="w-full rounded-md border border-[#333] bg-[#23272f] px-3 py-2 text-base text-white"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={addRole} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg">Add</Button>
      </div>
      <div className="space-y-2">
        {roles.length === 0 ? (
          <div className="text-gray-400 italic">No roles assigned yet.</div>
        ) : (
          <ul className="divide-y divide-[#333]">
            {roles.map(r => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center overflow-hidden">
                    <span className="text-white font-bold text-lg">{r.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white mr-2">{r.name}</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-[#23272f] text-xs text-blue-300 uppercase">{ROLE_OPTIONS.find(opt => opt.value === r.role)?.label}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(r)} className="text-blue-400 hover:text-blue-600">Edit</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Edit Modal */}
      {editModal.open && editModal.role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#181a20] rounded-xl p-0 w-full max-w-md relative flex flex-col items-center overflow-hidden">
            {/* Gradient background */}
            <div className="w-full h-40 bg-gradient-to-b from-blue-700/80 via-blue-600/60 to-transparent absolute top-0 left-0 z-0" />
            <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl z-10" onClick={closeEdit}>&times;</button>
            {(() => {
              const roleObj = editModal.role;
              if (!roleObj) return null;
              return (
                <div className="relative z-10 flex flex-col items-center w-full pt-10 pb-6 px-8">
                  <div className="w-28 h-28 rounded-full bg-[#333] mb-2 overflow-hidden flex items-center justify-center border-4 border-blue-700 shadow-lg">
                    <span className="text-white font-bold text-4xl">{roleObj.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl font-bold text-white">{roleObj.name}</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-xs text-white font-semibold uppercase shadow">{ROLE_OPTIONS.find(opt => opt.value === roleObj.role)?.label}</span>
                  </div>
                  <div className="flex flex-row items-center gap-4">
                    <select
                      className="rounded-md border border-[#333] bg-[#23272f] px-3 py-2 text-base text-white mb-0 max-w-xs"
                      value={roleObj.role}
                      onChange={e => setEditModal(m => ({ ...m, role: { ...m.role!, role: e.target.value } }))}
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 px-6">Save</Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesTab; 