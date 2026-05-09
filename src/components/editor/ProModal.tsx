import { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  onUpgrade: () => void;
  onCancel: () => void;
}

export function ProModal({ onUpgrade, onCancel }: Props) {
  const [success, setSuccess] = useState(false);

  const handleUpgrade = () => {
    setSuccess(true);
    setTimeout(() => onUpgrade(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] p-8">
        {success ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#7D2AE8] flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-bold text-black">Welcome to Pro</div>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7D2AE8]">
              Pro Feature
            </div>
            <h2 className="text-2xl font-bold text-black mt-2">
              You're already designing like a pro
            </h2>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              You've used Design Coach 3 times this week to do work Pro is built for. Unlock grid lock, brand kit fonts, and multi-page style sync.
            </p>
            <div className="text-sm font-semibold text-black mt-5">
              $12.99/month <span className="text-gray-500 font-normal">— cancel anytime</span>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpgrade}
                className="flex-1 bg-[#7D2AE8] hover:bg-[#6B20D0] text-white font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={onCancel}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
              >
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
