import React, { useState, useEffect, useRef } from 'react';
import { PageId } from '../types/navigation';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  PhoneCall,
  Wifi, 
  MessageSquare, 
  HeartPulse, 
  FileText, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Stethoscope, 
  Calendar, 
  Clock, 
  UserCheck, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Settings,
  MonitorUp,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Activity,
  Radio
} from 'lucide-react';
import { api } from '../services/api';

interface TelemedicinePageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const TelemedicinePage: React.FC<TelemedicinePageProps> = ({ onNavigate }) => {
  // Call session state
  const [inCall, setInCall] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(451); // 07:31
  const [swapViews, setSwapViews] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Doctor response & voice state
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState<boolean>(false);
  const [doctorVoiceEnabled, setDoctorVoiceEnabled] = useState<boolean>(true);

  // Camera permissions & device states
  const [cameraStatus, setCameraStatus] = useState<'prompt' | 'requesting' | 'connected' | 'denied' | 'no-device' | 'off'>('prompt');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);

  // DOM & Media Refs
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Side Panel Tabs
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'chat'>('vitals');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Dr. Arvind Rao', text: 'Namaste Ramesh ji, I see your fasting blood sugar is 242 mg/dL. Are you experiencing any chest discomfort, severe dizziness, or shortness of breath?', time: '10:32 AM', isDoctor: true },
    { sender: 'Ramesh Kumar (You)', text: 'Namaste Doctor sahab. No chest pain, but frequent urination and severe thirst especially during the night.', time: '10:33 AM', isDoctor: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Doctor Availability & Follow-Up State
  const [selectedDoctorId, setSelectedDoctorId] = useState('usr-doc-01');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<any | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [isBookingQueue, setIsBookingQueue] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Follow-Up Form State
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [followUpReason, setFollowUpReason] = useState('Post-Metformin fasting blood sugar review & blood pressure titration');
  const [followUpGoal, setFollowUpGoal] = useState('Target FBS < 126 mg/dL; BP < 130/80 mmHg');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  // Call timer
  useEffect(() => {
    let timer: any;
    if (inCall) {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  // Load Doctor Data
  useEffect(() => {
    loadDoctorAvailability();
    loadFollowUps();
  }, [selectedDoctorId, selectedDate]);

  // Initialize Real Camera on component mount
  useEffect(() => {
    startCamera();

    return () => {
      cleanupMedia();
    };
  }, []);

  // Update Video Element srcObject when streams or views change
  useEffect(() => {
    if (localStreamRef.current) {
      const targetVideo = swapViews ? mainVideoRef.current : localVideoRef.current;
      if (targetVideo && targetVideo.srcObject !== localStreamRef.current) {
        targetVideo.srcObject = localStreamRef.current;
      }
    }
    if (screenStreamRef.current && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [swapViews, cameraStatus, inCall, isScreenSharing]);

  // Clean up media streams
  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Start Real User Media (Camera & Mic)
  const startCamera = async (camId?: string, micId?: string) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('no-device');
      return;
    }

    try {
      setCameraStatus('requesting');

      // Stop previous tracks if re-initializing
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: camId 
          ? { deviceId: { exact: camId } }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: micId 
          ? { deviceId: { exact: micId } } 
          : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setCameraStatus('connected');
      setVideoEnabled(true);
      setAudioEnabled(true);

      // Attach to appropriate video element
      setTimeout(() => {
        const targetVideo = swapViews ? mainVideoRef.current : localVideoRef.current;
        if (targetVideo) {
          targetVideo.srcObject = stream;
          targetVideo.play().catch(e => console.log('Autoplay handled:', e));
        }
      }, 100);

      // Enumerate available devices for settings
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter(d => d.kind === 'videoinput');
        const audioDevs = devices.filter(d => d.kind === 'audioinput');
        setCameraDevices(videoDevs);
        setAudioDevices(audioDevs);
        if (!selectedCameraId && videoDevs.length > 0) setSelectedCameraId(videoDevs[0].deviceId);
        if (!selectedAudioId && audioDevs.length > 0) setSelectedAudioId(audioDevs[0].deviceId);
      }

      // Initialize Live Mic Meter
      setupAudioMeter(stream);
    } catch (err: any) {
      console.warn('Real camera access response:', err.name || err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('no-device');
      } else {
        setCameraStatus('denied');
      }
    }
  };

  // Audio Analyser for live volume meter
  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((average / 128) * 100)));

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio meter initialization not available', e);
    }
  };

  // Toggle Microphone
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
    setAudioEnabled(!audioEnabled);
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
    }
    setVideoEnabled(!videoEnabled);
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported in this browser.');
          return;
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        console.log('Screen sharing cancelled', err);
      }
    }
  };

  // End Consultation Call
  const handleEndCall = () => {
    cleanupMedia();
    setInCall(false);
    setCameraStatus('off');
  };

  // Rejoin Call
  const handleRejoinCall = () => {
    setInCall(true);
    setCallDuration(0);
    startCamera(selectedCameraId, selectedAudioId);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Speak Doctor Response aloud via SpeechSynthesis
  const speakDoctorResponse = (text: string) => {
    setIsDoctorSpeaking(true);
    if (doctorVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsDoctorSpeaking(false);
      utterance.onerror = () => setIsDoctorSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsDoctorSpeaking(false), 3000);
    }
  };

  // Patient sends in-call chat message
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const newPatientMsg = {
      sender: 'Ramesh Kumar (You)',
      text: textToSend,
      time: 'Just now',
      isDoctor: false
    };

    setChatMessages(prev => [...prev, newPatientMsg]);
    if (!customText) setInputMessage('');

    // Trigger Doctor AI Response
    setTimeout(() => {
      let doctorReply = 'I understand your concern Ramesh ji. We are monitoring your vitals closely and titrating your dosage accordingly.';
      const lower = textToSend.toLowerCase();

      if (lower.includes('sugar') || lower.includes('glucose') || lower.includes('242')) {
        doctorReply = 'A reading of 242 mg/dL requires prompt attention. Please take Metformin 500mg SR after your evening meal, strictly avoid refined carbohydrates, and drink plenty of water.';
      } else if (lower.includes('metformin') || lower.includes('medicine') || lower.includes('prescription')) {
        doctorReply = 'Your prescription for Metformin 500mg and Telmisartan 40mg is dispensed under the Jan Aushadhi generic scheme. Take one tablet each morning with breakfast.';
      } else if (lower.includes('kiosk') || lower.includes('lab') || lower.includes('test')) {
        doctorReply = 'You can visit the Maholi Primary Health Centre kiosk anytime this week between 8 AM and 4 PM. Your repeat HbA1c test is 100% free under NHM.';
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'Dr. Arvind Rao',
          text: doctorReply,
          time: 'Just now',
          isDoctor: true
        }
      ]);

      speakDoctorResponse(doctorReply);
    }, 1200);
  };

  const loadDoctorAvailability = async () => {
    try {
      const data = await api.telemedExtended.getAvailability(selectedDoctorId, selectedDate);
      setAvailability(data);
    } catch (err) {
      console.error('Failed to load doctor availability', err);
    }
  };

  const loadFollowUps = async () => {
    try {
      const data = await api.telemedExtended.getFollowUps();
      setFollowUps(data || []);
    } catch (err) {
      console.error('Failed to load follow-up records', err);
    }
  };

  const handleBookSlot = async (slotTime: string) => {
    setIsBookingQueue(true);
    setBookingSuccess(null);
    try {
      await api.createAppointment({
        patientName: 'Ramesh Patel',
        patientAge: 48,
        patientGender: 'Male',
        triagePriority: 'routine',
        chiefComplaints: ['Follow-up teleconsultation for Glycemic control'],
        aiClinicalSummary: 'Scheduled teleconsultation slot reserved.',
        consultationMode: lowBandwidthMode ? 'audio' : 'video',
      });
      setBookingSuccess(`Slot ${slotTime} booked successfully! Telemedicine link is active.`);
      loadDoctorAvailability();
      setTimeout(() => setBookingSuccess(null), 4000);
    } catch (err: any) {
      console.error('Booking failed', err);
    } finally {
      setIsBookingQueue(false);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFollowUp(true);
    try {
      const res = await api.telemedExtended.scheduleFollowUp({
        appointmentId: 'apt-001',
        patientId: 'usr-pat-01',
        doctorId: selectedDoctorId,
        scheduledDate: followUpDate,
        reason: followUpReason,
        clinicalGoals: [followUpGoal],
        patientName: 'Ramesh Patel',
        doctorName: availability?.doctorName || 'Dr. Arvind Rao',
      });

      if (res) {
        setShowFollowUpModal(false);
        loadFollowUps();
      }
    } catch (err) {
      console.error('Error creating follow up', err);
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleMarkFollowUpComplete = async (id: string) => {
    try {
      await api.telemedExtended.updateFollowUp(id, {
        status: 'completed',
        recoveryNotes: 'Patient reviewed successfully. Vitals documented in EHR.',
      });
      loadFollowUps();
    } catch (err) {
      console.error('Failed to complete follow-up', err);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Session Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 rounded-full ${inCall ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900">
                Live Teleconsultation: Dr. Arvind Rao & Ramesh Kumar
              </h1>
              {cameraStatus === 'connected' && inCall && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Camera Active
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
              <span>Room: swasthya-room-sitapur-kiosk-01</span>
              <span>•</span>
              <span>ABHA: 91-4521-8890-1234</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setDoctorVoiceEnabled(!doctorVoiceEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              doctorVoiceEnabled ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Toggle Doctor Audio Voice"
          >
            {doctorVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">Doctor Audio {doctorVoiceEnabled ? 'On' : 'Muted'}</span>
          </button>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            lowBandwidthMode ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}>
            <Wifi className="w-3.5 h-3.5" />
            <span>{lowBandwidthMode ? '2G Resilient (16 kbps Opus)' : 'WebRTC HD (720p)'}</span>
          </div>

          <button
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
          >
            {lowBandwidthMode ? 'Switch to HD Video' : 'Simulate 2G Network'}
          </button>
        </div>
      </div>

      {/* Main Video & Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Video & Media Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={videoContainerRef}
            className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col justify-between"
          >
            
            {/* Top Video Overlay Bar */}
            <div className="p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-20 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2.5">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${inCall ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                  {inCall ? 'LIVE' : 'CALL ENDED'}
                </span>
                <span className="font-mono text-slate-200">{formatTimer(callDuration)}</span>
                
                {/* Speaking indicator for remote doctor */}
                {isDoctorSpeaking && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    <Activity className="w-3 h-3 text-teal-400 animate-spin" />
                    Dr. Rao Speaking...
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs text-[11px] text-emerald-400 font-semibold flex items-center gap-1 border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DTLS-SRTP 256-bit Encrypted</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 bg-black/60 hover:bg-black/90 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Stage Video Area */}
            <div className="h-80 sm:h-[420px] w-full flex items-center justify-center relative bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
              {inCall ? (
                lowBandwidthMode ? (
                  /* Audio-only Low-Bandwidth Mode */
                  <div className="text-center p-6 space-y-4">
                    <div className="w-24 h-24 rounded-full bg-teal-600/20 border-2 border-teal-500 mx-auto flex items-center justify-center animate-pulse">
                      <Stethoscope className="w-12 h-12 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Dr. Arvind Rao, MD</h3>
                      <p className="text-xs text-teal-400 font-medium">Low-Bitrate Opus Audio Call Active (16 kbps)</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                        Video stream stepped down to eliminate packet loss on 2G rural connection. High-fidelity voice preserved.
                      </p>
                    </div>

                    {/* Mic indicator in 2G mode */}
                    <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-xs text-white">
                      <Mic className={`w-3.5 h-3.5 ${audioEnabled ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span>{audioEnabled ? `Mic Active (Level: ${micVolume}%)` : 'Microphone Muted'}</span>
                    </div>
                  </div>
                ) : isScreenSharing ? (
                  /* Screen Share Mode */
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <video 
                      ref={screenVideoRef}
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 bg-teal-900/80 text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <MonitorUp className="w-3.5 h-3.5 text-teal-300" />
                      <span>Presenting Screen / Medical Records</span>
                    </div>
                  </div>
                ) : swapViews ? (
                  /* SWAPPED: Patient is Main Stage (Real Camera) */
                  <div className="w-full h-full relative">
                    {cameraStatus === 'connected' && videoEnabled ? (
                      <video 
                        ref={mainVideoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white space-y-2">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold">
                          RK
                        </div>
                        <p className="text-sm font-semibold">{!videoEnabled ? 'Your camera is turned off' : 'Connecting to camera...'}</p>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-xl text-white text-xs backdrop-blur-xs flex items-center gap-2">
                      <span>Ramesh Kumar (You)</span>
                      {audioEnabled && (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                          <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce delay-75" />
                          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                        </div>
                      )}
                    </div>

                    {/* PiP: Doctor Feed */}
                    <div 
                      onClick={() => setSwapViews(false)}
                      className="absolute top-16 right-4 w-32 h-44 bg-slate-800 rounded-2xl overflow-hidden border-2 border-teal-500/70 shadow-2xl cursor-pointer hover:border-white transition-all group"
                      title="Click to swap views"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400" 
                        alt="Doctor Video" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white flex justify-between items-center">
                        <span className="truncate">Dr. Rao</span>
                        <RefreshCw className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* DEFAULT: Doctor is Main Stage, Patient is PiP (Real Camera) */
                  <div className="w-full h-full relative">
                    <img 
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800" 
                      alt="Doctor Video" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Doctor Badge */}
                    <div className="absolute bottom-4 left-4 bg-black/75 px-3 py-1.5 rounded-xl text-white text-xs backdrop-blur-xs flex items-center gap-2 border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${isDoctorSpeaking ? 'bg-teal-400 animate-ping' : 'bg-emerald-400'}`} />
                      <span className="font-semibold">Dr. Arvind Rao (District Telehealth Hub)</span>
                      {isDoctorSpeaking && (
                        <span className="text-[10px] text-teal-300 font-mono">(Speaking)</span>
                      )}
                    </div>

                    {/* Patient PIP Window with REAL CAMERA FEED */}
                    <div 
                      onClick={() => setSwapViews(true)}
                      className="absolute top-16 right-4 w-32 h-44 sm:w-36 sm:h-48 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/30 hover:border-teal-400 shadow-2xl cursor-pointer transition-all group"
                      title="Click to expand your video feed"
                    >
                      {cameraStatus === 'connected' && videoEnabled ? (
                        <video 
                          ref={localVideoRef}
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      ) : cameraStatus === 'denied' || cameraStatus === 'no-device' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-800 text-slate-300">
                          <AlertCircle className="w-5 h-5 text-amber-400 mb-1" />
                          <p className="text-[10px] font-bold">No Camera</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); startCamera(); }}
                            className="mt-1 text-[9px] bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded font-semibold cursor-pointer"
                          >
                            Retry
                          </button>
                        </div>
                      ) : !videoEnabled ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                          <VideoOff className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-400">Cam Off</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {/* PiP Overlay Info */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/80 px-2 py-0.5 rounded-lg text-[10px] text-white flex items-center justify-between">
                        <span className="font-semibold">You</span>
                        <div className="flex items-center gap-1">
                          {/* Live Volume Meter */}
                          {audioEnabled ? (
                            <span 
                              className="w-1.5 h-1.5 rounded-full transition-all"
                              style={{
                                backgroundColor: micVolume > 15 ? '#10b981' : '#94a3b8',
                                transform: `scale(${1 + (micVolume / 100) * 0.8})`
                              }}
                            />
                          ) : (
                            <MicOff className="w-2.5 h-2.5 text-rose-400" />
                          )}
                          <RefreshCw className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-slate-300" />
                        </div>
                      </div>
                    </div>

                  </div>
                )
              ) : (
                /* Consultation Completed Summary */
                <div className="text-center p-8 text-white space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Consultation Completed</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Dr. Arvind Rao has generated and digitally signed your prescription under ABHA ID: <span className="font-mono text-teal-400">91-4521-8890-1234</span>
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-left space-y-2">
                    <p className="flex justify-between text-slate-300">
                      <span>Call Duration:</span>
                      <span className="font-mono font-bold text-white">{formatTimer(callDuration)}</span>
                    </p>
                    <p className="flex justify-between text-slate-300">
                      <span>Vitals Recorded:</span>
                      <span className="font-bold text-emerald-400">144/92 mmHg, FBS: 242 mg/dL</span>
                    </p>
                    <p className="flex justify-between text-slate-300">
                      <span>Prescribed Generic:</span>
                      <span className="font-bold text-teal-300">Metformin 500mg SR + Telmisartan 40mg</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      onClick={handleRejoinCall}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Rejoin Video Call</span>
                    </button>
                    <button
                      onClick={() => onNavigate('doctor-dashboard')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Open Prescription Studio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Media Bar & Interactive Call Controls */}
            {inCall && (
              <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 z-10">
                {/* Audio Mute/Unmute */}
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    audioEnabled 
                      ? 'bg-slate-800 text-white hover:bg-slate-700' 
                      : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  }`}
                  title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {audioEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{audioEnabled ? 'Mute' : 'Unmuted'}</span>
                </button>

                {/* Video Camera Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    videoEnabled 
                      ? 'bg-slate-800 text-white hover:bg-slate-700' 
                      : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  }`}
                  title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {videoEnabled ? <Video className="w-4 h-4 text-teal-400" /> : <VideoOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
                </button>

                {/* Screen Sharing */}
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    isScreenSharing 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Share Medical Reports or Screen"
                >
                  <MonitorUp className="w-4 h-4" />
                  <span className="hidden sm:inline">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                </button>

                {/* Swap Camera Views */}
                <button
                  onClick={() => setSwapViews(!swapViews)}
                  className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Swap Doctor and Patient Views"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Swap Feeds</span>
                </button>

                {/* Camera / Audio Device Settings */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  title="Hardware Settings (Camera, Mic)"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all transform active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Doctor Consultation Prompts */}
          {inCall && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-xs">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Ask Dr. Arvind Rao (Interactive Voice & Clinical Response):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendMessage('Doctor, what immediate action should I take for fasting blood sugar 242 mg/dL?')}
                  className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  🩸 Advice on 242 mg/dL Glucose
                </button>
                <button
                  onClick={() => handleSendMessage('Please explain the dosage instructions for Metformin 500mg.')}
                  className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  💊 Metformin Dosage Instructions
                </button>
                <button
                  onClick={() => handleSendMessage('When should I visit Maholi PHC for my free repeat HbA1c test?')}
                  className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  🏥 Maholi PHC Repeat Test Timing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: In-Call Panel (Vitals / Notes / Chat) (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-[520px]">
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Header */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold mb-4 shrink-0">
              <button
                onClick={() => setActiveTab('vitals')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'vitals' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Field Vitals
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'notes' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Doctor Notes
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'chat' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                <span>In-Call Chat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              </button>
            </div>

            {/* Tab 1: Vitals */}
            {activeTab === 'vitals' && (
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Blood Pressure:</span>
                    <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">144/92 mmHg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Capillary Glucose:</span>
                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">242 mg/dL (High)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Pulse Rate:</span>
                    <span className="font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">84 bpm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Oxygen Saturation:</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">98% SpO2</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 leading-relaxed space-y-1">
                  <p><strong>ASHA Field Sync:</strong> Recorded 18 minutes ago via Bluetooth glucometer at Sitapur Kiosk #01.</p>
                  <p className="text-[10px] text-teal-700">ABHA Health Locker Consent ID: CNST-SIT-2026-9921</p>
                </div>
              </div>
            )}

            {/* Tab 2: Doctor Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">Primary Diagnosis:</div>
                  <div className="text-slate-600">Type 2 Diabetes Mellitus with Essential Stage-1 Hypertension</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">Generic Substitution (PMBJP):</div>
                  <div className="text-emerald-700 font-semibold">• Metformin 500mg SR + Glimepiride 2mg</div>
                  <div className="text-emerald-700 font-semibold">• Telmisartan 40mg (Once Daily)</div>
                  <div className="text-[10px] text-slate-500 pt-1">Monthly Generic Savings: ₹407 (79% discount vs branded)</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">Physician Advice:</div>
                  <div className="text-slate-600">Avoid skipping evening medication. Maintain daily 30-minute brisk walk. Return for serum creatinine review in 14 days.</div>
                </div>
              </div>
            )}

            {/* Tab 3: In-call Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-2xl text-xs space-y-1 border ${
                      msg.isDoctor 
                        ? 'bg-teal-50/80 border-teal-100 text-slate-900 ml-2' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 mr-2'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-[11px]">
                      <span className={msg.isDoctor ? 'text-teal-800' : 'text-slate-800'}>{msg.sender}</span>
                      <span className="text-slate-400 font-normal">{msg.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          {/* Bottom Action Area */}
          <div className="pt-3 border-t border-slate-100 shrink-0">
            {activeTab === 'chat' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Dr. Arvind Rao..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('doctor-dashboard')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Doctor Prescription Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* MODAL: Camera and Microphone Hardware Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-600" />
                <span>Audio & Video Device Settings</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Camera Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Video Camera Input:
                </label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCamera(e.target.value, selectedAudioId);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {cameraDevices.length > 0 ? (
                    cameraDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Webcam</option>
                  )}
                </select>
              </div>

              {/* Microphone Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Microphone Input:
                </label>
                <select
                  value={selectedAudioId}
                  onChange={(e) => {
                    setSelectedAudioId(e.target.value);
                    startCamera(selectedCameraId, e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Microphone ${i + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Microphone</option>
                  )}
                </select>
              </div>

              {/* Live Mic Meter Test */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium">Microphone Live Level:</span>
                  <span className="font-mono font-bold text-teal-700">{micVolume}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-75"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
              </div>

              {/* Status and Diagnostics */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 space-y-1">
                <p><strong>Camera Status:</strong> {cameraStatus === 'connected' ? 'Connected & Streaming (WebRTC)' : cameraStatus}</p>
                <p><strong>Encryption:</strong> DTLS-SRTP 256-bit Secure Tunnel Active</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Doctor Real-time Slot Availability Checker */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Real-Time Doctor Availability & Subsidized Appointment Booking</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live schedule synced with Ayushman Arogya Mandir civil hospitals and empanelled physicians.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {bookingSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {availability && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Doctor Info Card */}
            <div className="md:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                  {availability.doctorName?.charAt(3) || 'D'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{availability.doctorName}</h3>
                  <p className="text-xs text-slate-500">{availability.specialty}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <p className="flex justify-between">
                  <span className="text-slate-400">Affiliation:</span>
                  <span className="font-semibold text-slate-700 text-right">{availability.hospitalAffiliation}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-extrabold text-emerald-700">₹{availability.consultationFee} (Subsidized)</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Next Available:</span>
                  <span className="font-semibold text-teal-700">{availability.nextAvailableSlot}</span>
                </p>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Available Slots for {selectedDate} ({availability.availableSlotsCount} of {availability.totalSlots})
                </p>
                <span className="text-[11px] text-slate-400">Select any slot to reserve teleconsultation</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availability.slots?.map((slot: string, idx: number) => (
                  <button
                    key={idx}
                    disabled={isBookingQueue}
                    onClick={() => handleBookSlot(slot)}
                    className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-600 hover:text-white text-teal-900 font-semibold text-xs text-center transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>

              {availability.slots?.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No slots available on this date. Please pick a different date.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* SECTION 3: Clinical Patient Follow-up Records */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Patient Clinical Follow-Up & Goal Tracking</span>
            </h2>
            <p className="text-xs text-slate-500">
              Continuity of care records: Scheduled follow-ups, clinical targets, and recovery updates.
            </p>
          </div>

          <button
            onClick={() => setShowFollowUpModal(true)}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Follow-Up</span>
          </button>
        </div>

        {/* Follow-ups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUps.map((fu: any) => (
            <div
              key={fu._id || fu.id}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Scheduled: {fu.scheduledDate}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    fu.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fu.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{fu.reason}</h3>
                <p className="text-xs text-slate-600">
                  Doctor: <span className="font-semibold text-slate-800">{fu.doctorName}</span> • Patient: <span className="font-semibold text-slate-800">{fu.patientName}</span>
                </p>

                {fu.clinicalGoals && fu.clinicalGoals.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Goals</p>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {fu.clinicalGoals.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {fu.status !== 'completed' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleMarkFollowUpComplete(fu._id || fu.id)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark Follow-Up Completed ✓
                  </button>
                </div>
              )}
            </div>
          ))}

          {followUps.length === 0 && (
            <div className="col-span-2 p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              No follow-ups currently scheduled for this patient. Click "Schedule Follow-Up" to create one.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Schedule Follow-Up */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Schedule Patient Follow-Up</h3>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Reason</label>
                <input
                  type="text"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Clinical Goal</label>
                <input
                  type="text"
                  value={followUpGoal}
                  onChange={(e) => setFollowUpGoal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFollowUp}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmittingFollowUp ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TelemedicinePage;
