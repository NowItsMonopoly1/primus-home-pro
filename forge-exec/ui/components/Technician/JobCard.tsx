
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
  const isHighPriority = job.priority === Priority.HIGH;

  return (
    <div
      onClick={() => onSelect(job)}
      className={`border-b border-slate-700/30 p-4 md:p-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 cursor-pointer group flex items-center justify-between transition-colors ${
        isEmergency ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/40">
            <Hash size={12} />
            <span>{job.jobId}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATE_COLORS[job.currentState].replace('border-', 'bg-').replace('text-', 'text-')}`}>
            {job.currentState.replace('_', ' ')}
          </span>
          {isEmergency && (
            <span className="text-xs font-bold px-2 py-0.5 bg-red-600 text-white rounded">
              🚨 Emergency
            </span>
          )}
          {!isEmergency && isHighPriority && (
            <span className="text-xs font-bold px-2 py-0.5 bg-orange-600 text-white rounded">
              High Priority
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white truncate">
            {job.customerName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
            <MapPin size={14} className="text-blue-400 shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-white/40">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {new Date(job.scheduledTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <Navigation size={16} />
            <span className="text-sm font-semibold">3.2 miles</span>
          </div>
        </div>
      </div>

      <div className="pl-4 text-white/20 group-hover:text-white transition-colors">
        <ChevronRight size={24} strokeWidth={2} />
      </div>
    </div>
  );
};
