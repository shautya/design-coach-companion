interface Props {
  onDone: () => void;
}

export function TutorialOverlay({ onDone }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] p-8">
        <h2 className="text-2xl font-bold text-black">Grid locked across 3 pages</h2>

        {/* Diagram */}
        <div className="mt-6 bg-white border border-gray-200 rounded-md aspect-[3/2] relative overflow-hidden">
          {Array.from({ length: 13 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-dashed"
              style={{ left: `${(i / 12) * 100}%`, borderColor: "#00C4CC", opacity: 0.4 }}
            />
          ))}
          <div
            className="absolute flex items-center justify-center text-white font-bold text-[10px] rounded"
            style={{
              left: "1%",
              top: 12,
              width: `${100 / 12 - 2}%`,
              height: 28,
              background: "linear-gradient(135deg,#7D2AE8,#00C4CC)",
            }}
          >
            LOGO
          </div>
        </div>

        <div className="bg-[#F5F5F5] rounded-md p-4 mt-5">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Pro tip:</span> lock the grid first, then add elements. Saves about 40% of cleanup time on multi-page decks.
          </p>
        </div>

        <button
          onClick={onDone}
          className="w-full mt-6 bg-[#00C4CC] hover:bg-[#00B0B7] text-white font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
