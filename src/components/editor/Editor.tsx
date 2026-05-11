import { useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Share2, Type, Image as ImageIcon,
  Shapes, LayoutTemplate, Upload, Sparkles, Search, Loader2,
} from "lucide-react";
import { Canvas } from "./Canvas";
import { CoachCard } from "./CoachCard";
import { ProModal } from "./ProModal";
import { TutorialOverlay } from "./TutorialOverlay";
import { DemoControls } from "./DemoControls";
import { COL1_X, initialPages, PageData, PageId } from "./types";

type Trail = { fromX: number; toX: number; key: number };

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
  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);
  const [logoRect, setLogoRect] = useState<DOMRect | null>(null);
  const [trails, setTrails] = useState<Record<PageId, Trail | null>>({ 1: null, 2: null, 3: null });
  const [flashThumb, setFlashThumb] = useState<Record<PageId, boolean>>({ 1: false, 2: false, 3: false });
  const [isApplying, setIsApplying] = useState(false);
  const [hideApplyBtn, setHideApplyBtn] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!bannerDismissed) setShowBanner(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
  };

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
    [1, 2, 3].forEach((id, i) => {
      setTimeout(() => {
        setPages((prev) => prev.map((p) => (p.id === id && p.chipState === "hidden" ? { ...p, chipState: "visible" } : p)));
      }, 3800 + i * 100);
    });
  };

  const applyChipWithTrail = (id: PageId) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const fromX = p.headingX;
        const toX = COL1_X;
        if (fromX !== toX) {
          setTrails((t) => ({ ...t, [id]: { fromX, toX, key: Date.now() + id } }));
          setTimeout(() => setTrails((t) => ({ ...t, [id]: null })), 800);
        }
        return {
          ...p,
          headingX: toX,
          bodyX: toX,
          logoPos: { x: toX, y: p.logoPos.y },
          hadSnapped: false,
          chipState: "applied",
          showCheck: true,
        };
      })
    );
    setTimeout(() => {
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, showCheck: false } : p)));
    }, 700);
  };

  const applyChip = (id: PageId) => applyChipWithTrail(id);

  const ignoreChip = (id: PageId) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, chipState: "ignored" } : p)));
  };

  const visibleChipPages = pages.filter((p) => p.chipState === "visible").map((p) => p.id);

  const applyAll = () => {
    if (isApplying) return;
    const ids = [...visibleChipPages];
    if (ids.length === 0) return;
    const original = activeId;
    setIsApplying(true);

    ids.forEach((id, i) => {
      setTimeout(() => {
        setActiveId(id);
        applyChipWithTrail(id);
      }, i * 400);
    });

    const flashStart = ids.length * 400 + 0;
    [1, 2, 3].forEach((id, i) => {
      setTimeout(() => {
        setFlashThumb((f) => ({ ...f, [id as PageId]: true }));
        setTimeout(() => setFlashThumb((f) => ({ ...f, [id as PageId]: false })), 400);
      }, flashStart + i * 50);
    });

    setTimeout(() => {
      setMilestoneToast("All 3 pages aligned. You just saved ~12 minutes.");
      setTimeout(() => setMilestoneToast(null), 5000);
      setTimeout(() => setShowRecap(true), 3000);
    }, flashStart + 400);

    setTimeout(() => {
      setHideApplyBtn(true);
      setIsApplying(false);
      setActiveId(original);
    }, flashStart + 600);
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
    setMilestoneToast(null);
    setTrails({ 1: null, 2: null, 3: null });
    setFlashThumb({ 1: false, 2: false, 3: false });
    setIsApplying(false);
    setHideApplyBtn(false);
    setShowRecap(false);
    triggeredRef.current = false;
    setActiveId(1);
  };

  const fireStub = (text: string) => {
    setCoachVariant("stub");
    setStubText(text);
    setShowCoach(true);
  };

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
        {!gridLocked ? (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#7D2AE8] hover:bg-[#6B20D0] rounded-md transition-opacity duration-200"
          >
            <Sparkles className="w-4 h-4" /> Pro
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 text-white"
            style={{
              background: "linear-gradient(90deg, #00C4CC, #00A8B0)",
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              animation: "badge-in 300ms ease-out, pro-glow 2s ease-in-out 300ms infinite",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pro Mode Active
          </div>
        )}
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
              className={`w-full text-left rounded-md overflow-hidden border-2 transition-all`}
              style={{
                borderColor: activeId === p.id ? "#00C4CC" : "#E5E7EB",
                animation: flashThumb[p.id] ? "thumb-flash 400ms ease-out" : undefined,
              }}
            >
              <div className="aspect-[3/2] bg-white relative p-2 overflow-hidden">
                <div className="absolute top-0 left-0 right-0" style={{ height: 2, background: "linear-gradient(90deg, #00C4CC, #7D2AE8)" }} />
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 12,
                    background: "#E5E5E5",
                    border: "1px solid #CCCCCC",
                    borderRadius: 2,
                    fontSize: 6,
                    fontWeight: 600,
                    color: "#333333",
                  }}
                >
                  LOGO
                </div>
                <div className="absolute right-2 top-7" style={{ left: `${(p.headingX / 720) * 100}%` }}>
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
        <main className="flex-1 flex items-center justify-center overflow-auto p-6 relative bg-[#F5F5F5]">
          {showBanner && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white"
              style={{
                border: "1px solid #E5E5E5",
                borderRadius: 8,
                padding: "12px 20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                animation: "banner-in 400ms ease-out",
                maxWidth: 560,
              }}
            >
              <span style={{ fontSize: 13, color: "#333" }}>
                <span className="mr-1">👋</span>
                This is a Design Coach demo. Try dragging the logo off its snap point 3 times across the pages to trigger the AI.
              </span>
              <button
                onClick={dismissBanner}
                className="ml-1 text-[14px] leading-none hover:text-gray-700"
                style={{ color: "#999" }}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
          {visibleChipPages.length >= 2 && !hideApplyBtn && (
            <button
              onClick={applyAll}
              disabled={isApplying}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-white text-sm font-semibold"
              style={{
                background: "#00C4CC",
                borderRadius: 24,
                padding: "12px 20px",
                boxShadow: "0 6px 20px rgba(0,196,204,0.35)",
                opacity: isApplying ? 0.9 : 1,
                cursor: isApplying ? "default" : "pointer",
                animation: hideApplyBtn ? "fade-out-btn 300ms ease-out forwards" : "chip-in 250ms ease-out",
              }}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4" style={{ animation: "spin 800ms linear infinite" }} />
                  Aligning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Apply all {visibleChipPages.length} suggestions
                </>
              )}
            </button>
          )}
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
            onChipApply={() => applyChip(activeId)}
            onChipIgnore={() => ignoreChip(activeId)}
            trail={trails[activeId]}
            onDragStart={() => { if (showBanner) dismissBanner(); }}
          />
          {showRecap && (
            <div
              className="absolute z-30"
              style={{
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 280,
                background: "#fff",
                border: "1px solid #E5E5E5",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                animation: "recap-in 300ms ease-out",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: "#666", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                What just happened
              </div>
              <div style={{ height: 12 }} />
              <ul className="space-y-2">
                {[
                  "Design Coach detected your off-grid behavior",
                  "You unlocked Pro Mode",
                  "The AI aligned 3 pages in one tap",
                  "You saved ~12 minutes of manual work",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2" style={{ fontSize: 13, color: "#333" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#00C4CC", marginTop: 7, flexShrink: 0 }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 16 }} />
              <button
                onClick={resetDemo}
                style={{ color: "#00C4CC", fontSize: 13, fontWeight: 600 }}
              >
                Reset demo →
              </button>
            </div>
          )}
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

      {milestoneToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A1A1A] text-white text-sm rounded-lg px-4 py-3 shadow-lg animate-fade-in max-w-md text-center flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00C4CC]" />
          {milestoneToast}
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
