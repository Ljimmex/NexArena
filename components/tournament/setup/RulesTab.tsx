import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, Link as LinkIcon, File, Eye } from "lucide-react";

const ICONS = [
  { icon: "⚙️", label: "Ogólne" },
  { icon: "🏆", label: "Format" },
  { icon: "👥", label: "Zespoły" },
  { icon: "🎮", label: "Rozgrywka" },
  { icon: "📅", label: "Harmonogram" },
  { icon: "📜", label: "Kodeks" },
  { icon: "⚠️", label: "Kary" },
  { icon: "🎁", label: "Nagrody" },
  { icon: "🤝", label: "Fair Play" },
  { icon: "🛡️", label: "Bezpieczeństwo" },
  { icon: "💬", label: "Komunikacja" },
  { icon: "📝", label: "Zgłoszenia" },
  { icon: "🕹️", label: "Techniczne" },
  { icon: "🚨", label: "Incydenty" },
  { icon: "⏰", label: "Czas" },
  { icon: "🔊", label: "Ogłoszenia" },
  { icon: "🔒", label: "Prywatność" },
  { icon: "🌐", label: "Online" },
  { icon: "🏅", label: "Wyróżnienia" },
];

export interface RulePoint {
  text: string;
  children?: RulePoint[];
}

export interface RuleSection {
  title: string;
  icon: string;
  points: RulePoint[];
}

interface RulesTabProps {
  rules: RuleSection[];
  setRules: React.Dispatch<React.SetStateAction<RuleSection[]>>;
  rulesMeta: any;
  setRulesMeta: (meta: any) => void;
}

