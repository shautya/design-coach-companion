import { useEffect, useRef, useState } from "react";
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

  // sync when page changes
  useEffect(() => {
    setPos(page.logoPos);
    hadSnappedRef.current = page.hadSnapped;
  }, [page.id]);

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
            setTimeout(() => setOffGridLabel(null), 1000);
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
        className={`absolute flex items-center justify-center text-white font-bold text-sm select-none cursor-move rounded-md ${
          selected ? "ring-2 ring-[#00C4CC]" : ""
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          width: LOGO_W,
          height: LOGO_H,
          background: "linear-gradient(135deg,#7D2AE8,#00C4CC)",
          transition: snapping ? "left 150ms ease-out, top 150ms ease-out" : undefined,
        }}
      >
        LOGO
      </div>

      {offGridLabel && (
        <div
          className="absolute pointer-events-none text-[11px] text-[#666] animate-fade-in"
          style={{ left: offGridLabel.x, top: offGridLabel.y + LOGO_H + 4 }}
        >
          off-grid
        </div>
      )}

      {/* Text content */}
      <div className="absolute" style={{ left: 40, top: 140, width: 640 }}>
        <h1 className="text-4xl font-bold text-gray-900">{page.heading}</h1>
        <h2 className="text-lg text-gray-500 mt-2">{page.subheading}</h2>
        <p className="text-sm text-gray-600 mt-8 leading-relaxed max-w-md">{page.body}</p>
      </div>
    </div>
  );
}
