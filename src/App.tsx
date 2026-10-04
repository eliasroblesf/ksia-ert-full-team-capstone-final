/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Activity, 
  Users, 
  ChevronRight, 
  AlertCircle, 
  FileText, 
  RefreshCcw,
  CheckCircle2,
  Lock,
  Download,
  Info,
  Radio,
  Zap,
  MessageSquare,
  AlertTriangle,
  Mic2,
  Flame,
  Stethoscope,
  Shield,
  Building,
  DoorOpen,
  Send,
  Eye,
  Check,
  ArrowRight,
  UserX,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Volume2,
  PhoneCall,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { scenarios, Scenario } from './data/scenarios';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type AppPhase = 'LOBBY' | 'TEAM_SETUP' | 'TERMINAL' | 'RESULT';

interface TeamRoles {
  teamLeader: string;
  suppressionLead: string;
  casualtyCareLead: string;
  evacuationSupportLead: string;
  externalLiaison: string;
}

interface PerformanceGauges {
  containment: number;
  lifeSafety: number;
  egressFlow: number;
  regulatory: number;
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('LOBBY');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  // Roster Roles
  const [roles, setRoles] = useState<TeamRoles>({
    teamLeader: '',
    suppressionLead: '',
    casualtyCareLead: '',
    evacuationSupportLead: '',
    externalLiaison: ''
  });

  // Simulation State
  const [time, setTime] = useState(900); // 15 minutes
  const [isActive, setIsActive] = useState(false);
  const [activeInjects, setActiveInjects] = useState<string[]>([]);
  const [tacticalLog, setTacticalLog] = useState<{time: string, msg: string}[]>([]);
  
  // Current Objective Step (2 through 7 in Terminal)
  const [currentStep, setCurrentStep] = useState(2);

  // Objectives Task Progress Tracking
  // Step 2: Size-Up Tasks
  const [sizeUpTasks, setSizeUpTasks] = useState({
    hazardIdentified: false,
    casualtyChecked: false,
    routeSelected: false,
  });

  // Step 3: L-N-N-H Radio Report Transmission Tasks
  const [lnnhTasks, setLnnhTasks] = useState({
    locationSent: false,
    natureSent: false,
    numbersSent: false,
    hazardsSent: false,
  });

  // Step 4: Tactical Actions by Role
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const [roleActionCounts, setRoleActionCounts] = useState<Record<string, number>>({
    teamLeader: 0,
    suppressionLead: 0,
    casualtyCareLead: 0,
    evacuationSupportLead: 0,
  });

  // Step 5: Secondary Problem Resolution Tasks
  const [resolvedInjects, setResolvedInjects] = useState<{
    radioFixed: boolean;
    hvacFixed: boolean;
    doorFixed: boolean;
  }>({
    radioFixed: false,
    hvacFixed: false,
    doorFixed: false,
  });

  // Step 6: Handover Prep Tasks
  const [prepTasks, setPrepTasks] = useState({
    atmistCompiled: false,
    headcountVerified: false,
    sceneSecured: false,
  });

  // Tactical Safety Gauges
  const [gauges, setGauges] = useState<PerformanceGauges>({
    containment: 70,
    lifeSafety: 80,
    egressFlow: 50,
    regulatory: 60
  });

  // Scoring & Debrief
  const [score, setScore] = useState(0);
  const [plusDelta, setPlusDelta] = useState({ plus: ['', '', ''], delta: ['', '', ''] });

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTacticalLog = (msg: string) => {
    const timestamp = formatTime(time);
    setTacticalLog(prev => [{ time: timestamp, msg }, ...prev]);
  };

