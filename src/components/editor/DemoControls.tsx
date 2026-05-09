import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

interface Props {
  count: number;
  suppressed: boolean;
  onReset: () => void;
  onSimulateUndo: () => void;
  onSimulateIdle: () => void;
}

export function DemoControls({ count, suppressed, onReset, onSimulateUndo, onSimulateIdle }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <div className="fixed bottom-4 right-4 z-30 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700"
      >
        <span>Demo controls</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-700">
              Snap releases: <span className="font-bold text-black">{Math.min(count, 3)}/3</span>
              {count > 3 && <span className="text-gray-400"> (+{count - 3})</span>}
            </div>
            {suppressed && (
              <div className="text-[11px] text-[#999] mt-1">
                Prompt suppressed for this trigger (14-day window)
              </div>
            )}
          </div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md px-3 py-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
          </button>
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button
              onClick={onSimulateUndo}
              className="w-full text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md px-3 py-1.5 transition-colors"
            >
              Simulate undo-redo trigger
            </button>
            <button
              onClick={onSimulateIdle}
              className="w-full text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md px-3 py-1.5 transition-colors"
            >
              Simulate idle trigger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
