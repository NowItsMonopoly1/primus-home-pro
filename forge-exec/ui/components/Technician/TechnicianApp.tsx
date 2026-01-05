
import React, { useState } from 'react';
import { 
  ClipboardList, Map as MapIcon, ChevronLeft, 
  Camera, Mic, Navigation, Phone, Info,
  Search as SearchIcon, ShoppingCart, Sparkles, MoreHorizontal, Activity, User, Settings, FileText, Menu
} from 'lucide-react';
import { JobDetails, JobState, Priority } from '../../types';
import { JobCard } from './JobCard';
import { STATE_COLORS, PRIORITY_COLORS } from '../../constants';
import { searchElectricalRegulations, findNearbySupplyStores } from '../../services/geminiService';
import { GroundingResults } from '../GroundingResults';

interface TechAppProps {
  jobs: JobDetails[];
  onEvent: (type: string, payload: any) => void;
}

export const TechnicianApp: React.FC<TechAppProps> = ({ jobs, onEvent }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [supplyResult, setSupplyResult] = useState<{ text: string; sources: any[] } | null>(null);
  
  // Queue filters
  const [queueFilter, setQueueFilter] = useState<'all' | 'today' | 'urgent'>('all');
  const [queueSort, setQueueSort] = useState<'time' | 'distance' | 'priority'>('time');
  
  // Capture state
  const [materialSearch, setMaterialSearch] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [loggedMaterials, setLoggedMaterials] = useState<MaterialLog[]>([]);
  
  // Orders state
  const [orderDescription, setOrderDescription] = useState('');
  const [orderCost, setOrderCost] = useState('');
  const [orderPriority, setOrderPriority] = useState<Priority>(Priority.MEDIUM);
  
  // GPS state
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Common materials database
  const commonMaterials = [
    { sku: 'BRK-20A', name: '20A Circuit Breaker', cost: 12.50 },
    { sku: 'BRK-30A', name: '30A Circuit Breaker', cost: 18.75 },
    { sku: 'WRE-12G', name: '12 Gauge Wire (100ft)', cost: 45.00 },
    { sku: 'WRE-14G', name: '14 Gauge Wire (100ft)', cost: 35.00 },
    { sku: 'OUT-15A', name: '15A GFCI Outlet', cost: 22.00 },
    { sku: 'OUT-20A', name: '20A Outlet', cost: 8.50 },
    { sku: 'BOX-STL', name: 'Steel Junction Box', cost: 6.25 },
    { sku: 'CON-3/4', name: '3/4" Conduit (10ft)', cost: 12.00 },
  ];

  const handleNECSearch = async () => {
    if (!selectedJob) return;
    setAiLoading(true);
    const res = await searchElectricalRegulations(selectedJob.jobType);
    setCodeResult(res);
    setAiLoading(false);
  };

  const handleFindSupplies = async () => {
    setAiLoading(true);
    const res = await findNearbySupplyStores(37.7749, -122.4194);
    setSupplyResult(res);
    setAiLoading(false);
  };

  if (selectedJob) {
    const isAtWork = selectedJob.currentState === JobState.ON_SITE;

    return (
      <div className="h-full bg-slate-900 flex flex-col md:flex-row overflow-hidden">
        {/* Detail Rail */}
        <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 xl:w-1/3 border-r border-slate-700/50 overflow-y-auto no-scrollbar pb-32 md:pb-0">
          <header className="h-16 border-b border-slate-700/50 px-6 flex items-center justify-between sticky top-0 bg-slate-800 z-20">
            <button 
              onClick={() => { setSelectedJob(null); setCodeResult(null); setSupplyResult(null); }} 
              className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white"
            >
              <ChevronLeft size={18} />
              EXIT_JOB
            </button>
            <span className="text-[10px] font-mono font-bold text-[#007AFF] uppercase">{selectedJob.jobId}</span>
          </header>

          <div className="p-6 md:p-10 space-y-10">
            <div className="space-y-4">
              <h1 className="text-[32px] md:text-[44px] font-black leading-none uppercase tracking-tighter text-white">
                {selectedJob.customerName}
              </h1>
              <div className="grid grid-cols-2 border border-white/10">
                <div className="p-5 border-r border-white/10">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">State_Status</p>
                  <p className="text-[13px] font-bold uppercase">{selectedJob.currentState.replace('_', ' ')}</p>
                </div>
                <div className="p-5">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Impact_Lv</p>
                  <p className={`text-[13px] font-bold uppercase ${selectedJob.priority === Priority.EMERGENCY ? 'text-red-500' : 'text-white'}`}>
                    {selectedJob.priority}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Site_Logistics</h4>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={handleNECSearch} disabled={aiLoading} className="flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20">
                  <SearchIcon size={20} />
                  <span className="text-[9px] font-black uppercase mt-3 tracking-widest">NEC_REF</span>
                </button>
                <button onClick={handleFindSupplies} disabled={aiLoading} className="flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20">
                  <ShoppingCart size={20} />
                  <span className="text-[9px] font-black uppercase mt-3 tracking-widest">SUPPLY</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 hover:bg-white/10">
                  <Phone size={20} />
                  <span className="text-[9px] font-black uppercase mt-3 tracking-widest">COORD</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Technical_Briefing</h4>
              <div className="bg-zinc-900 p-6 border-l-4 border-white font-mono text-sm text-zinc-300 leading-relaxed italic">
                "{selectedJob.notes}"
              </div>
            </div>

            {/* Mobile/Small Tablet Action Bar (Only visible if not on large screen or as part of the flow) */}
            <div className="md:hidden space-y-4 pt-6">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Execution_Protocol</h4>
              {selectedJob.currentState === JobState.SCHEDULED && (
                <button onClick={() => onEvent('TECHNICIAN_DISPATCHED', { jobId: selectedJob.jobId })} className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.3em] text-xs">INITIATE_DISPATCH</button>
              )}
              {selectedJob.currentState === JobState.DISPATCHED && (
                <button onClick={() => onEvent('TECHNICIAN_ARRIVED', { jobId: selectedJob.jobId })} className="w-full bg-[#007AFF] text-white py-5 font-black uppercase tracking-[0.3em] text-xs">CONFIRM_ARRIVAL</button>
              )}
              {selectedJob.currentState === JobState.ON_SITE && (
                <button onClick={() => onEvent('WORK_COMPLETED', { jobId: selectedJob.jobId })} className="w-full bg-emerald-600 text-white py-5 font-black uppercase tracking-[0.3em] text-xs">FINAL_SIGNOFF</button>
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Canvas (Tablet/Desktop) */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto no-scrollbar">
           {(codeResult || supplyResult || aiLoading) ? (
             <div className="p-10 md:p-16 max-w-3xl">
                <div className="flex items-center gap-4 mb-10">
                  <Sparkles size={32} className="text-[#007AFF]" />
                  <h2 className="text-[24px] md:text-[32px] font-black uppercase tracking-tight">Kernel_Intelligence_Node</h2>
                </div>
                {aiLoading ? (
                   <div className="space-y-8">
                     <div className="h-5 w-full bg-white/5 animate-pulse"></div>
                     <div className="h-5 w-4/5 bg-white/5 animate-pulse"></div>
                     <div className="h-5 w-2/3 bg-white/5 animate-pulse"></div>
                   </div>
                ) : (
                  <div className="space-y-10">
                    <div className="text-[18px] md:text-[22px] leading-relaxed text-zinc-400 font-medium">
                      {codeResult?.text || supplyResult?.text}
                    </div>
                    <GroundingResults sources={codeResult?.sources || supplyResult?.sources || []} type={codeResult ? 'web' : 'maps'} />
                  </div>
                )}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-20 space-y-6">
                <Activity size={120} strokeWidth={0.5} />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">SYSTEM_READY_FOR_INPUT</p>
             </div>
           )}

           {/* Desktop Action Bar */}
           <div className="hidden md:block mt-auto p-10 border-t border-white/5 bg-black">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-1">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active_Protocol</p>
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Current Phase: {selectedJob.currentState.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-4">
                  {selectedJob.currentState === JobState.SCHEDULED && (
                    <button onClick={() => onEvent('TECHNICIAN_DISPATCHED', { jobId: selectedJob.jobId })} className="px-10 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs">EXEC_DISPATCH</button>
                  )}
                  {selectedJob.currentState === JobState.DISPATCHED && (
                    <button onClick={() => onEvent('TECHNICIAN_ARRIVED', { jobId: selectedJob.jobId })} className="px-10 py-4 bg-[#007AFF] text-white font-black uppercase tracking-[0.3em] text-xs">CONFIRM_SITE</button>
                  )}
                  {selectedJob.currentState === JobState.ON_SITE && (
                    <button onClick={() => onEvent('WORK_COMPLETED', { jobId: selectedJob.jobId })} className="px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-[0.3em] text-xs">FINAL_SIGNOFF</button>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
      <div className="px-6 md:px-12 py-10 md:py-16 border-b border-slate-700/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="text-[#007AFF] font-mono font-black text-[10px] uppercase tracking-[0.4em]">OPERATIONAL_FEED_PRO</p>
            <h1 className="text-[48px] md:text-[80px] font-black text-slate-100 leading-[0.85] uppercase tracking-tighter">
              {activeTab === 'jobs' && 'Site_Queue'}
              {activeTab === 'map' && 'GPS_Atlas'}
              {activeTab === 'profile' && 'Operator'}
              {activeTab === 'settings' && 'System'}
            </h1>
          </div>
          <button 
            onClick={() => {
              setIsClockedIn(!isClockedIn);
              onEvent(isClockedIn ? 'TECHNICIAN_CLOCKED_OUT' : 'TECHNICIAN_CLOCKED_IN', { techId: 'Tech-01' });
            }}
            className={`px-12 py-5 font-black text-[13px] uppercase tracking-[0.2em] border-2 transition-none ${
              isClockedIn ? 'border-red-600 text-red-600' : 'bg-white text-black border-white'
            }`}
          >
            {isClockedIn ? 'OFF_DUTY' : 'ON_DUTY'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {activeTab === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* Queue Controls */}
            <div className="sticky top-0 bg-slate-900 z-10 py-4 space-y-3">
              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['all', 'today', 'urgent'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setQueueFilter(filter as any)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
                      queueFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {filter === 'all' ? '🔘 All Jobs' : filter === 'today' ? '📅 Today' : '🚨 Urgent'}
                  </button>
                ))}
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-mono uppercase">Sort:</span>
                {['time', 'distance', 'priority'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => setQueueSort(sort as any)}
                    className={`px-3 py-1 rounded font-mono uppercase ${
                      queueSort === sort
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {sort}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Job Cards */}
            <div className="space-y-3 mt-2">
              {jobs
                .filter(j => j.currentState !== JobState.CLOSED)
                .filter(j => {
                  if (queueFilter === 'today') return true; // Mock: show all
                  if (queueFilter === 'urgent') return j.priority === Priority.HIGH || j.priority === Priority.EMERGENCY;
                  return true;
                })
                .map(job => (
                  <JobCard key={job.jobId} job={job} onSelect={setSelectedJob} />
                ))}
            </div>
          </div>
        )}
        
        {activeTab === 'map' && (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
            {/* Current Location */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Current Position</h3>
                <button 
                  onClick={() => setCurrentLocation({ lat: 37.7749, lng: -122.4194 })}
                  className="text-xs font-mono uppercase text-blue-400 hover:text-blue-300"
                >
                  📍 Refresh GPS
                </button>
              </div>
              {currentLocation ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded">
                    <span className="text-slate-400 font-mono text-xs">Latitude:</span>
                    <span className="text-white font-mono font-bold">{currentLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded">
                    <span className="text-slate-400 font-mono text-xs">Longitude:</span>
                    <span className="text-white font-mono font-bold">{currentLocation.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-900/30 border border-green-500/30 rounded">
                    <span className="text-green-400 font-mono text-xs">Status:</span>
                    <span className="text-green-400 font-mono font-bold">LOCKED</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setCurrentLocation({ lat: 37.7749, lng: -122.4194 })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg uppercase tracking-wide"
                >
                  Enable GPS
                </button>
              )}
            </div>
            
            {/* Next Job Navigation */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Next Job Site</h3>
              {jobs.filter(j => j.currentState === JobState.DISPATCHED)[0] ? (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <p className="text-white font-bold mb-1">{jobs.filter(j => j.currentState === JobState.DISPATCHED)[0].customerName}</p>
                    <p className="text-slate-400 text-sm font-mono">{jobs.filter(j => j.currentState === JobState.DISPATCHED)[0].address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded text-center">
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">Distance</p>
                      <p className="text-white font-black text-xl">3.2mi</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded text-center">
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">ETA</p>
                      <p className="text-white font-black text-xl">8min</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg uppercase tracking-wide flex items-center justify-center gap-2">
                    <Navigation size={20} />
                    Start Navigation
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8 font-mono text-sm">No dispatched jobs</p>
              )}
            </div>
            
            {/* All Jobs Map View */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Job Locations</h3>
              <div className="space-y-2">
                {jobs.filter(j => j.currentState !== JobState.CLOSED).slice(0, 3).map(job => (
                  <div key={job.jobId} className="flex items-center justify-between p-3 bg-slate-900 rounded hover:bg-slate-700 cursor-pointer transition-colors">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{job.customerName}</p>
                      <p className="text-slate-400 text-xs font-mono">{job.address.split(',')[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-bold font-mono text-sm">2.4mi</p>
                      <p className="text-slate-500 text-xs font-mono">SE</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'capture' && (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {/* Photo Capture */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Photo Documentation</h3>
              <button 
                onClick={() => setCapturedPhotos([...capturedPhotos, `photo-${Date.now()}`])}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <Camera size={24} />
                <span className="uppercase tracking-wide">Take Photo</span>
              </button>
              <p className="text-slate-400 text-xs mt-3 text-center font-mono">Before/after shots, materials, code compliance</p>
              
              {/* Photo Gallery */}
              {capturedPhotos.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-mono uppercase text-slate-400">Captured Today</p>
                    <span className="text-xs font-mono text-blue-400">{capturedPhotos.length} photos</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {capturedPhotos.map((photo, i) => (
                      <div key={photo} className="aspect-square bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center relative group">
                        <Camera size={16} className="text-slate-600" />
                        <button 
                          onClick={() => setCapturedPhotos(capturedPhotos.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Materials Logging */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Materials Used</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or SKU..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  {/* Material Suggestions */}
                  {materialSearch && (
                    <div className="absolute z-20 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {commonMaterials
                        .filter(m => 
                          m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
                          m.sku.toLowerCase().includes(materialSearch.toLowerCase())
                        )
                        .slice(0, 5)
                        .map(material => (
                          <button
                            key={material.sku}
                            onClick={() => {
                              setLoggedMaterials([...loggedMaterials, { id: `mat-${Date.now()}`, ...material, quantity: 1 }]);
                              setMaterialSearch('');
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-700/50 last:border-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-semibold text-sm">{material.name}</p>
                                <p className="text-slate-500 text-xs font-mono">{material.sku}</p>
                              </div>
                              <p className="text-green-400 font-bold font-mono text-sm">${material.cost}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                
                {/* Quick Add Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {commonMaterials.slice(0, 4).map(material => (
                    <button
                      key={material.sku}
                      onClick={() => setLoggedMaterials([...loggedMaterials, { id: `mat-${Date.now()}`, ...material, quantity: 1 }])}
                      className="p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
                    >
                      <p className="text-white font-semibold text-xs truncate">{material.name}</p>
                      <p className="text-slate-500 text-xs font-mono">${material.cost}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Logged Materials */}
              {loggedMaterials.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono uppercase text-slate-400">Logged Items</p>
                    <p className="text-xs font-mono text-green-400">
                      Total: ${loggedMaterials.reduce((sum, m) => sum + (m.cost * m.quantity), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {loggedMaterials.map((material, i) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg group">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{material.name}</p>
                          <p className="text-slate-500 text-xs font-mono">{material.sku} × {material.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-white font-bold font-mono">${(material.cost * material.quantity).toFixed(2)}</p>
                          <button 
                            onClick={() => setLoggedMaterials(loggedMaterials.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors uppercase tracking-wide">
                    Submit Materials ({loggedMaterials.length})
                  </button>
                </div>
              )}
            </div>

            {/* Voice Notes */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Voice Documentation</h3>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3">
                <Mic size={24} />
                <span className="uppercase tracking-wide">Record Note</span>
              </button>
              <p className="text-slate-400 text-xs mt-3 text-center font-mono">Hands-free work documentation, observations, issues</p>
              <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg">
                <p className="text-slate-500 text-xs font-mono uppercase mb-2">Recent Recordings</p>
                <p className="text-slate-600 text-xs text-center py-2">No recordings yet</p>
              </div>
            </div>

            {/* Labor Hours */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Labor Tracking</h3>
              <div className="bg-slate-900 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 font-mono uppercase text-xs">Time on Current Job:</span>
                  <span className="text-3xl font-black text-white font-mono">2h 15m</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">Started:</span>
                  <span className="text-slate-400 font-mono">09:45 AM</span>
                </div>
              </div>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors uppercase tracking-wide">
                Submit Labor Hours
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {/* New Change Order */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">New Change Order</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase mb-2">Description *</label>
                  <textarea 
                    placeholder="Describe additional work needed..."
                    rows={4}
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  />
                  <p className="text-slate-500 text-xs mt-1 font-mono">{orderDescription.length}/500 characters</p>
                </div>
                
                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase mb-2">Estimated Cost *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-mono">$</span>
                    <input 
                      type="text" 
                      placeholder="0.00"
                      value={orderCost}
                      onChange={(e) => setOrderCost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase mb-2">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(priority => (
                      <button
                        key={priority}
                        onClick={() => setOrderPriority(priority)}
                        className={`py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
                          orderPriority === priority
                            ? priority === Priority.LOW
                              ? 'bg-green-600 text-white'
                              : priority === Priority.MEDIUM
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {priority === Priority.LOW ? '🟢 Low' : priority === Priority.MEDIUM ? '🟡 Med' : '🔴 High'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase mb-2">Attach Photos</label>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3">
                    <Camera size={20} />
                    <span className="uppercase tracking-wide text-sm">Add Photos</span>
                  </button>
                  <p className="text-slate-500 text-xs mt-1 font-mono">0 photos attached</p>
                </div>

                <div className="pt-2">
                  <button 
                    disabled={!orderDescription || !orderCost}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors uppercase tracking-wide"
                  >
                    {orderDescription && orderCost ? 'Submit Change Order' : 'Complete Required Fields'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Change Orders */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Pending Approvals</h3>
              <div className="space-y-3">
                {/* Mock pending order */}
                <div className="bg-slate-900 border-l-4 border-yellow-500 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold font-mono text-sm">CO-2026-003</span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded">Pending</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2 font-semibold">Panel Upgrade Extension</p>
                      <p className="text-slate-500 text-xs font-mono">Additional circuit breakers needed for expansion</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700 mt-3">
                    <div>
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">Estimated</p>
                      <p className="text-white font-black font-mono text-lg">$450.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">Submitted</p>
                      <p className="text-slate-400 font-mono text-xs">2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                {/* Mock approved order */}
                <div className="bg-slate-900 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold font-mono text-sm">CO-2026-002</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded">Approved</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2 font-semibold">GFCI Outlet Upgrade</p>
                      <p className="text-slate-500 text-xs font-mono">Replace standard outlets with GFCI in kitchen area</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700 mt-3">
                    <div>
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">Approved</p>
                      <p className="text-green-400 font-black font-mono text-lg">$185.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-xs font-mono uppercase mb-1">Approved By</p>
                      <p className="text-slate-400 font-mono text-xs">Office • 1h ago</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs text-center font-mono uppercase pt-2">2 total orders</p>
              </div>
            </div>
            
            {/* Change Order Guidelines */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5">
              <h4 className="text-blue-400 font-black uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
                <Info size={16} />
                Guidelines
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 font-mono leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Request approval BEFORE starting additional work</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Include detailed description and cost breakdown</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Attach photos showing why work is needed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>HIGH priority for safety or code compliance issues</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <nav className="h-24 bg-slate-800 border-t border-slate-700/50 fixed bottom-0 left-0 right-0 px-8 md:px-24 flex justify-between items-center z-20">
        {[
          { id: 'jobs', icon: ClipboardList, label: 'QUEUE' },
          { id: 'map', icon: MapIcon, label: 'ATLAS' },
          { id: 'capture', icon: Camera, label: 'CAPTURE' },
          { id: 'orders', icon: FileText, label: 'ORDERS' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-2 transition-none ${
              activeTab === tab.id ? 'text-[#007AFF]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon size={26} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
