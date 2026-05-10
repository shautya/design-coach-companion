import { useEffect, useRef, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { PageData, SNAP_RADIUS, SNAP_X, SNAP_Y } from "./types";

interface Props {
  page: PageData;
  selected: boolean;
  onSelect: () => void;
  onLogoMove: (pos: { x: number; y: number }) => void;
  onSnapRelease: () => void;
  onSnapped: () => void;
  gridLocked: boolean;
  onLogoRect: (rect: DOMRect | null) => void;
  onChipApply: () => void;
  onChipIgnore: () => void;
}

const LOGO_W = 120;
const LOGO_H = 60;

export function Canvas({
  page,
  selected,
  onSelect,
  onLogoMove,
  onSnapRelease,
  onSnapped,
  gridLocked,
  onLogoRect,
  onChipApply,
  onChipIgnore,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState(page.logoPos);
  const [inSnapZone, setInSnapZone] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const [offGridLabel, setOffGridLabel] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hadSnappedRef = useRef(page.hadSnapped);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [headingW, setHeadingW] = useState(0);

  // sync when page changes
  useEffect(() => {
    setPos(page.logoPos);
    hadSnappedRef.current = page.hadSnapped;
  }, [page.id]);

  useEffect(() => {
    if (headingRef.current) setHeadingW(headingRef.current.offsetWidth);
  }, [page.heading, page.headingX]);

  // report logo rect when position/selection changes
  useEffect(() => {
    if (selected && logoRef.current) {
      onLogoRect(logoRef.current.getBoundingClientRect());
    } else {
      onLogoRect(null);
    }
  }, [selected, pos.x, pos.y, page.id, dragging]);

  const inZone = (x: number, y: number) =>
    Math.hypot(x - SNAP_X, y - SNAP_Y) <= SNAP_RADIUS;

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    const rect = logoRef.current!.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const c = canvasRef.current!.getBoundingClientRect();
      let x = e.clientX - c.left - dragOffset.current.x;
      let y = e.clientY - c.top - dragOffset.current.y;
      x = Math.max(0, Math.min(x, c.width - LOGO_W));
      y = Math.max(0, Math.min(y, c.height - LOGO_H));
      setPos({ x, y });
      setInSnapZone(inZone(x, y));
    };
    const onUp = () => {
      setDragging(false);
      setInSnapZone(false);
      setPos((p) => {
        if (inZone(p.x, p.y)) {
          setSnapping(true);
          setTimeout(() => setSnapping(false), 160);
          hadSnappedRef.current = true;
          onSnapped();
          onLogoMove({ x: SNAP_X, y: SNAP_Y });
          return { x: SNAP_X, y: SNAP_Y };
        } else {
          if (hadSnappedRef.current) {
            hadSnappedRef.current = false;
            onSnapRelease();
            setOffGridLabel({ x: p.x, y: p.y });
            setTimeout(() => setOffGridLabel(null), 800);
          }
          onLogoMove(p);
          return p;
        }
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const guideActive = inSnapZone && dragging;

  return (
    <div
      ref={canvasRef}
      className="relative bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-md"
      style={{ width: 720, height: 480 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onSelect();
      }}
    >
      {/* Grid lines */}
      {gridLocked && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 13 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-dashed"
              style={{ left: `${(i / 12) * 100}%`, borderColor: "#00C4CC", opacity: 0.25 }}
            />
          ))}
        </div>
      )}

      {/* Snap guide */}
      {selected && (
        <>
          <div
            className="absolute pointer-events-none transition-opacity duration-200"
            style={{
              left: SNAP_X - 30,
              top: SNAP_Y,
              width: 60,
              borderTop: `1px dashed ${guideActive ? "#00C4CC" : "#CCCCCC"}`,
              opacity: guideActive ? 1 : 0.4,
            }}
          />
          <div
            className="absolute pointer-events-none transition-opacity duration-200"
            style={{
              left: SNAP_X,
              top: SNAP_Y - 30,
              height: 60,
              borderLeft: `1px dashed ${guideActive ? "#00C4CC" : "#CCCCCC"}`,
              opacity: guideActive ? 1 : 0.4,
            }}
          />
        </>
      )}

      {/* Logo */}
      <div
        ref={logoRef}
        onMouseDown={onMouseDown}
        className={`absolute flex items-center justify-center select-none cursor-move ${
          selected ? "ring-2 ring-[#00C4CC]" : ""
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          width: LOGO_W,
          height: LOGO_H,
          background: "#E5E5E5",
          border: "1px solid #CCCCCC",
          borderRadius: 6,
          color: "#333333",
          fontSize: 14,
          fontWeight: 600,
          transition: snapping ? "left 150ms ease-out, top 150ms ease-out" : undefined,
        }}
      >
        LOGO
      </div>

      {offGridLabel && (
        <div
          className="absolute pointer-events-none italic"
          style={{
            left: offGridLabel.x + LOGO_W + 6,
            top: offGridLabel.y + LOGO_H / 2 - 7,
            fontSize: 11,
            color: "#666",
            animation: "fade-in 150ms ease-out, fade-out 200ms ease-in 600ms forwards",
          }}
        >
          off-grid
        </div>
      )}

      {/* Text content */}
      <h1
        ref={headingRef}
        className="absolute text-4xl font-bold text-gray-900"
        style={{
          left: page.headingX,
          top: 140,
          transition: "left 300ms ease-in-out",
        }}
      >
        {page.heading}
      </h1>
      <div className="absolute" style={{ left: 40, top: 196, width: 640 }}>
        <h2 className="text-lg text-gray-500">{page.subheading}</h2>
        <p className="text-sm text-gray-600 mt-8 leading-relaxed max-w-md">{page.body}</p>
      </div>

      {/* Smart Align chip */}
      {page.chipState === "visible" && headingW > 0 && (
        <div
          className="absolute z-20 bg-white flex items-center gap-2"
          style={{
            left: page.headingX + headingW + 8,
            top: 152,
            border: "1px solid #E5E5E5",
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            animation: "chip-in 250ms ease-out both",
            transition: "left 300ms ease-in-out",
          }}
        >
          <Sparkles className="w-3 h-3 text-[#00C4CC]" />
          <span className="text-[12px]" style={{ color: "#333" }}>Snap to column 1?</span>
          <button
            onClick={onChipApply}
            className="text-[12px] font-semibold ml-1"
            style={{ color: "#00C4CC" }}
          >
            Apply
          </button>
          <button
            onClick={onChipIgnore}
            className="text-[12px]"
            style={{ color: "#999" }}
          >
            Ignore
          </button>
        </div>
      )}

      {/* Checkmark on apply */}
      {page.showCheck && headingW > 0 && (
        <div
          className="absolute z-20 pointer-events-none flex items-center justify-center"
          style={{
            left: page.headingX + headingW + 8,
            top: 152,
            width: 24,
            height: 24,
            borderRadius: 999,
            background: "#00C4CC",
            animation: "check-pop 700ms ease-out forwards",
          }}
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