const RulesTab: React.FC<RulesTabProps> = ({ rules, setRules, rulesMeta, setRulesMeta }) => {
  // Section creation
  const [activeSection, setActiveSection] = useState(0);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState(ICONS[0].icon);

  // Point creation
  const [newPoint, setNewPoint] = useState("");
  const pointInputRef = React.useRef<HTMLTextAreaElement>(null);

  // Dodaj nową sekcję
  const addSection = () => {
    if (newSectionTitle.trim()) {
      setRules([
        ...rules,
        { title: newSectionTitle, icon: newSectionIcon, points: [] },
      ]);
      setNewSectionTitle("");
      setNewSectionIcon(ICONS[0].icon);
    }
  };

  // Usuń sekcję
  const removeSection = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
    setActiveSection(0);
  };

  // Dodaj punkt do aktywnej sekcji (na głównym poziomie)
  const addPoint = () => {
    if (newPoint.trim()) {
      const updated = [...rules];
      updated[activeSection].points.push({ text: newPoint });
      setRules(updated);
      setNewPoint("");
      setTimeout(() => {
        pointInputRef.current?.focus();
      }, 0);
    }
  };

  // Dodaj podpunkt do punktu na dowolnym poziomie
  const addSubPoint = (sectionIdx: number, path: number[], text: string) => {
    const updated = [...rules];
    let points = updated[sectionIdx].points;
    let parent: RulePoint | undefined;
    for (let i = 0; i < path.length; i++) {
      parent = points[path[i]];
      if (!parent.children) parent.children = [];
      points = parent.children;
    }
    points.push({ text });
    setRules(updated);
  };

  // Usuń punkt/podpunkt
  const removePoint = (sectionIdx: number, path: number[]) => {
    const updated = [...rules];
    let points = updated[sectionIdx].points;
    for (let i = 0; i < path.length - 1; i++) {
      points = points[path[i]].children!;
    }
    points.splice(path[path.length - 1], 1);
    setRules(updated);
  };

  // Renderuj punkty z numeracją zagnieżdżoną
  const renderPoints = (points: RulePoint[], sectionIdx: number, prefix: string = "", path: number[] = []) => (
    <ol className="list-decimal pl-6 space-y-2">
      {points.map((point, idx) => {
        const number = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        return (
          <li key={number} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-400">{number}</span>
              <span>{point.text}</span>
              <Button variant="ghost" size="sm" onClick={() => removePoint(sectionIdx, [...path, idx])} className="text-red-400">Usuń</Button>
              <AddSubPointInput onAdd={text => addSubPoint(sectionIdx, [...path, idx], text)} />
            </div>
            {point.children && point.children.length > 0 && renderPoints(point.children, sectionIdx, number, [...path, idx])}
          </li>
        );
      })}
    </ol>
  );

  // Komponent do dodawania podpunktu inline
  const AddSubPointInput: React.FC<{ onAdd: (text: string) => void }> = ({ onAdd }) => {
    const [val, setVal] = useState("");
    return (
      <span className="flex items-center gap-1">
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Dodaj podpunkt..."
          className="px-1 py-0.5 rounded border border-[#333] bg-[#23272f] text-white text-xs"
          onKeyDown={e => {
            if (e.key === "Enter" && val.trim()) {
              onAdd(val);
              setVal("");
            }
          }}
        />
        <Button size="sm" onClick={() => { if (val.trim()) { onAdd(val); setVal(""); } }}>+</Button>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sekcje */}
      <div className="flex gap-2 flex-wrap mb-2">
        {rules.map((section, idx) => (
          <Button
            key={idx}
            variant={activeSection === idx ? "default" : "outline"}
            onClick={() => setActiveSection(idx)}
            className="mb-2 flex items-center gap-2"
          >
            <span className="text-lg">{section.icon}</span>
            {section.title}
            {rules.length > 1 && (
              <span
                className="ml-2 text-red-400 cursor-pointer"
                onClick={e => { e.stopPropagation(); removeSection(idx); }}
                title="Usuń sekcję"
              >
                ×
              </span>
            )}
          </Button>
        ))}
        <input
          type="text"
          value={newSectionTitle}
          onChange={e => setNewSectionTitle(e.target.value)}
          placeholder="Dodaj sekcję..."
          className="px-2 py-1 rounded border border-[#333] bg-[#23272f] text-white text-sm ml-2"
        />
        <select value={newSectionIcon} onChange={e => setNewSectionIcon(e.target.value)} className="px-2 py-1 rounded border border-[#333] bg-[#23272f] text-white text-sm">
          {ICONS.map(opt => <option key={opt.icon} value={opt.icon}>{opt.icon} {opt.label}</option>)}
        </select>
        <Button onClick={addSection} size="sm">Dodaj</Button>
      </div>
      {/* Punkty sekcji */}
      <div className="bg-[#181c23] rounded-lg p-6 border border-[#333]">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <span className="text-2xl">{rules[activeSection]?.icon}</span>
          {rules[activeSection]?.title}
        </h3>
        {renderPoints(rules[activeSection]?.points || [], activeSection)}
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-xs text-gray-400 mb-1">Dodaj punkt do sekcji</label>
          <div className="flex gap-2">
            <textarea
              ref={pointInputRef}
              value={newPoint}
              onChange={e => setNewPoint(e.target.value)}
              placeholder="Np. Uczestnicy muszą posiadać ważne konto Steam."
              className="px-2 py-1 rounded border border-[#333] bg-[#23272f] text-white text-sm w-full min-h-[38px] resize-none"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addPoint();
                } else if (e.key === "Escape") {
                  setNewPoint("");
                }
              }}
            />
            <Button onClick={addPoint} size="sm" title="Dodaj punkt" className="h-auto px-3 py-2">➕</Button>
          </div>
          <span className="text-xs text-gray-500">Wciśnij Enter, aby dodać. Shift+Enter = nowa linia. Esc = wyczyść.</span>
        </div>
      </div>
      {/* Meta fields i linki przeniesione na dół */}
      <div className="mt-8 bg-[#181c23] rounded-xl p-6 border border-[#23283a] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <User className="text-blue-400 w-5 h-5" />
          <input type="text" value={rulesMeta.approvedBy} onChange={e => setRulesMeta((m: any) => ({ ...m, approvedBy: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" placeholder="Kto zatwierdził (np. Komitet)" />
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="text-yellow-400 w-5 h-5" />
          <input type="date" value={rulesMeta.approvedDate} onChange={e => setRulesMeta((m: any) => ({ ...m, approvedDate: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" />
        </div>
        <div className="flex items-center gap-3">
          <FileText className="text-green-400 w-5 h-5" />
          <input type="text" value={rulesMeta.version} onChange={e => setRulesMeta((m: any) => ({ ...m, version: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" placeholder="Wersja regulaminu (np. 2.1)" />
        </div>
        <div className="flex items-center gap-3">
          <File className="text-yellow-400 w-5 h-5" />
          <input type="url" value={rulesMeta.pdfUrl} onChange={e => setRulesMeta((m: any) => ({ ...m, pdfUrl: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" placeholder="Link do PDF" />
        </div>
        <div className="flex items-center gap-3">
          <File className="text-blue-400 w-5 h-5" />
          <input type="url" value={rulesMeta.wordUrl} onChange={e => setRulesMeta((m: any) => ({ ...m, wordUrl: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" placeholder="Link do Word" />
        </div>
        <div className="flex items-center gap-3">
          <Eye className="text-green-400 w-5 h-5" />
          <input type="url" value={rulesMeta.previewUrl} onChange={e => setRulesMeta((m: any) => ({ ...m, previewUrl: e.target.value }))} className="px-3 py-2 rounded bg-[#23272f] border border-[#333] text-white w-full" placeholder="Link do podglądu online" />
        </div>
      </div>
      {/* Linki do pobrania/podglądu */}
      <div className="flex gap-4 mt-2">
        {rulesMeta.pdfUrl && <a href={rulesMeta.pdfUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Pobierz PDF</a>}
        {rulesMeta.wordUrl && <a href={rulesMeta.wordUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Pobierz Word</a>}
        {rulesMeta.previewUrl && <a href={rulesMeta.previewUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">Podgląd online</a>}
      </div>
    </div>
  );
};

export default RulesTab; 