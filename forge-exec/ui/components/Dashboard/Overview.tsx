
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Briefcase, Clock, CheckCircle, TrendingUp, Search, Filter, 
  ChevronRight, Activity, BrainCircuit, Sparkles, Hash, Download,
  Cloud, Mail, HardDrive, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { JobDetails, JobState } from '../../types';
import { STATE_COLORS } from '../../constants';
import { analyzeJobComplexity } from '../../services/geminiService';
import { triggerDailyExport, verifyExportConfiguration, getExportStats } from '../../services/forgeexecService';

interface OverviewProps {
  jobs: JobDetails[];
  onSelectJob: (job: JobDetails) => void;
}

const data = [
  { name: '06:00', count: 2 },
  { name: '08:00', count: 5 },
  { name: '10:00', count: 8 },
  { name: '12:00', count: 12 },
  { name: '14:00', count: 9 },
];

export const Overview: React.FC<OverviewProps> = ({ jobs, onSelectJob }) => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  // Export system state
  const [exportStatus, setExportStatus] = useState<{
    configured: boolean;
    emailEnabled: boolean;
    cloudEnabled: boolean;
    localEnabled: boolean;
    lastExport?: string;
    nextScheduled?: string;
  } | null>(null);
  const [exportStats, setExportStats] = useState<{
    totalExports: number;
    lastExportDate?: string;
    successRate: number;
    recentExports: Array<{
      date: string;
      success: boolean;
      jobsExported: number;
    }>;
  } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<{
    success: boolean;
    message: string;
    exportDate: string;
    deliveryResults?: {
      local: boolean;
      email: boolean;
      cloud: boolean;
    };
  } | null>(null);

  // Load export configuration on mount
  useEffect(() => {
    const loadExportStatus = async () => {
      try {
        const [config, stats] = await Promise.all([
          verifyExportConfiguration(),
          getExportStats()
        ]);
        setExportStatus(config);
        setExportStats(stats);
      } catch (error) {
        console.error('Failed to load export status:', error);
      }
    };
    loadExportStatus();
  }, []);

  const runEmergencyAnalysis = async (job: JobDetails) => {
    setAnalysisLoading(true);
    const res = await analyzeJobComplexity(job.notes);
    setAnalysisText(res);
    setAnalysisLoading(false);
  };

  const handleManualExport = async () => {
    setExportLoading(true);
    setLastExportResult(null);
    
    try {
      const result = await triggerDailyExport();
      setLastExportResult(result);
      
      // Refresh stats after export
      if (result.success) {
        const stats = await getExportStats();
        setExportStats(stats);
        const config = await verifyExportConfiguration();
        setExportStatus(config);
      }
    } catch (error) {
      setLastExportResult({
        success: false,
        message: 'Export failed - check backend connection',
        exportDate: new Date().toISOString().split('T')[0]
      });
    }
    
    setExportLoading(false);
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col overflow-hidden">
      {/* Ledger Header */}
      <div className="px-6 md:px-10 py-8 border-b border-slate-700/50 bg-slate-800 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-6">
        <div>
          <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase leading-none text-white">Ops_Ledger</h1>
          <p className="text-[10px] font-mono font-bold text-white/30 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={12} className="text-[#007AFF]" /> STREAMING_LIVE // FORGEEXEC_DATA_CENTRAL
          </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleManualExport}
             disabled={exportLoading}
             className="flex-1 md:flex-none bg-[#007AFF] border border-[#007AFF] px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#007AFF]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {exportLoading ? (
               <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <Download size={12} />
             )}
             {exportLoading ? 'EXPORTING...' : 'DATA_EXP'}
           </button>
           <button className="flex-1 md:flex-none bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:invert transition-none">ENTRY_ADD</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 no-scrollbar">
        {/* Metric Grid: Responsive columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {[
            { label: 'Active_Queue', value: jobs.filter(j => j.currentState !== JobState.CLOSED).length, color: 'text-white' },
            { label: 'Pending_Verify', value: 3, color: 'text-amber-500' },
            { label: 'Success_Ratio', value: '98.2%', color: 'text-emerald-500' },
            { label: 'Daily_Projected', value: '$14,250', color: 'text-[#007AFF]' },
          ].map((stat, i) => (
            <div key={i} className="bg-black p-6">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className={`text-[28px] md:text-[36px] font-black tracking-tighter ${stat.color}`}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Export System Status */}
        <div className="bg-white text-black p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <HardDrive size={16} />
              Business Continuity System
            </h3>
            <div className="flex items-center gap-2">
              {exportStatus?.configured ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={14} className="text-amber-600" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {exportStatus?.configured ? 'ACTIVE' : 'CONFIG_NEEDED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Delivery Status */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Delivery Paths</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive size={12} className="text-black/40" />
                  <span className="text-[11px] font-bold">Local Storage</span>
                  <div className="ml-auto">
                    {exportStatus?.localEnabled ? (
                      <CheckCircle size={12} className="text-emerald-600" />
                    ) : (
                      <XCircle size={12} className="text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-black/40" />
                  <span className="text-[11px] font-bold">Email Delivery</span>
                  <div className="ml-auto">
                    {exportStatus?.emailEnabled ? (
                      <CheckCircle size={12} className="text-emerald-600" />
                    ) : (
                      <XCircle size={12} className="text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud size={12} className="text-black/40" />
                  <span className="text-[11px] font-bold">Cloud Backup</span>
                  <div className="ml-auto">
                    {exportStatus?.cloudEnabled ? (
                      <CheckCircle size={12} className="text-emerald-600" />
                    ) : (
                      <XCircle size={12} className="text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Stats */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">System Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold">Total Exports</span>
                  <span className="text-[11px] font-mono font-bold">{exportStats?.totalExports || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold">Success Rate</span>
                  <span className="text-[11px] font-mono font-bold">{exportStats?.successRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] font-bold">Last Export</span>
                  <span className="text-[11px] font-mono font-bold">
                    {exportStatus?.lastExport ? new Date(exportStatus.lastExport).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Export Result */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Last Operation</p>
              {lastExportResult ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {lastExportResult.success ? (
                      <CheckCircle size={12} className="text-emerald-600" />
                    ) : (
                      <XCircle size={12} className="text-red-600" />
                    )}
                    <span className="text-[11px] font-bold">
                      {lastExportResult.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-black/60 leading-tight">{lastExportResult.message}</p>
                  {lastExportResult.deliveryResults && (
                    <div className="flex gap-1 mt-2">
                      <div className={`w-2 h-2 rounded-full ${lastExportResult.deliveryResults.local ? 'bg-emerald-600' : 'bg-red-600'}`} title="Local"></div>
                      <div className={`w-2 h-2 rounded-full ${lastExportResult.deliveryResults.email ? 'bg-emerald-600' : 'bg-red-600'}`} title="Email"></div>
                      <div className={`w-2 h-2 rounded-full ${lastExportResult.deliveryResults.cloud ? 'bg-emerald-600' : 'bg-red-600'}`} title="Cloud"></div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-black/40 italic">No recent exports</p>
              )}
            </div>
          </div>

          {/* Configuration Notice */}
          {!exportStatus?.configured && (
            <div className="bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Configuration Required</p>
                  <p className="text-[10px] text-amber-700 mt-1">
                    Business continuity system needs SMTP, cloud storage, and local paths configured. 
                    Check .env configuration and restart services.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Main Table View: Full width on smaller xl screens */}
          <div className="xl:col-span-8 flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white/40">
                <Briefcase size={16} /> Pipeline_Active
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                  <input type="text" placeholder="QUERY_SYS..." className="w-full md:w-64 pl-10 pr-4 py-2 text-[11px] font-mono bg-white/5 border border-white/10 text-white outline-none uppercase" />
                </div>
                <button className="p-2.5 border border-white/10 hover:bg-white/5 transition-none"><Filter size={16} /></button>
              </div>
            </div>

            <div className="border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-[13px] min-w-[600px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                    <th className="px-6 py-5">Index</th>
                    <th className="px-6 py-5">Client_ID</th>
                    <th className="px-6 py-5">State_Flag</th>
                    <th className="px-6 py-5 text-right">Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map((job) => (
                    <tr 
                      key={job.jobId} 
                      className="hover:bg-white/[0.03] cursor-pointer group transition-none"
                      onClick={() => onSelectJob(job)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-white/30 text-[11px]">
                          <Hash size={10} /> {job.jobId}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-white uppercase tracking-tight">{job.customerName}</div>
                        <div className="text-[11px] text-white/30 font-bold uppercase tracking-tighter mt-1">{job.address}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest ${STATE_COLORS[job.currentState].replace('border-', 'border-').replace('text-', 'text-')}`}>
                          {job.currentState.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-white/20 group-hover:text-white transition-none"><ChevronRight size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Side-car Utilities: Stacks on mobile */}
          <div className="xl:col-span-4 space-y-10">
            <div className="bg-white text-black p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit size={20} className="text-[#007AFF]" />
                  <h3 className="text-[13px] font-black uppercase tracking-[0.2em]">Primus_Audit</h3>
                </div>
                {analysisText && (
                  <button onClick={() => setAnalysisText(null)} className="text-[10px] font-bold text-black/40 uppercase hover:text-black">Reset</button>
                )}
              </div>
              
              <div className="space-y-4">
                {analysisText ? (
                  <div className="p-5 bg-black/5 border border-black/10 text-[12px] font-mono leading-relaxed text-black/70 whitespace-pre-wrap">
                    {analysisText}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[12px] text-black/60 leading-relaxed font-bold uppercase tracking-tight">Select job node for complexity analysis and tactical hazard audit.</p>
                    <button 
                      onClick={() => runEmergencyAnalysis(jobs[2])}
                      disabled={analysisLoading}
                      className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] text-[11px] hover:invert flex items-center justify-center gap-2 transition-none"
                    >
                      {analysisLoading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={14} />}
                      EXEC_DEEP_AUDIT
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal_Throughput</h3>
              <div className="h-48 border border-white/5 p-4 bg-white/[0.02]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#ffffff30', fontWeight: 800 }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#000', borderRadius: '0', border: '1px solid #ffffff10', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold' }} />
                    <Bar dataKey="count" fill="#ffffff" radius={0} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
