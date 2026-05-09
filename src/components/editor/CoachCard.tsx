import { useEffect, useState } from "react";

interface Props {
  anchorRect: DOMRect | null;
  onLockGrid: () => void;
  onDismiss: () => void;
  variant?: "alignment" | "stub";
  stubText?: string;
}

export function CoachCard({ anchorRect, onLockGrid, onDismiss, variant = "alignment", stubText }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, []);

  if (!anchorRect) return null;

  const cardW = 280;
  const cardH = 200;
  const margin = 12;
  // anchor below logo
  let top = anchorRect.bottom + margin;
  let left = anchorRect.left;
  // if would overlap toolbar (assume top toolbar = 56px from window top), anchor top-right
  if (top + cardH > window.innerHeight - 20) {
    top = anchorRect.top;
    left = anchorRect.right + margin;
  }

  return (
    <div
      className="fixed z-40 rounded-lg bg-white border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 transition-all duration-200"
      style={{
        width: cardW,
        top,
        left,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-bold text-white bg-[#7D2AE8] px-1.5 py-0.5 rounded">
          PRO
        </span>
      </div>

      {variant === "alignment" ? (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">
            Detected — custom alignment
          </div>
          <div className="text-[16px] font-bold text-black mt-1.5 leading-tight pr-10">
            Looks like you're working with a custom grid
          </div>
          <p className="text-[13px] text-[#666] mt-2 leading-snug">
            Lock all elements to a 12-column grid across every page. That's how design teams keep brand decks consistent.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onLockGrid}
              className="flex-1 bg-[#00C4CC] hover:bg-[#00B0B7] text-white text-sm font-semibold rounded-md px-3 py-2 transition-colors"
            >
              Lock to grid
            </button>
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">
            Design Coach
          </div>
          <div className="text-[16px] font-bold text-black mt-1.5 pr-10">
            {stubText}
          </div>
          <p className="text-[13px] text-[#666] mt-2">Trigger type not built in v1.</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
