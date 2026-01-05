
import React from 'react';
import { MapPin, Clock, Navigation, ChevronRight, Hash } from 'lucide-react';
import { JobDetails, Priority } from '../../types';
import { PRIORITY_COLORS, STATE_COLORS } from '../../constants';

interface JobCardProps {
  job: JobDetails;
  onSelect: (job: JobDetails) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  const isEmergency = job.priority === Priority.EMERGENCY;

  return (
    <div 
      onClick={() => onSelect(job)}
      className={`border-b border-slate-700/30 p-5 md:p-8 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 cursor-pointer group flex items-center justify-between transition-none`}
    >
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white/30">
            <Hash size={10} />
            <span>{job.jobId}</span>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 border uppercase tracking-[0.15em] ${STATE_COLORS[job.currentState].replace('border-', 'border-').replace('text-', 'text-')}`}>
            {job.currentState.replace('_', ' ')}
          </span>
          {isEmergency && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-red-600 text-white uppercase tracking-[0.15em]">
              EMERGENCY_REQUIRED
            </span>
          )}
        </div>

        <div>
          <h3 className="text-[20px] md:text-[24px] font-black text-white uppercase tracking-tighter truncate">
            {job.customerName}
          </h3>
          <div className="flex items-center gap-2 text-[12px] md:text-[14px] font-bold text-white/40 uppercase mt-1">
            <MapPin size={14} className="text-[#007AFF] shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-white/30">
            <Clock size={16} />
            <span className="text-[12px] font-bold font-mono uppercase">
              ETD_{new Date(job.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#007AFF]">
            <Navigation size={16} />
            <span className="text-[12px] font-black uppercase">3.2 MILES_SITE_DIST</span>
          </div>
        </div>
      </div>

      <div className="pl-4 text-white/20 group-hover:text-white">
        <ChevronRight size={28} strokeWidth={1} />
      </div>
    </div>
  );
};
