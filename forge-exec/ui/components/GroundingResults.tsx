
import React from 'react';
import { ExternalLink, MapPin, Hash } from 'lucide-react';

interface GroundingResultsProps {
  sources: any[];
  type: 'web' | 'maps';
}

export const GroundingResults: React.FC<GroundingResultsProps> = ({ sources, type }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
      <p className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">Validated_Source_Indexes</p>
      <div className="space-y-1.5">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#0A84FF] hover:text-white transition-colors"
          >
            <Hash size={10} className="text-white/20" />
            <span className="truncate">{source.title || 'EXTERNAL_REF'}</span>
            <ExternalLink size={10} className="ml-auto text-white/20" />
          </a>
        ))}
      </div>
    </div>
  );
};
