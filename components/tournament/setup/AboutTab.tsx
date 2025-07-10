import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

const CONTACT_METHODS = [
  { value: "discord", label: "Discord" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

interface AboutTabProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  contactUrl: string;
  setContactUrl: (v: string) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  contactMethod: string;
  setContactMethod: (v: string) => void;
}

const AboutTab: React.FC<AboutTabProps> = ({
  name,
  setName,
  description,
  setDescription,
  contactUrl,
  setContactUrl,
  videoUrl,
  setVideoUrl,
  contactMethod,
  setContactMethod,
}) => {
  const [mdTab, setMdTab] = useState<'edit' | 'preview'>("edit");

  return (
    <div className="space-y-6 bg-[#181a20] border border-[#333] rounded-md p-6 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Nazwa turnieju</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nazwa turnieju" className="bg-[#23272f] border-[#333] text-white" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-300">Opis (Markdown)</label>
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="text-xs px-3 py-1 rounded bg-[#23272f] border border-[#333] text-gray-300 hover:bg-[#23272f]/80 hover:text-yellow-400 transition">Opcje Markdown</button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full bg-[#181a20] border border-[#333] rounded-xl p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold mb-8 text-white">Markdown formatting help</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Text</div>
                  <div className="mb-2"><span className="font-semibold text-white">Headers</span><br/><span className="text-gray-300"># H1<br/>## H2<br/>### H3</span></div>
                  <div className="mb-2"><span className="font-semibold text-white">Bold</span><br/><span className="text-gray-300"><code>**bold**</code> → <b>bold</b></span></div>
                  <div className="mb-2"><span className="font-semibold text-white">Italic</span><br/><span className="text-gray-300"><code>*italic*</code> → <i>italic</i></span></div>
                  <div className="mb-2"><span className="font-semibold text-white">Strikethrough</span><br/><span className="text-gray-300"><code>~~strike~~</code> → <s>strike</s></span></div>
                  <div><span className="font-semibold text-white">Blockquote</span><br/><span className="text-gray-300"><code>{'>'} quote</code></span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Lists</div>
                  <div className="mb-2"><span className="font-semibold text-white">Unordered list</span><br/><span className="text-gray-300">- Item 1<br/>- Item 2</span></div>
                  <div className="mb-2"><span className="font-semibold text-white">Ordered list</span><br/><span className="text-gray-300">1. First<br/>2. Second</span></div>
                  <div><span className="font-semibold text-white">Nested list</span><br/><span className="text-gray-300">- Item 1<br/>  - Subitem 1</span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Links and images</div>
                  <div className="mb-2"><span className="font-semibold text-white">Links</span><br/><span className="text-gray-300">[text](url)</span></div>
                  <div><span className="font-semibold text-white">Images</span><br/><span className="text-gray-300">![alt](url)</span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Code</div>
                  <div className="mb-2"><span className="font-semibold text-white">Inline code</span><br/><span className="text-gray-300"><code>`code`</code></span></div>
                  <div><span className="font-semibold text-white">Code block</span><br/><span className="text-gray-300"><pre className="bg-[#181a20] rounded p-2 mt-1 text-gray-200 text-xs">```js
const x = 1;
```</pre></span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Tables</div>
                  <div><span className="font-semibold text-white">Basic table</span><br/><span className="text-gray-300"><pre className="bg-[#181a20] rounded p-2 mt-1 text-gray-200 text-xs">| Name | Age |
|------|-----|
| Tom  |  10 |
| Ann  |  12 |</pre></span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Task lists</div>
                  <div><span className="font-semibold text-white">- [x] Done<br/>- [ ] Not done</span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Mentions & Emojis</div>
                  <div className="mb-2"><span className="font-semibold text-white">Mentions</span><br/><span className="text-gray-300">@user</span></div>
                  <div><span className="font-semibold text-white">Emojis</span><br/><span className="text-gray-300">:smile:</span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Lines</div>
                  <div><span className="font-semibold text-white">Horizontal line</span><br/><span className="text-gray-300">---</span></div>
                </div>
                <div className="bg-[#23272f] rounded-lg p-5 border border-[#333]">
                  <div className="font-bold text-white text-lg mb-3">Escaping</div>
                  <div><span className="font-semibold text-white">Escape special characters</span><br/><span className="text-gray-300">\*not italic\*</span></div>
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <DialogTrigger asChild>
                  <button type="button" className="px-7 py-2 rounded bg-[#23272f] border border-[#333] text-gray-300 hover:bg-[#23272f]/80 hover:text-yellow-400 transition text-base font-semibold">Cancel</button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border border-[#333] bg-[#23272f] overflow-hidden p-0">
            <MDEditor
              value={description}
              onChange={v => setDescription(v || "")}
              height={220}
              visibleDragbar={false}
              hideToolbar
              className="!bg-[#23272f] !text-gray-200 !border-none !shadow-none !rounded-none !font-mono"
              style={{
                background: '#23272f',
                color: '#e5e7eb',
                border: 'none',
                borderRadius: 0,
                fontFamily: 'inherit',
                minHeight: 180,
                boxShadow: 'none',
                padding: 0
              }}
            />
          </div>
          <div className="rounded-md border border-[#333] bg-[#23272f] p-3 min-h-[120px] max-h-[220px] overflow-y-auto text-gray-200 custom-scrollbar">
            <div className="text-xs text-gray-400 mb-1">Podgląd</div>
            <MarkdownPreview source={description} style={{ background: "transparent", color: '#e5e7eb', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Kontakt (URL)</label>
          <Input value={contactUrl} onChange={e => setContactUrl(e.target.value)} placeholder="https://discord.gg/your-server lub mailto:example@mail.com" className="bg-[#23272f] border-[#333] text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Forma kontaktu</label>
          <select
            className="w-full rounded-md border border-[#333] bg-[#23272f] px-3 py-2 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
            value={contactMethod}
            onChange={e => setContactMethod(e.target.value)}
          >
            <option value="">Wybierz...</option>
            {CONTACT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">Video URL (np. trailer, YouTube)</label>
        <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/your-trailer" className="bg-[#23272f] border-[#333] text-white" />
      </div>
    </div>
  );
};

export default AboutTab; 