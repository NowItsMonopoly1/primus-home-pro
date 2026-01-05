
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './components/Dashboard/Overview';
import { TechnicianApp } from './components/Technician/TechnicianApp';
import { JobDetails, JobState, ExecutionEvent } from './types';
import { MOCK_JOBS } from './constants';
import { validateKernelEvent } from './services/forgeexecService';
import { Loader2, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'technician' | 'office'>('technician');
  const [jobs, setJobs] = useState<JobDetails[]>(MOCK_JOBS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kernelMessage, setKernelMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleEvent = useCallback(async (type: string, payload: any) => {
    const jobId = payload.jobId;
    const job = jobs.find(j => j.jobId === jobId);
    const currentState = job ? job.currentState : JobState.LEAD_RECEIVED;

    const event: ExecutionEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      source: activeView === 'technician' ? 'technician-app' : 'office-dashboard'
    };

    setIsProcessing(true);
    const result = await validateKernelEvent(event, currentState);
    setIsProcessing(false);

    if (result.accepted) {
      if (jobId) {
        setJobs(prevJobs => prevJobs.map(j => 
          j.jobId === jobId 
            ? { ...j, currentState: result.newState as JobState } 
            : j
        ));
      }
      setKernelMessage({ text: result.message, type: 'success' });
    } else {
      setKernelMessage({ text: result.error || result.message, type: 'error' });
    }

    setTimeout(() => setKernelMessage(null), 3000);
  }, [jobs, activeView]);

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <div className="h-full relative overflow-hidden">
        {activeView === 'technician' ? (
          <TechnicianApp jobs={jobs} onEvent={handleEvent} />
        ) : (
          <Overview jobs={jobs} onSelectJob={(job) => console.log('REQ_JOB_DET:', job)} />
        )}

        {/* Technical Status Overlay */}
        <div className={`fixed bottom-24 left-4 md:left-10 z-[110] transition-opacity duration-200 ${
          kernelMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {kernelMessage && (
            <div className={`px-3 py-2 border-l-4 flex items-center gap-2 bg-slate-800 text-slate-100 shadow-2xl ${
              kernelMessage.type === 'success' ? 'border-[#0A84FF]' : 'border-red-600'
            }`}>
              <Terminal size={14} className={kernelMessage.type === 'success' ? 'text-[#0A84FF]' : 'text-red-600'} />
              <span className="font-mono text-[11px] font-bold uppercase tracking-tight">{kernelMessage.text}</span>
            </div>
          )}
        </div>

        {/* System Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-white/90 z-[100] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin"></div>
              <div className="text-center">
                <p className="font-black text-[14px] uppercase tracking-widest text-black">KERNEL_VALIDATING...</p>
                <p className="text-slate-400 font-mono text-[10px] mt-1 tracking-widest">TRANSACTION_PROTOCOL_IN_PROGRESS</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