  // Master Clock & Passive Drift
  useEffect(() => {
    let interval: any;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev - 1;
          const elapsed = 900 - newTime;
          
          if (selectedScenario) {
            selectedScenario.cascadingInjects.forEach(inject => {
              if (elapsed === inject.time) {
                setActiveInjects(prevInjects => {
                  if (prevInjects.includes(inject.title)) return prevInjects;
                  return [...prevInjects, inject.title];
                });
                addTacticalLog(`ALERT: ${inject.title} - ${inject.description}`);
              }
            });
          }

          // Gentle natural decay
          setGauges(g => ({
            containment: Math.max(0, g.containment - 0.03),
            lifeSafety: Math.max(0, g.lifeSafety - 0.05),
            egressFlow: Math.max(0, g.egressFlow - 0.03),
            regulatory: Math.max(0, g.regulatory - 0.02)
          }));

          return newTime;
        });
      }, 1000);
    } else if (time === 0 && isActive) {
      handleFinishDrill();
    }
    return () => clearInterval(interval);
  }, [isActive, time, selectedScenario]);

  const handleSelectGroup = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setPhase('TEAM_SETUP');
    setIsActive(true);
    setCurrentStep(1);
    addTacticalLog(`OFFICE SCENARIO SELECTED: ${scenario.name.toUpperCase()}`);
  };

  const handleStartDrill = () => {
    if (Object.values(roles).some(r => !r.trim())) return;
    setPhase('TERMINAL');
    setCurrentStep(2);
    addTacticalLog('TERMINAL READY: PROCEEDING TO OBJECTIVE 2 - CRISIS SIZE-UP');
  };

  const handleFinishDrill = () => {
    setIsActive(false);
    
    const gaugeScore = (gauges.containment + gauges.lifeSafety + gauges.egressFlow + gauges.regulatory) / 4;
    
    // Count successful task completions across all objectives
    let objectivePoints = 0;
    if (sizeUpTasks.hazardIdentified) objectivePoints += 5;
    if (sizeUpTasks.casualtyChecked) objectivePoints += 5;
    if (sizeUpTasks.routeSelected) objectivePoints += 5;
    
    if (lnnhTasks.locationSent) objectivePoints += 5;
    if (lnnhTasks.natureSent) objectivePoints += 5;
    if (lnnhTasks.numbersSent) objectivePoints += 5;
    if (lnnhTasks.hazardsSent) objectivePoints += 5;

    if (resolvedInjects.radioFixed) objectivePoints += 5;
    if (resolvedInjects.hvacFixed) objectivePoints += 5;
    if (resolvedInjects.doorFixed) objectivePoints += 5;

    if (prepTasks.atmistCompiled) objectivePoints += 5;
    if (prepTasks.headcountVerified) objectivePoints += 5;
    if (prepTasks.sceneSecured) objectivePoints += 5;

    // Role actions
    let actionBonus = 0;
    executedActions.forEach(id => {
      if (['icp', 'cvse', 'iso', 'pass', 'survey', 'cpr_cycle', 'sweep', 'lnnh'].includes(id)) {
        actionBonus += 6;
      } else {
        actionBonus -= 15;
      }
    });

    const finalRaw = Math.round((gaugeScore * 0.3) + (objectivePoints * 0.45) + (Math.max(0, actionBonus) * 0.25));
    const finalScore = Math.min(100, Math.max(10, finalRaw));
    
    setScore(finalScore);
    setPhase('RESULT');
    if (finalScore >= 75) confetti();
  };

  const performAction = (role: string, actionId: string, isCorrect: boolean, label: string, logMsg: string) => {
    if (!isActive) return;
    
    const currentCount = roleActionCounts[role] || 0;
    if (currentCount >= 2 && !executedActions.includes(actionId)) {
      alert(`Role Limit Reached: Only 2 tactical actions allowed per functional lead.`);
      return;
    }

    if (executedActions.includes(actionId)) return;

    setGauges(prev => ({
      containment: Math.min(100, Math.max(0, prev.containment + (isCorrect ? 15 : -20))),
      lifeSafety: Math.min(100, Math.max(0, prev.lifeSafety + (isCorrect ? 15 : -25))),
      egressFlow: Math.min(100, Math.max(0, prev.egressFlow + (isCorrect ? 15 : -15))),
      regulatory: Math.min(100, Math.max(0, prev.regulatory + (isCorrect ? 15 : -20)))
    }));

    setExecutedActions(prev => [...prev, actionId]);
    setRoleActionCounts(prev => ({ ...prev, [role]: (prev[role] || 0) + 1 }));
    addTacticalLog(`${roles[role as keyof TeamRoles].toUpperCase()}: ${logMsg}`);
  };

  const downloadDossier = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('King Salman International Airport (KSIA) ERT', 20, 20);
    doc.setFontSize(13);
    doc.text('Airport Office Crisis Response - Capstone Drill Dossier', 20, 28);
    
    doc.setFontSize(10);
    doc.text(`Office Scenario: ${selectedScenario?.name}`, 20, 38);
    doc.text(`Location: ${selectedScenario?.location}`, 20, 44);
    doc.text(`Overall Team Score: ${score} / 100`, 20, 50);
    doc.text(`Result: ${score >= 75 ? 'PASSED - GACA CERTIFIED' : 'NEEDS PRACTICE DRILL'}`, 20, 56);
    
    doc.setFontSize(12);
    doc.text('Certified Responders (ICS Cell):', 20, 68);
    doc.setFontSize(9);
    doc.text(`- Team Leader: ${roles.teamLeader}`, 25, 75);
    doc.text(`- Fire & Hazard Lead: ${roles.suppressionLead}`, 25, 81);
    doc.text(`- First Aid Lead: ${roles.casualtyCareLead}`, 25, 87);
    doc.text(`- Evacuation Lead: ${roles.evacuationSupportLead}`, 25, 93);
    doc.text(`- Airport Comms Liaison: ${roles.externalLiaison}`, 25, 99);

    doc.setFontSize(12);
    doc.text('Drill Objectives Verified:', 20, 112);
    doc.setFontSize(9);
    doc.text(`✓ Objective 1: Full Team Roster Mobilized`, 25, 119);
    doc.text(`✓ Objective 2: Office Crisis Size-Up & Primary Hazard Identification`, 25, 125);
    doc.text(`✓ Objective 3: 4-Part L-N-N-H Emergency Transmission to AOCC`, 25, 131);
    doc.text(`✓ Objective 4: Core Tactical Actions Executed by Functional Leads`, 25, 137);
    doc.text(`✓ Objective 5: Cascading Office System Complications Resolved`, 25, 143);
    doc.text(`✓ Objective 6: ATMIST Casualty Card & Headcount Verification Completed`, 25, 149);
    doc.text(`✓ Objective 7: Formal Command Handover Delivered to Civil Defense`, 25, 155);

    doc.setFontSize(12);
    doc.text('Team Self-Evaluation & Notes:', 20, 170);
    doc.setFontSize(9);
    doc.text('What Went Well:', 20, 178);
    plusDelta.plus.forEach((p, i) => {
      if (p.trim()) doc.text(`- ${p}`, 25, 184 + (i * 6));
    });

    doc.text('Improvement Areas:', 20, 206);
    plusDelta.delta.forEach((d, i) => {
      if (d.trim()) doc.text(`- ${d}`, 25, 212 + (i * 6));
    });

    doc.save(`KSIA-Office-Drill-Report-${selectedScenario?.id || 'dossier'}.pdf`);
  };

  const Gauge = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-300 font-mono font-bold">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  );

  // Helper to determine if current objective tasks are finished
  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 2:
        return sizeUpTasks.hazardIdentified && sizeUpTasks.casualtyChecked && sizeUpTasks.routeSelected;
      case 3:
        return lnnhTasks.locationSent && lnnhTasks.natureSent && lnnhTasks.numbersSent && lnnhTasks.hazardsSent;
      case 4:
        return executedActions.length >= 4;
      case 5:
        return resolvedInjects.radioFixed && resolvedInjects.hvacFixed && resolvedInjects.doorFixed;
      case 6:
        return prepTasks.atmistCompiled && prepTasks.headcountVerified && prepTasks.sceneSecured;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const currentCanAdvance = isStepComplete(currentStep);

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 selection:bg-amber-500/30">
      <OfflineIndicator />
      
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-[#0a0f1a] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <Building className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              KSIA ERT TACTICAL TERMINAL
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                Airport Offices
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">King Salman International Airport • Emergency Drill</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-mono font-bold text-amber-500 tracking-tighter">
              <Clock className="w-5 h-5 opacity-60" />
              {formatTime(time)}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">15-Min Mission Clock</div>
          </div>
          <PWAInstallButton />
        </div>
      </header>

      <main className="p-3 sm:p-6 max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          
          {/* LOBBY PHASE */}
          {phase === 'LOBBY' && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center max-w-3xl mx-auto space-y-3 py-4 sm:py-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" /> Airport Offices Crisis Training
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Airport Offices Crisis Drill
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed px-2">
                  Select your assigned airport office sector below. You will be guided through consecutive objective stages with clear, actionable tasks to stabilize the emergency and safely evacuate the building.
                </p>
                <div className="flex justify-center pt-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold animate-pulse">
                    <Clock className="w-4 h-4" /> 15-MINUTE DRILL TIMER STARTS UPON OFFICE SELECTION
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scenarios.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectGroup(s)}
                    className="group relative text-left p-6 bg-[#0a0f1a] border border-slate-800 rounded-2xl hover:border-amber-500/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col justify-between cursor-pointer"
                  >
                    <div className="absolute top-4 right-4 text-slate-800 group-hover:text-amber-500/20 text-5xl font-black transition-colors">
                      0{idx + 1}
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div className="inline-flex p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-400">
                        {idx === 0 && <Building className="w-6 h-6 text-amber-400" />}
                        {idx === 1 && <Radio className="w-6 h-6 text-blue-400" />}
                        {idx === 2 && <Shield className="w-6 h-6 text-red-400" />}
                        {idx === 3 && <Users className="w-6 h-6 text-emerald-400" />}
                        {idx === 4 && <Zap className="w-6 h-6 text-orange-400" />}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">OFFICE SCENARIO 0{idx + 1}</div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mt-0.5">{s.name}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                        {s.location}
                      </span>
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* TEAM SETUP PHASE (OBJECTIVE 1) */}
          {phase === 'TEAM_SETUP' && selectedScenario && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="max-w-4xl mx-auto space-y-6 py-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <button onClick={() => setPhase('LOBBY')} className="text-amber-400 text-xs sm:text-sm flex items-center gap-1 hover:underline mb-2 font-medium cursor-pointer">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Change Office Scenario
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center shrink-0">
                      <span className="text-lg font-black text-amber-500">1</span>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">Objective 1: Confirm Emergency Response Team</h2>
                      <p className="text-slate-300 text-sm mt-0.5">Type names for each certified functional lead to initialize the terminal.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0a0f1a] border border-slate-800 p-3 rounded-xl sm:text-right">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Active Office</div>
                  <div className="text-sm font-bold text-amber-400">{selectedScenario.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'teamLeader', label: '1. Team Leader (Command)', desc: 'Leads the team, sets up safe command post, coordinates all roles.', icon: Shield, color: 'text-red-400' },
                  { key: 'suppressionLead', label: '2. Fire & Hazard Lead', desc: 'Isolates power, operates fire extinguishers, stops fire spread.', icon: Flame, color: 'text-orange-400' },
                  { key: 'casualtyCareLead', label: '3. First Aid & Medical Lead', desc: 'Checks casualty, performs CPR, operates AED defibrillator.', icon: Stethoscope, color: 'text-emerald-400' },
                  { key: 'evacuationSupportLead', label: '4. Office Evacuation Lead', desc: 'Sweeps all offices, ensures doors close, directs staff out.', icon: Users, color: 'text-blue-400' },
                  { key: 'externalLiaison', label: '5. Airport Comms & Liaison', desc: 'Radios Airport Control (AOCC) and guides Civil Defense fire trucks.', icon: Radio, color: 'text-amber-400' },
                ].map((item) => (
                  <div key={item.key} className="p-4 bg-[#0a0f1a] border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        {item.label}
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                    <input 
                      type="text" 
                      placeholder="Type responder full name..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      value={roles[item.key as keyof TeamRoles]}
                      onChange={(e) => setRoles(prev => ({ ...prev, [item.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  {Object.values(roles).filter(r => r.trim()).length} of 5 responder names entered
                </div>
                <button 
                  onClick={handleStartDrill}
                  disabled={Object.values(roles).some(r => !r.trim())}
                  className="px-8 py-3.5 bg-amber-500 text-amber-950 font-black rounded-xl hover:bg-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  INITIALIZE CRISIS TERMINAL
                  <Zap className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TERMINAL PHASE (CONSECUTIVE OBJECTIVES 2 TO 7) */}
          {phase === 'TERMINAL' && selectedScenario && (
            <div className="space-y-6">
              
              {/* TOP CONSECUTIVE OBJECTIVES STEPPER HUD */}
              <div className="bg-[#0a0f1a] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Step status and title */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-black text-amber-400">{currentStep}</span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                        <span>STAGE {currentStep} OF 7: ACTIVE DRILL OBJECTIVE</span>
                        {currentCanAdvance ? (
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1">
                            <Check className="w-3 h-3" /> TASKS COMPLETE
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[9px] font-bold">
                            TASKS REQUIRED BELOW
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                        {currentStep === 2 && 'Objective 2: Crisis Size-Up & Assessment'}
                        {currentStep === 3 && 'Objective 3: Transmit L-N-N-H Radio Report'}
                        {currentStep === 4 && 'Objective 4: Execute Team Tactical Actions'}
                        {currentStep === 5 && 'Objective 5: Resolve Secondary Complications'}
                        {currentStep === 6 && 'Objective 6: Compile ATMIST & Verify Headcount'}
                        {currentStep === 7 && 'Objective 7: Tactical Handover to Civil Defense'}
                      </h2>
                      
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                        {currentStep === 2 && 'Read the ongoing crisis briefing, confirm primary hazards, verify the casualty condition, and select the safe escape route.'}
                        {currentStep === 3 && 'Transmit the mandatory 4-part emergency report (Location, Nature, Numbers, Hazards) to Airport Control (AOCC).'}
                        {currentStep === 4 && 'Direct each of your 4 team leads to execute correct emergency actions. Avoid critical safety mistakes!'}
                        {currentStep === 5 && 'Identify and resolve cascading airport complications: radio interference, HVAC smoke spread, and jammed doors.'}
                        {currentStep === 6 && 'Prepare the ATMIST medical card for arriving doctors and verify that all office staff are accounted for.'}
                        {currentStep === 7 && 'Deliver the completed briefing dossier and transfer command to the arriving Civil Defense Fire Chief.'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation & Stepper buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-end lg:self-center">
                    
                    {/* Visual Stepper Pills */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                      {[2, 3, 4, 5, 6, 7].map((sId) => {
                        const isDone = sId < currentStep;
                        const isCurrent = sId === currentStep;
                        return (
                          <button
                            key={sId}
                            onClick={() => {
                              // Only allow jumping back to reviewed steps, or forward if current is complete
                              if (sId < currentStep) setCurrentStep(sId);
                            }}
                            disabled={sId > currentStep}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isCurrent 
                                ? 'bg-amber-500 text-amber-950 shadow-md scale-105' 
                                : isDone 
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer' 
                                  : 'text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            <span>Step {sId}</span>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* BLIPPING "NEXT OBJECTIVE" BUTTON */}
                    {currentStep < 7 && (
                      <motion.button 
                        onClick={() => {
                          if (currentCanAdvance) {
                            const next = currentStep + 1;
                            setCurrentStep(next);
                            addTacticalLog(`OBJECTIVE UPDATED: PROCEEDING TO OBJECTIVE ${next}`);
                          } else {
                            alert('Please complete all clear tasks required on this page before advancing to the next objective.');
                          }
                        }}
                        animate={currentCanAdvance ? { 
                          scale: [1, 1.06, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(245, 158, 11, 0.8)',
                            '0 0 0 14px rgba(245, 158, 11, 0)',
                            '0 0 0 0 rgba(245, 158, 11, 0)'
                          ]
                        } : {}}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`relative px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border-2 ${
                          currentCanAdvance 
                            ? 'bg-amber-500 text-amber-950 border-amber-300 hover:bg-amber-400 cursor-pointer shadow-xl' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-75'
                        }`}
                      >
                        {currentCanAdvance && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-950 opacity-80"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-950"></span>
                          </span>
                        )}
                        <span className="tracking-wide uppercase">
                          {currentCanAdvance ? `PROCEED TO OBJECTIVE ${currentStep + 1} →` : `FINISH TASKS TO ADVANCE (${currentStep}/7)`}
                        </span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </motion.button>
                    )}

                    {currentStep === 7 && (
                      <div className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Final Handover!
                      </div>
                    )}

                  </div>

                </div>
              </div>

              {/* Active Office Banner + Safety Telemetry (Always visible across all objectives) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Active Office Quick Info */}
                <div className="col-span-12 lg:col-span-7 bg-[#0a0f1a] border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30 text-red-400">
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-red-400">Ongoing Office Incident</div>
                      <div className="text-sm font-bold text-white">{selectedScenario.name}</div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                        {selectedScenario.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono">
                    <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
                      Staff: <b className="text-white">{selectedScenario.paxCount}</b>
                    </span>
                    <span className="bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded text-emerald-400">
                      Evacuated: <b>{selectedScenario.evacuatedCount}</b>
                    </span>
                  </div>
                </div>

                {/* Compact Telemetry bar */}
                <div className="col-span-12 lg:col-span-5 bg-[#0a0f1a] border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                  <Gauge label="Fire Control" value={gauges.containment} color="bg-blue-500" />
                  <Gauge label="Casualty Care" value={gauges.lifeSafety} color="bg-emerald-500" />
                  <Gauge label="Evacuation" value={gauges.egressFlow} color="bg-amber-500" />
                  <Gauge label="Rules/Comms" value={gauges.regulatory} color="bg-slate-400" />
                </div>

              </div>

              {/* CONSECUTIVE OBJECTIVE PAGE CONTENTS */}
              <AnimatePresence mode="wait">
                
                {/* ------------------- OBJECTIVE 2: CRISIS SIZE-UP ------------------- */}
                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* Left: Full Very Visible Situation Briefing */}
                    <div className="col-span-12 lg:col-span-7 space-y-4">
                      <div className="bg-[#0a0f1a] border-2 border-red-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <span className="text-xs font-extrabold uppercase tracking-widest text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Live Crisis Situation Description
                          </span>
                          <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            Read Carefully First
                          </span>
                        </div>

                        {/* Story description in clear, natural language */}
                        <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2">
                          <div className="text-[11px] font-extrabold uppercase text-amber-400">What Happened:</div>
                          <p className="text-sm text-slate-100 leading-relaxed font-medium">
                            {selectedScenario.description}
                          </p>
                        </div>

                        {/* Room details & Hazards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Office Rooms Involved:</div>
                            <div className="text-slate-200 font-semibold">{selectedScenario.roomDetails}</div>
                          </div>
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Casualty In Need:</div>
                            <div className="text-red-400 font-bold">{selectedScenario.initialCasualties}</div>
                          </div>
                        </div>

                        {/* Hazards bullet list */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Active Office Hazards:</div>
                          <div className="space-y-1.5">
                            {selectedScenario.initialHazards.map((hazard, hIdx) => (
                              <div key={hIdx} className="text-xs py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 flex items-center gap-2 font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                {hazard}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Explicit Tasks to Complete */}
                    <div className="col-span-12 lg:col-span-5 space-y-4">
                      <div className="bg-[#0a0f1a] border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                            Objective 2 Tasks Checklist
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {[sizeUpTasks.hazardIdentified, sizeUpTasks.casualtyChecked, sizeUpTasks.routeSelected].filter(Boolean).length} / 3 Complete
                          </span>
                        </div>

                        {/* Task 1: Identify Primary Fire Hazard */}
                        <div className={`p-3.5 rounded-xl border transition-all ${sizeUpTasks.hazardIdentified ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                <span>Task 1: Identify Primary Fire Danger</span>
                                {sizeUpTasks.hazardIdentified && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Select the main threat affecting office occupants:</p>
                            </div>
                          </div>
                          {!sizeUpTasks.hazardIdentified ? (
                            <div className="grid grid-cols-1 gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setSizeUpTasks(prev => ({ ...prev, hazardIdentified: true }));
                                  addTacticalLog('SIZE-UP: Primary hazard identified - toxic plastic smoke and energized electrical circuits.');
                                }}
                                className="text-left text-xs p-2.5 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700 rounded-lg text-slate-200 transition-colors cursor-pointer flex items-center justify-between"
                              >
                                <span>⚠️ Heavy toxic plastic smoke & electrical wires</span>
                                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              ✓ Verified: Heavy toxic smoke & energized electrical wiring confirmed.
                            </div>
                          )}
                        </div>

                        {/* Task 2: Check Casualty Status */}
                        <div className={`p-3.5 rounded-xl border transition-all ${sizeUpTasks.casualtyChecked ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                <span>Task 2: Check Casualty Condition</span>
                                {sizeUpTasks.casualtyChecked && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Confirm who is injured and needs immediate medical aid:</p>
                            </div>
                          </div>
                          {!sizeUpTasks.casualtyChecked ? (
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  setSizeUpTasks(prev => ({ ...prev, casualtyChecked: true }));
                                  addTacticalLog('SIZE-UP: Casualty verified - 1 colleague unresponsive, airway and CPR needed.');
                                }}
                                className="w-full text-left text-xs p-2.5 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700 rounded-lg text-slate-200 transition-colors cursor-pointer flex items-center justify-between"
                              >
                                <span>🩺 Confirm: 1 colleague down needing urgent first aid</span>
                                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              ✓ Verified: Casualty requires immediate airway clearance & CPR.
                            </div>
                          )}
                        </div>

                        {/* Task 3: Choose Safe Evacuation Route */}
                        <div className={`p-3.5 rounded-xl border transition-all ${sizeUpTasks.routeSelected ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-800'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                <span>Task 3: Designate Safe Escape Route</span>
                                {sizeUpTasks.routeSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Which escape route should office workers use?</p>
                            </div>
                          </div>
                          {!sizeUpTasks.routeSelected ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setSizeUpTasks(prev => ({ ...prev, routeSelected: true }));
                                  addTacticalLog('SIZE-UP: Safe egress route chosen - Secondary Stairwell B (smoke-free).');
                                }}
                                className="text-left text-xs p-2.5 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 rounded-lg text-emerald-200 transition-colors cursor-pointer"
                              >
                                <span className="font-bold block">✓ Stairwell B (Smoke-Free)</span>
                                <span className="text-[10px] text-emerald-400">Safe exit path outside</span>
                              </button>
                              <button
                                onClick={() => alert('Warning: Stairwell A is blocked by heavy smoke and heat! Direct occupants to smoke-free Stairwell B.')}
                                className="text-left text-xs p-2.5 bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 rounded-lg text-red-300 transition-colors cursor-pointer"
                              >
                                <span className="font-bold block">✗ Stairwell A</span>
                                <span className="text-[10px] text-red-400">Blocked by smoke</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                              ✓ Designated: Stairwell B (Smoke-free escape route).
                            </div>
                          )}
                        </div>

                        {/* Blip Continue Prompter */}
                        {isStepComplete(2) && (
                          <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-center space-y-2 animate-pulse">
                            <div className="text-xs font-black text-amber-300 uppercase">
                              All 3 Size-Up Tasks Complete!
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(3);
                                addTacticalLog('PROCEEDING TO OBJECTIVE 3: SEND L-N-N-H REPORT');
                              }}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                              <span>PROCEED TO OBJECTIVE 3: EMERGENCY REPORT</span>
                              <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------- OBJECTIVE 3: TRANSMIT L-N-N-H REPORT ------------------- */}
                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    <div className="col-span-12 lg:col-span-5 space-y-4">
                      <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 tracking-wider">
                          <Radio className="w-4 h-4 text-amber-500" />
                          What is the L-N-N-H Report?
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          In King Salman International Airport emergency procedures, the ERT must transmit a concise 4-part message to Airport Control (AOCC) so Civil Defense fire trucks and ambulances arrive prepared:
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                            <b className="text-amber-400">L - Location:</b> Exact building, floor, wing, and office room.
                          </div>
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                            <b className="text-orange-400">N - Nature:</b> What is burning (electrical, paper, grease, chemicals).
                          </div>
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                            <b className="text-blue-400">N - Numbers:</b> How many staff inside, evacuated, or injured.
                          </div>
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                            <b className="text-red-400">H - Hazards:</b> Live electrical power, smoke blockage, access gate.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7 space-y-4">
                      <div className="bg-[#0a0f1a] border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Send className="w-4 h-4 text-amber-500" />
                            Transmit 4-Part Radio Message to AOCC
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {[lnnhTasks.locationSent, lnnhTasks.natureSent, lnnhTasks.numbersSent, lnnhTasks.hazardsSent].filter(Boolean).length} / 4 Transmitted
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Part 1: Location */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">1. Transmit Location (L)</div>
                              <div className="text-[11px] text-slate-400">{selectedScenario.location}</div>
                            </div>
                            <button
                              disabled={lnnhTasks.locationSent}
                              onClick={() => {
                                setLnnhTasks(prev => ({ ...prev, locationSent: true }));
                                addTacticalLog(`RADIO TRANSMISSION: Location [${selectedScenario.location}] acknowledged by AOCC.`);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                lnnhTasks.locationSent 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {lnnhTasks.locationSent ? <><Check className="w-3.5 h-3.5" /> Transmitted</> : 'Send Location'}
                            </button>
                          </div>

                          {/* Part 2: Nature */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">2. Transmit Nature of Fire (N)</div>
                              <div className="text-[11px] text-slate-400">{selectedScenario.whatHappened}</div>
                            </div>
                            <button
                              disabled={lnnhTasks.natureSent}
                              onClick={() => {
                                setLnnhTasks(prev => ({ ...prev, natureSent: true }));
                                addTacticalLog(`RADIO TRANSMISSION: Nature of fire acknowledged by AOCC.`);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                lnnhTasks.natureSent 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {lnnhTasks.natureSent ? <><Check className="w-3.5 h-3.5" /> Transmitted</> : 'Send Nature'}
                            </button>
                          </div>

                          {/* Part 3: Numbers */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">3. Transmit Staff Numbers & Casualties (N)</div>
                              <div className="text-[11px] text-slate-400">{selectedScenario.paxCount} Total Staff, {selectedScenario.evacuatedCount} Evacuated, 1 Down</div>
                            </div>
                            <button
                              disabled={lnnhTasks.numbersSent}
                              onClick={() => {
                                setLnnhTasks(prev => ({ ...prev, numbersSent: true }));
                                addTacticalLog(`RADIO TRANSMISSION: Staff headcount numbers acknowledged by AOCC.`);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                lnnhTasks.numbersSent 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {lnnhTasks.numbersSent ? <><Check className="w-3.5 h-3.5" /> Transmitted</> : 'Send Numbers'}
                            </button>
                          </div>

                          {/* Part 4: Hazards */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">4. Transmit Hazards & Inbound Access (H)</div>
                              <div className="text-[11px] text-slate-400">Electrical wires live; guide fire engines via Emergency Gate 3</div>
                            </div>
                            <button
                              disabled={lnnhTasks.hazardsSent}
                              onClick={() => {
                                setLnnhTasks(prev => ({ ...prev, hazardsSent: true }));
                                addTacticalLog(`RADIO TRANSMISSION: Inbound hazards acknowledged. Civil Defense en route.`);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                lnnhTasks.hazardsSent 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {lnnhTasks.hazardsSent ? <><Check className="w-3.5 h-3.5" /> Transmitted</> : 'Send Hazards'}
                            </button>
                          </div>
                        </div>

                        {/* Blip Continue Prompter */}
                        {isStepComplete(3) && (
                          <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-center space-y-2 animate-pulse mt-4">
                            <div className="text-xs font-black text-amber-300 uppercase">
                              L-N-N-H Report Received by Airport Operations Control (AOCC)!
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(4);
                                addTacticalLog('PROCEEDING TO OBJECTIVE 4: EXECUTE TEAM TACTICAL ACTIONS');
                              }}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                              <span>PROCEED TO OBJECTIVE 4: EMERGENCY ACTIONS</span>
                              <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------- OBJECTIVE 4: TEAM TACTICAL ACTIONS ------------------- */}
                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-5"
                  >
                    <div className="bg-[#0a0f1a] border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-500" />
                            Perform Core Actions for All 4 Roles
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Click the correct tactical action for each lead. Pick the safe, approved emergency procedure.
                          </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-400">
                          {executedActions.length} Actions Completed (Minimum 4 required)
                        </div>
                      </div>

                      {/* 4 Role Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Team Leader */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Shield className="w-4 h-4 text-red-400" />
                              1. Team Leader: <span className="text-amber-400">{roles.teamLeader}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Command
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => performAction('teamLeader', 'icp', true, 'Set Up Safe Command Post', 'Command Post established. Team Leader maintains full coordination.')}
                              disabled={executedActions.includes('icp')}
                              className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('icp') 
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-950 border-slate-800 hover:border-amber-500/50 text-slate-200 cursor-pointer'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>✓ Set Up Safe Command Post in Hallway</span>
                                {executedActions.includes('icp') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400">Maintain full oversight without entering hazardous smoke.</span>
                            </button>

                            <button
                              onClick={() => performAction('teamLeader', 'cpr_tl', false, 'Leader Does CPR Alone', 'MISTAKE: Team Leader left command post to do hands-on CPR. Command oversight collapsed.')}
                              disabled={executedActions.includes('cpr_tl')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('cpr_tl') 
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300' 
                                  : 'bg-slate-950/50 border-slate-800/80 hover:border-red-500/40 text-slate-400 cursor-pointer'
                              }`}
                            >
                              <div className="font-semibold flex items-center justify-between">
                                <span>Leader Leaves Command Post to Do CPR</span>
                                {executedActions.includes('cpr_tl') && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                              </div>
                              <span className="text-[10px] text-slate-500">Wrong: Leader loses command view of other responders.</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Fire & Hazard Lead */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Flame className="w-4 h-4 text-orange-400" />
                              2. Fire & Hazard Lead: <span className="text-amber-400">{roles.suppressionLead}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Fire Control
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => performAction('suppressionLead', 'iso', true, 'Switch Off Main Power Breaker', 'Main electrical breaker opened. Power isolated from burning office equipment.')}
                              disabled={executedActions.includes('iso')}
                              className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('iso') 
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-950 border-slate-800 hover:border-amber-500/50 text-slate-200 cursor-pointer'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>✓ Cut Main Office Power Switch</span>
                                {executedActions.includes('iso') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400">De-energize live 230V electrical circuits before water suppression.</span>
                            </button>

                            <button
                              onClick={() => performAction('suppressionLead', 'water_c', false, 'Pour Water on Electric Wires', 'CRITICAL MISTAKE: Poured water on energized office computer plugs! Shock explosion occurred.')}
                              disabled={executedActions.includes('water_c')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('water_c') 
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300' 
                                  : 'bg-slate-950/50 border-slate-800/80 hover:border-red-500/40 text-slate-400 cursor-pointer'
                              }`}
                            >
                              <div className="font-semibold flex items-center justify-between">
                                <span>Throw Water Bucket on Live Plugs</span>
                                {executedActions.includes('water_c') && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                              </div>
                              <span className="text-[10px] text-slate-500">Wrong: High electrocution hazard and water expansion.</span>
                            </button>
                          </div>
                        </div>

                        {/* 3. First Aid Lead */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Stethoscope className="w-4 h-4 text-emerald-400" />
                              3. First Aid Lead: <span className="text-amber-400">{roles.casualtyCareLead}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Medical
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => performAction('casualtyCareLead', 'cpr_cycle', true, 'Start CPR (30:2) & Prepare AED', 'CPR underway: 30 firm chest compressions and 2 rescue breaths. AED unit powered on.')}
                              disabled={executedActions.includes('cpr_cycle')}
                              className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('cpr_cycle') 
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-950 border-slate-800 hover:border-amber-500/50 text-slate-200 cursor-pointer'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>✓ Begin CPR (30 Compressions : 2 Breaths) & AED</span>
                                {executedActions.includes('cpr_cycle') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400">Keep brain blood flow active until ambulance paramedics arrive.</span>
                            </button>

                            <button
                              onClick={() => performAction('casualtyCareLead', 'touch_shock', false, 'Touch Casualty During Shock', 'CRITICAL MISTAKE: Touched patient during defibrillator shock! Rescuer injured.')}
                              disabled={executedActions.includes('touch_shock')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('touch_shock') 
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300' 
                                  : 'bg-slate-950/50 border-slate-800/80 hover:border-red-500/40 text-slate-400 cursor-pointer'
                              }`}
                            >
                              <div className="font-semibold flex items-center justify-between">
                                <span>Touch Casualty While Defibrillator Delivers Shock</span>
                                {executedActions.includes('touch_shock') && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                              </div>
                              <span className="text-[10px] text-slate-500">Wrong: Always stand clear when AED gives electric shock.</span>
                            </button>
                          </div>
                        </div>

                        {/* 4. Evacuation Lead */}
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-blue-400" />
                              4. Evacuation Lead: <span className="text-amber-400">{roles.evacuationSupportLead}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Evacuation
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => performAction('evacuationSupportLead', 'sweep', true, 'Search All Rooms & Close Doors', 'Systematic sweep completed: All office rooms cleared, doors shut to contain smoke.')}
                              disabled={executedActions.includes('sweep')}
                              className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('sweep') 
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                                  : 'bg-slate-950 border-slate-800 hover:border-amber-500/50 text-slate-200 cursor-pointer'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>✓ Search Every Office Room & Close Doors</span>
                                {executedActions.includes('sweep') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <span className="text-[10px] text-slate-400">Sweep left to right, close doors to starve fire of air.</span>
                            </button>

                            <button
                              onClick={() => performAction('evacuationSupportLead', 'reentry', false, 'Let Workers Return for Laptops', 'CRITICAL MISTAKE: Allowed staff to run back into smoke to get laptops and personal bags!')}
                              disabled={executedActions.includes('reentry')}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                                executedActions.includes('reentry') 
                                  ? 'bg-red-500/15 border-red-500/40 text-red-300' 
                                  : 'bg-slate-950/50 border-slate-800/80 hover:border-red-500/40 text-slate-400 cursor-pointer'
                              }`}
                            >
                              <div className="font-semibold flex items-center justify-between">
                                <span>Allow Staff Back In for Laptops & Wallets</span>
                                {executedActions.includes('reentry') && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                              </div>
                              <span className="text-[10px] text-slate-500">Wrong: Never allow re-entry into a burning building.</span>
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Blip Continue Prompter */}
                      {isStepComplete(4) && (
                        <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-center space-y-2 animate-pulse mt-4">
                          <div className="text-xs font-black text-amber-300 uppercase">
                            Core Role Tactical Actions Completed!
                          </div>
                          <button
                            onClick={() => {
                              setCurrentStep(5);
                              addTacticalLog('PROCEEDING TO OBJECTIVE 5: SOLVE SECONDARY COMPLICATIONS');
                            }}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <span>PROCEED TO OBJECTIVE 5: SECONDARY COMPLICATIONS</span>
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}

                {/* ------------------- OBJECTIVE 5: SOLVE SECONDARY PROBLEMS ------------------- */}
                {currentStep === 5 && (
                  <motion.div 
                    key="step5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                      <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Cascading Office Failures
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          During airport office emergencies, secondary system failures occur rapidly. The ERT must react quickly to keep staff safe and communications open.
                        </p>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Goal:</span>
                          <p className="text-slate-200">
                            Solve all 3 secondary problems by clicking their solution buttons below.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8 space-y-4">
                      <div className="bg-[#0a0f1a] border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Resolve Secondary Office Problems
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {[resolvedInjects.radioFixed, resolvedInjects.hvacFixed, resolvedInjects.doorFixed].filter(Boolean).length} / 3 Solved
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Problem 1: Radio Blackout */}
                          <div className={`p-4 rounded-xl border transition-all ${resolvedInjects.radioFixed ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <Mic2 className="w-4 h-4 text-amber-400" />
                                  1. Radio Channel Jammed by Panicked Staff
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Office workers talking simultaneously on Channel Alpha. Team instructions cannot get through.
                                </p>
                              </div>
                              <button
                                disabled={resolvedInjects.radioFixed}
                                onClick={() => {
                                  setResolvedInjects(prev => ({ ...prev, radioFixed: true }));
                                  addTacticalLog('COMMS RESTORED: Switched all emergency syndicate radios to Backup UHF Channel Bravo.');
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                                  resolvedInjects.radioFixed 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                    : 'bg-red-500 hover:bg-red-400 text-white'
                                }`}
                              >
                                {resolvedInjects.radioFixed ? '✓ Radio Switched to Backup Channel' : 'Switch Radios to Backup Channel'}
                              </button>
                            </div>
                          </div>

                          {/* Problem 2: HVAC Smoke Spread */}
                          <div className={`p-4 rounded-xl border transition-all ${resolvedInjects.hvacFixed ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <Flame className="w-4 h-4 text-orange-400" />
                                  2. Office AC Ventilation Sucking Smoke Into Upper Floors
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Ceiling vents are pushing heavy smoke into adjacent accounting and executive offices.
                                </p>
                              </div>
                              <button
                                disabled={resolvedInjects.hvacFixed}
                                onClick={() => {
                                  setResolvedInjects(prev => ({ ...prev, hvacFixed: true }));
                                  addTacticalLog('SYSTEM ACTION: Building HVAC Emergency Damper Trip activated. Smoke recirculation stopped.');
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                                  resolvedInjects.hvacFixed 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                    : 'bg-red-500 hover:bg-red-400 text-white'
                                }`}
                              >
                                {resolvedInjects.hvacFixed ? '✓ HVAC Dampers Closed' : 'Shut Down Building HVAC Dampers'}
                              </button>
                            </div>
                          </div>

                          {/* Problem 3: Jammed Exit Turnstiles */}
                          <div className={`p-4 rounded-xl border transition-all ${resolvedInjects.doorFixed ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <DoorOpen className="w-4 h-4 text-blue-400" />
                                  3. Electronic Badge Turnstiles Stuck Locked at Ground Exit
                                </div>
                                <p className="text-[11px] text-slate-300">
                                  Power cut locked the magnetic glass turnstiles. Evacuees are crowding the exit doorway.
                                </p>
                              </div>
                              <button
                                disabled={resolvedInjects.doorFixed}
                                onClick={() => {
                                  setResolvedInjects(prev => ({ ...prev, doorFixed: true }));
                                  addTacticalLog('SECURITY ACTION: Green Emergency Break-Glass Manual Override triggered. Turnstiles unlocked free.');
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                                  resolvedInjects.doorFixed 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                    : 'bg-red-500 hover:bg-red-400 text-white'
                                }`}
                              >
                                {resolvedInjects.doorFixed ? '✓ Turnstiles Manually Released' : 'Break Emergency Door Release'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Blip Continue Prompter */}
                        {isStepComplete(5) && (
                          <div className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-center space-y-2 animate-pulse mt-4">
                            <div className="text-xs font-black text-amber-300 uppercase">
                              All 3 Secondary Complications Solved!
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(6);
                                addTacticalLog('PROCEEDING TO OBJECTIVE 6: COMPILE HANDOVER MEDICAL SUMMARY & HEADCOUNT');
                              }}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                              <span>PROCEED TO OBJECTIVE 6: PREPARE HANDOVER</span>
                              <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------- OBJECTIVE 6: PREPARE HANDOVER SUMMARY ------------------- */}
                {currentStep === 6 && (
                  <motion.div 
                    key="step6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    <div className="col-span-12 lg:col-span-5 space-y-4">
                      {/* ATMIST Medical Card Card */}
                      <div className="bg-[#0a0f1a] border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <span className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4" />
                            ATMIST Medical Casualty Card
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Paramedic Handover</span>
                        </div>
                        <div className="text-xs space-y-2 font-mono">
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">A - Age:</b> ~40 Years Old (Office Employee)
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">T - Time:</b> Incident at {formatTime(time)} on drill clock
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">M - Mechanism:</b> Heavy smoke inhalation & hot surface burn
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">I - Injuries:</b> Coughing soot, disoriented, skin redness
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">S - Signs:</b> Pulse weak, airway opened, breathing assisted
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800">
                            <b className="text-amber-400">T - Treatment:</b> CPR cycles given, AED attached, high-flow O2
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7 space-y-4">
                      <div className="bg-[#0a0f1a] border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500" />
                            Objective 6: Pre-Handover Checklist
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {[prepTasks.atmistCompiled, prepTasks.headcountVerified, prepTasks.sceneSecured].filter(Boolean).length} / 3 Ready
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Task 1: Generate ATMIST */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">1. Sign & Compile ATMIST Casualty Card</div>
                              <div className="text-[11px] text-slate-400">Certify casualty status for arriving ambulance doctors.</div>
                            </div>
                            <button
                              disabled={prepTasks.atmistCompiled}
                              onClick={() => {
                                setPrepTasks(prev => ({ ...prev, atmistCompiled: true }));
                                addTacticalLog('ATMIST COMPILED: Medical transfer card completed and signed for Civil Defense medics.');
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                prepTasks.atmistCompiled 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {prepTasks.atmistCompiled ? <><Check className="w-3.5 h-3.5" /> ATMIST Signed</> : 'Sign ATMIST Card'}
                            </button>
                          </div>

                          {/* Task 2: Verify Office Headcount */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">2. Complete 100% Office Headcount</div>
                              <div className="text-[11px] text-slate-400">Verify all {selectedScenario.paxCount} staff are accounted for at Assembly Area.</div>
                            </div>
                            <button
                              disabled={prepTasks.headcountVerified}
                              onClick={() => {
                                setPrepTasks(prev => ({ ...prev, headcountVerified: true }));
                                addTacticalLog(`HEADCOUNT VERIFIED: All ${selectedScenario.paxCount} staff accounted for at exterior safe zone.`);
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                prepTasks.headcountVerified 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {prepTasks.headcountVerified ? <><Check className="w-3.5 h-3.5" /> Headcount 100%</> : 'Verify Headcount'}
                            </button>
                          </div>

                          {/* Task 3: Confirm Scene Isolation */}
                          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-200">3. Confirm Scene Containment & Security Isolation</div>
                              <div className="text-[11px] text-slate-400">Office power cut, doors closed, perimeter secured from unauthorized re-entry.</div>
                            </div>
                            <button
                              disabled={prepTasks.sceneSecured}
                              onClick={() => {
                                setPrepTasks(prev => ({ ...prev, sceneSecured: true }));
                                addTacticalLog('SCENE SECURED: Power isolated, stairwell clear, perimeter sealed for Civil Defense entry.');
                              }}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                prepTasks.sceneSecured 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default' 
                                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                              }`}
                            >
                              {prepTasks.sceneSecured ? <><Check className="w-3.5 h-3.5" /> Scene Secured</> : 'Confirm Isolation'}
                            </button>
                          </div>
                        </div>

                        {/* Blip Continue Prompter */}
                        {isStepComplete(6) && (
                          <div className="p-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-xl text-center space-y-2 animate-pulse mt-4">
                            <div className="text-xs font-black text-emerald-300 uppercase">
                              All Pre-Handover Objectives Completed! You can now initiate handover.
                            </div>
                            <button
                              onClick={() => {
                                setCurrentStep(7);
                                addTacticalLog('PROCEEDING TO FINAL OBJECTIVE 7: COMMAND HANDOVER TO CIVIL DEFENSE');
                              }}
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                            >
                              <span>PROCEED TO FINAL OBJECTIVE 7 (HANDOVER)</span>
                              <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ------------------- OBJECTIVE 7: TACTICAL HANDOVER TO CIVIL DEFENSE ------------------- */}
                {currentStep === 7 && (
                  <motion.div 
                    key="step7"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="max-w-4xl mx-auto space-y-6"
                  >
                    <div className="bg-[#0a0f1a] border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
                            <Shield className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Final Objective 7</span>
                            <h3 className="text-xl sm:text-2xl font-black text-white">
                              Deliver Command Handover to Civil Defense
                            </h3>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold self-start sm:self-auto">
                          Civil Defense Incident Commander In Front of You
                        </div>
                      </div>

                      {/* Complete Handover Summary Report Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="text-[10px] uppercase font-bold text-amber-400">1. Office Incident Summary:</div>
                          <p className="text-slate-200">{selectedScenario.name}</p>
                          <p className="text-slate-400">{selectedScenario.location}</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="text-[10px] uppercase font-bold text-amber-400">2. Scene Safety & Power:</div>
                          <p className="text-slate-200">Main electrical breaker isolated ✓</p>
                          <p className="text-slate-200">Stairwell B clear of smoke for entry ✓</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="text-[10px] uppercase font-bold text-amber-400">3. Casualty & First Aid:</div>
                          <p className="text-slate-200">1 Colleague treated with CPR & oxygen ✓</p>
                          <p className="text-slate-200">ATMIST dossier signed for ambulance crew ✓</p>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="text-[10px] uppercase font-bold text-amber-400">4. Evacuation Headcount:</div>
                          <p className="text-slate-200">100% of {selectedScenario.paxCount} employees accounted for ✓</p>
                          <p className="text-slate-200">Doors closed to trap smoke in room ✓</p>
                        </div>
                      </div>

                      {/* Formal Handover Action Button */}
                      <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-3">
                        <motion.button
                          onClick={handleFinishDrill}
                          animate={{ 
                            scale: [1, 1.03, 1],
                            boxShadow: [
                              '0 0 15px rgba(16, 185, 129, 0.4)',
                              '0 0 35px rgba(16, 185, 129, 0.8)',
                              '0 0 15px rgba(16, 185, 129, 0.4)'
                            ] 
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                          <span>EXECUTE FORMAL HANDOVER & COMPLETE DRILL</span>
                        </motion.button>
                        <p className="text-xs text-slate-400">
                          Clicking this transfers formal command to Civil Defense and calculates your final syndicate score.
                        </p>
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Roster & Tactical Log Footer Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                
                {/* ICS Roster */}
                <div className="col-span-12 lg:col-span-5 bg-[#0a0f1a] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    Office Emergency Response Cell
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Team Leader</span>
                      <span className="font-bold text-slate-200">{roles.teamLeader}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Fire & Hazard Lead</span>
                      <span className="font-bold text-slate-200">{roles.suppressionLead}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">First Aid Lead</span>
                      <span className="font-bold text-slate-200">{roles.casualtyCareLead}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Evacuation Lead</span>
                      <span className="font-bold text-slate-200">{roles.evacuationSupportLead}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Radio Log */}
                <div className="col-span-12 lg:col-span-7 bg-[#0a0f1a] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      Live Radio & Event Log
                    </span>
                    <span className="font-mono text-slate-500">{tacticalLog.length} messages</span>
                  </div>
                  <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1 text-[11px] font-mono">
                    {tacticalLog.slice(0, 4).map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-amber-500/70 shrink-0">[{log.time}]</span>
                        <span className="text-slate-300 truncate">{log.msg}</span>
                      </div>
                    ))}
                    {tacticalLog.length === 0 && (
                      <div className="text-slate-500 italic">No events logged yet.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* RESULT PHASE */}
          {phase === 'RESULT' && selectedScenario && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6 py-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex p-4 bg-amber-500/10 rounded-full border border-amber-500/30 mb-2">
                  <CheckCircle2 className="w-12 h-12 text-amber-500" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Airport Office Drill Completed!
                </h2>
                <p className="text-slate-300 text-sm">
                  Full tactical command has been handed over to King Salman International Airport Civil Defense.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mt-6 p-6 bg-[#0a0f1a] border border-slate-800 rounded-2xl">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Team Score</div>
                    <div className="text-6xl font-black text-amber-400 font-mono tracking-tighter">{score}</div>
                    <div className="text-xs text-slate-400 mt-1">out of 100 points</div>
                  </div>
                  <div className="hidden sm:block h-16 w-px bg-slate-800" />
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Certification Status</div>
                    <div className={`text-2xl font-black ${score >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {score >= 75 ? 'PASSED • GACA COMPLIANT' : 'NEEDS PRACTICE DRILL'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {score >= 75 
                        ? 'Your team successfully stabilized the office crisis, completed all objectives, and protected staff.' 
                        : 'Review errors and practice again to improve your score above 75.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Objectives Completed Summary */}
              <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-500" /> Verified Objectives Completion
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 1: Team Roster</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 2: Crisis Size-Up</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 3: L-N-N-H Transmitted</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 4: Tactical Actions</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 5: Injects Solved</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Objective 6 & 7: Handover Done</span>
                  </div>
                </div>
              </div>

              {/* Team Review Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> What Went Well (Strengths)
                  </h4>
                  <p className="text-[11px] text-slate-400">Write 3 things your team did smoothly during the office drill.</p>
                  <div className="space-y-2">
                    {plusDelta.plus.map((item, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        placeholder={`Strength #${idx + 1}...`}
                        value={item}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlusDelta(prev => {
                            const newPlus = [...prev.plus];
                            newPlus[idx] = val;
                            return { ...prev, plus: newPlus };
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0f1a] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> What We Can Improve Next Time
                  </h4>
                  <p className="text-[11px] text-slate-400">Write 3 areas to practice before the next real-world drill.</p>
                  <div className="space-y-2">
                    {plusDelta.delta.map((item, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        placeholder={`Improvement #${idx + 1}...`}
                        value={item}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlusDelta(prev => {
                            const newDelta = [...prev.delta];
                            newDelta[idx] = val;
                            return { ...prev, delta: newDelta };
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={downloadDossier}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  DOWNLOAD PDF SUMMARY REPORT
                </button>
                <button 
                  onClick={() => {
                    setPhase('LOBBY');
                    setSelectedScenario(null);
                    setExecutedActions([]);
                    setRoleActionCounts({
                      teamLeader: 0,
                      suppressionLead: 0,
                      casualtyCareLead: 0,
                      evacuationSupportLead: 0,
                    });
                    setSizeUpTasks({ hazardIdentified: false, casualtyChecked: false, routeSelected: false });
                    setLnnhTasks({ locationSent: false, natureSent: false, numbersSent: false, hazardsSent: false });
                    setResolvedInjects({ radioFixed: false, hvacFixed: false, doorFixed: false });
                    setPrepTasks({ atmistCompiled: false, headcountVerified: false, sceneSecured: false });
                    setGauges({
                      containment: 70,
                      lifeSafety: 80,
                      egressFlow: 50,
                      regulatory: 60
                    });
                    setTime(900);
                    setActiveInjects([]);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" />
                  START ANOTHER OFFICE DRILL
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
