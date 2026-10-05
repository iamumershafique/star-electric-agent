import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Globe,
  Edit2
} from 'lucide-react';

export const MobileAccessModal: React.FC = () => {
  const { 
    isMobileAccessOpen, 
    setIsMobileAccessOpen, 
    publicUrl, 
    setPublicUrl 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(publicUrl);

  if (!isMobileAccessOpen) return null;

  const currentUrl = publicUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveCustomUrl = () => {
    let clean = customUrlInput.trim();
    if (clean) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      setPublicUrl(clean);
    }
    setIsEditingUrl(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsMobileAccessOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <img 
                src="/star-electric-logo.png" 
                alt="Star Electric Enterprises" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Access on Mobile, Tablet &amp; Laptop
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live Public Cloud Access • Star Electric Enterprises
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Center Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Scan with your Phone Camera
          </span>

          <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-md flex items-center justify-center">
            <img 
              src={qrCodeUrl} 
              alt="Scan QR code to open portal on mobile" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                // Fallback placeholder if offline
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Point your mobile camera at this screen to open the portal instantly in your phone's browser.
          </p>
        </div>

        {/* Live Link Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Live Public Access Link:
            </label>
            <button
              onClick={() => {
                setCustomUrlInput(currentUrl);
                setIsEditingUrl(!isEditingUrl);
              }}
              className="text-[11px] font-bold text-[#1e195b] hover:text-[#fd2729] flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              {isEditingUrl ? 'Cancel' : 'Change Domain'}
            </button>
          </div>

          {isEditingUrl ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://your-public-url.com"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:border-[#fd2729]"
              />
              <button
                onClick={handleSaveCustomUrl}
                className="px-3 py-2 rounded-xl bg-[#1e195b] text-white font-bold text-xs hover:bg-[#282070] cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs font-bold text-slate-900 truncate">
                {currentUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#fd2729] hover:bg-[#e0191b] text-white shadow-md shadow-red-500/20'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700">
          Portal access requires an authorized account. Manage account credentials in Firebase Authentication.
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold pt-1">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Responsive touch UI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Camera photo DC &amp; Builty scan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Auto-saves login session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Real-time cloud updates</span>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={() => setIsMobileAccessOpen(false)}
          className="w-full py-2.5 rounded-xl bg-[#1e195b] hover:bg-[#282070] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
        >
          Done
        </button>

      </div>
    </div>
  );
};
