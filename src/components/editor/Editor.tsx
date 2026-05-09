import { useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Share2, Type, Image as ImageIcon,
  Shapes, LayoutTemplate, Upload, Sparkles, Search,
} from "lucide-react";
import { Canvas } from "./Canvas";
import { CoachCard } from "./CoachCard";
import { ProModal } from "./ProModal";
import { TutorialOverlay } from "./TutorialOverlay";
import { DemoControls } from "./DemoControls";
import { initialPages, PageData, PageId } from "./types";

export function Editor() {
  const [pages, setPages] = useState<PageData[]>(initialPages);
  const [activeId, setActiveId] = useState<PageId>(1);
  const [selected, setSelected] = useState(true);
  const [snapCount, setSnapCount] = useState(0);
  const [suppressed, setSuppressed] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [coachVariant, setCoachVariant] = useState<"alignment" | "stub">("alignment");
  const [stubText, setStubText] = useState("");
  const [showProModal, setShowProModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gridLocked, setGridLocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [logoRect, setLogoRect] = useState<DOMRect | null>(null);
  const triggeredRef = useRef(false);

  const activePage = pages.find((p) => p.id === activeId)!;

  const updatePage = (id: PageId, patch: Partial<PageData>) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleSnapRelease = () => {
    setSnapCount((c) => {
      const next = c + 1;
      if (next >= 3 && !suppressed && !triggeredRef.current) {
        triggeredRef.current = true;
        setTimeout(() => {
          setCoachVariant("alignment");
          setShowCoach(true);
        }, 100);
      }
      return next;
    });
    updatePage(activeId, { hadSnapped: false });
  };

  const handleSnapped = () => updatePage(activeId, { hadSnapped: true });

  const handleDismiss = () => {
    setShowCoach(false);
    if (coachVariant === "alignment") setSuppressed(true);
  };

  const handleLockGrid = () => {
    setShowCoach(false);
    setShowProModal(true);
  };

  const handleUpgrade = () => {
    setShowProModal(false);
    setShowTutorial(true);
  };

  const handleTutorialDone = () => {
    setShowTutorial(false);
    setGridLocked(true);
    setToast("You just set up a custom grid system across 3 pages. That's how design teams keep brand decks consistent.");
    setTimeout(() => setToast(null), 4000);
  };

  const resetDemo = () => {
    setPages(initialPages);
    setSnapCount(0);
    setSuppressed(false);
    setShowCoach(false);
    setShowProModal(false);
    setShowTutorial(false);
    setGridLocked(false);
    setToast(null);
    triggeredRef.current = false;
    setActiveId(1);
  };

  const fireStub = (text: string) => {
    setCoachVariant("stub");
    setStubText(text);
    setShowCoach(true);
  };

  // Hide coach when triggered alignment can't re-trigger after dismiss; reset trigger ref if reset
  useEffect(() => {
    if (snapCount === 0) triggeredRef.current = false;
  }, [snapCount]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F5F5F5] text-gray-900 overflow-hidden">
      {/* Top toolbar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#7D2AE8] to-[#00C4CC]" />
          <div className="text-sm font-semibold">Q4 Brand Deck</div>
        </div>
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <button className="p-2 rounded hover:bg-gray-100"><Undo2 className="w-4 h-4 text-gray-600" /></button>
        <button className="p-2 rounded hover:bg-gray-100"><Redo2 className="w-4 h-4 text-gray-600" /></button>
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2">
          <button className="p-1.5"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
          <span className="text-xs text-gray-600 w-10 text-center">100%</span>
          <button className="p-1.5"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#7D2AE8] hover:bg-[#6B20D0] rounded-md transition-colors">
          <Sparkles className="w-4 h-4" /> Pro
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left tools rail */}
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
          {[
            { Icon: LayoutTemplate, label: "Design" },
            { Icon: Shapes, label: "Elements" },
            { Icon: Type, label: "Text" },
            { Icon: ImageIcon, label: "Photos" },
            { Icon: Upload, label: "Uploads" },
            { Icon: Search, label: "Search" },
          ].map(({ Icon, label }, i) => (
            <button
              key={label}
              className={`w-14 h-14 rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] ${
                i === 0 ? "bg-gray-100 text-[#00C4CC]" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </aside>

        {/* Pages thumbnails */}
        <aside className="w-44 bg-white border-r border-gray-200 p-3 space-y-3 overflow-y-auto shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Pages</div>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full text-left rounded-md overflow-hidden border-2 transition-all ${
                activeId === p.id ? "border-[#00C4CC]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="aspect-[3/2] bg-white relative p-2">
                <div className="w-6 h-3 rounded-sm bg-gradient-to-br from-[#7D2AE8] to-[#00C4CC]" />
                <div className="absolute left-2 right-2 top-7">
                  <div className="text-[8px] font-bold text-gray-900 leading-tight truncate">{p.heading}</div>
                  <div className="text-[6px] text-gray-500 mt-0.5 truncate">{p.subheading}</div>
                </div>
              </div>
              <div className="px-2 py-1 text-[10px] text-gray-600 bg-gray-50 border-t border-gray-100">
                Page {p.id}
              </div>
            </button>
          ))}
        </aside>

        {/* Canvas area */}
        <main className="flex-1 flex items-center justify-center overflow-auto p-6">
          <Canvas
            key={activePage.id}
            page={activePage}
            selected={selected}
            onSelect={() => setSelected(true)}
            onLogoMove={(pos) => updatePage(activeId, { logoPos: pos })}
            onSnapRelease={handleSnapRelease}
            onSnapped={handleSnapped}
            gridLocked={gridLocked}
            onLogoRect={setLogoRect}
          />
        </main>

        {/* Right properties panel */}
        <aside className="w-72 bg-white border-l border-gray-200 p-4 shrink-0 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-900">Logo</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Image element</div>

          <div className="mt-5 space-y-4">
            <PropRow label="Position">
              <div className="grid grid-cols-2 gap-2">
                <NumField label="X" value={Math.round(activePage.logoPos.x)} />
                <NumField label="Y" value={Math.round(activePage.logoPos.y)} />
              </div>
            </PropRow>
            <PropRow label="Size">
              <div className="grid grid-cols-2 gap-2">
                <NumField label="W" value={120} />
                <NumField label="H" value={60} />
              </div>
            </PropRow>
            <PropRow label="Color">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md border border-gray-200 bg-gradient-to-br from-[#7D2AE8] to-[#00C4CC]" />
                <div className="text-xs text-gray-600 font-mono">#7D2AE8 → #00C4CC</div>
              </div>
            </PropRow>
            <PropRow label="Opacity">
              <input type="range" defaultValue={100} className="w-full accent-[#00C4CC]" />
            </PropRow>
          </div>
        </aside>
      </div>

      {showCoach && (
        <CoachCard
          anchorRect={logoRect}
          onLockGrid={handleLockGrid}
          onDismiss={handleDismiss}
          variant={coachVariant}
          stubText={stubText}
        />
      )}
      {showProModal && <ProModal onUpgrade={handleUpgrade} onCancel={() => setShowProModal(false)} />}
      {showTutorial && <TutorialOverlay onDone={handleTutorialDone} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A1A1A] text-white text-sm rounded-lg px-4 py-3 shadow-lg animate-fade-in max-w-md text-center">
          {toast}
        </div>
      )}

      <DemoControls
        count={snapCount}
        suppressed={suppressed}
        onReset={resetDemo}
        onSimulateUndo={() => fireStub("Frequent undo-redo detected")}
        onSimulateIdle={() => fireStub("Idle pause detected")}
      />
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function NumField({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5">
      <span className="text-[11px] text-gray-500 font-medium w-3">{label}</span>
      <span className="text-xs text-gray-900 font-medium">{value}</span>
    </div>
  );
}
