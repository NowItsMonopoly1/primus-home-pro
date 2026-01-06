
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './components/Dashboard/Overview';
import { TechnicianApp } from './components/Technician/TechnicianApp';
import { JobDetails, JobState, ExecutionEvent } from './types';
import { MOCK_JOBS } from './constants';
import { validateKernelEvent } from './services/forgeexecService';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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

        {/* Status Message */}
        <div className={`fixed bottom-24 left-4 md:left-10 z-[110] transition-opacity duration-200 ${
          kernelMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {kernelMessage && (
            <div className={`px-4 py-3 rounded-lg flex items-center gap-3 shadow-2xl ${
              kernelMessage.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}>
              {kernelMessage.type === 'success' ? (
                <CheckCircle2 size={18} className="text-white" />
              ) : (
                <AlertCircle size={18} className="text-white" />
              )}
              <span className="text-sm font-semibold">{kernelMessage.text}</span>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-white/95 z-[100] flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-lg text-slate-900">Updating job status...</p>
                <p className="text-slate-500 text-sm mt-1">Please wait</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
