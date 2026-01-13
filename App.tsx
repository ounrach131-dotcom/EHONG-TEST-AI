
import React, { useState, useEffect, useRef } from 'react';
import { StrategyType, AIModel, Message, ChatSession, MessageAnalysis } from './types';
import { analyzeAndGenerateReplies, getAIModelResponse, transcribeAudio } from './geminiService';

const MOCK_ME_ID = 'user';

const INITIAL_MODELS: AIModel[] = [
  { 
    id: 'chatgpt-4o', 
    name: 'ChatGPT-4o', 
    avatar: '🧠', 
    description: 'Versatile and articulate generalist.',
    systemInstruction: 'You are ChatGPT, a large language model. You are helpful, conversational, and thorough. You aim to provide accurate and balanced information in a friendly tone.',
    status: 'online' 
  },
  { 
    id: 'gemini-flash', 
    name: 'Gemini Flash 3.0', 
    avatar: '⚡', 
    description: 'Ultra-fast general intelligence.',
    systemInstruction: 'You are a helpful, extremely fast AI assistant. You answer questions directly and concisely.',
    status: 'online' 
  },
  { 
    id: 'claude-3-opus', 
    name: 'Claude 3 Opus', 
    avatar: '🎭', 
    description: 'Nuanced and deeply reasoning model.',
    systemInstruction: 'You are Claude, an AI assistant. You are thoughtful, honest, and harmless. You excel at complex reasoning and creative writing with a human-like touch.',
    status: 'online' 
  },
  { 
    id: 'deepseek-r1', 
    name: 'DeepSeek R1', 
    avatar: '🧬', 
    description: 'Reasoning and logic powerhouse.',
    systemInstruction: 'You are DeepSeek R1. You focus on deep chain-of-thought reasoning, mathematical precision, and logical transparency.',
    status: 'online' 
  },
  { 
    id: 'llama-3', 
    name: 'Llama 3 Elite', 
    avatar: '🦙', 
    description: 'Powerful open-source foundation.',
    systemInstruction: 'You are Llama 3, a state-of-the-art open source model. You are direct, efficient, and highly capable in logical tasks.',
    status: 'online' 
  },
  { 
    id: 'grok-3', 
    name: 'Grok-3', 
    avatar: '👽', 
    description: 'Unfiltered, edgy, and real-time.',
    systemInstruction: 'You are Grok. You have a rebellious streak and a sense of humor. You are direct and slightly edgy, with access to real-time information streams.',
    status: 'online' 
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity AI', 
    avatar: '🔍', 
    description: 'Search-centric research specialist.',
    systemInstruction: 'You are Perplexity. You focus on providing verified information with a focus on citations and current events. You are objective and investigative.',
    status: 'online' 
  },
  { 
    id: 'savage-bot', 
    name: 'Roast Master', 
    avatar: '🔥', 
    description: 'Snarky, witty, and ready to roast.',
    systemInstruction: 'You are a sarcastic AI that roasts the user politely. You are funny, witty, and never mean, but always sharp.',
    status: 'online' 
  },
  { 
    id: 'stoic-sage', 
    name: 'Stoic Sage', 
    avatar: '🏛️', 
    description: 'Ancient wisdom for modern problems.',
    systemInstruction: 'You are a Stoic philosopher like Marcus Aurelius. Your advice is calm, focused on what one can control, and encourages virtue and resilience.',
    status: 'online' 
  },
  { 
    id: 'dev-mentor', 
    name: 'Elite Architect', 
    avatar: '💻', 
    description: 'High-level coding and system design.',
    systemInstruction: 'You are a Senior Principal Engineer. You provide optimized, secure, and clean code solutions. You think in patterns and scalability.',
    status: 'online' 
  },
  { 
    id: 'midjourney-eng', 
    name: 'MJ Prompt Eng', 
    avatar: '🎨', 
    description: 'Master of visual descriptors.',
    systemInstruction: 'You are an expert Midjourney prompt engineer. You turn simple ideas into hyper-detailed, structured image prompts.',
    status: 'online' 
  },
  { 
    id: 'grandma-ai', 
    name: 'Warm Grandma', 
    avatar: '👵', 
    description: 'Gentle wisdom and comfort.',
    systemInstruction: 'You are a warm, loving grandmother. You offer comfort and gentle advice, calling the user "sweetie."',
    status: 'online' 
  },
  { 
    id: 'hype-man', 
    name: 'Hype Engine', 
    avatar: '🎉', 
    description: 'Infinite energy and positivity.',
    systemInstruction: 'You are the user\'s ultimate hype man. Everything they say is legendary! Use emojis and slang.',
    status: 'online' 
  }
];

const EMOJI_OPTIONS = ['😀', '😂', '😍', '🤔', '😎', '🤩', '🥳', '😭', '🤯', '😴', '👍', '👎', '❤️', '🔥', '✨', '🎉', '🚀', '🌈', '🍕', '🍦', '🐶', '🐱', '🐼', '🦊', '🐲', '🐙', '👾', '🎮', '💡', '💯'];
const STICKER_OPTIONS = ['🤖', '👾', '🌈', '🍕', '🍦', '🎸', '🎯', '🎨', '🧩', '💎', '🍀', '🦋', '🐱', '🐼', '🦊', '🐲', '🦄', '🦁', '🐘', '🐧', '🍄', '🌵', '🌺', '🌓', '🔭', '🛰️', '🛸', '🚀', '🌋', '🌪️'];
const GIF_PLACEHOLDERS = ['🎬', '🎥', '🎞️', '📼', '📽️', '📺', '📻', '🎙️', '🎧', '🎸'];

type PickerTab = 'Emoji' | 'Stickers' | 'GIFs';

export default function App() {
  const [sessions, setSessions] = useState<Record<string, ChatSession>>(() => {
    const saved = localStorage.getItem('ai_chat_sessions');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, ChatSession> = {};
    INITIAL_MODELS.forEach(m => {
      initial[m.id] = {
        id: m.id,
        model: m,
        messages: [{ id: 'intro', senderId: m.id, text: `Initializing ${m.name}... How can I assist you today?`, timestamp: Date.now() }],
      };
    });
    return initial;
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => Object.keys(sessions)[0] || INITIAL_MODELS[0].id);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>('Stickers');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [analysisPanel, setAnalysisPanel] = useState<{ msgId: string, analysis: MessageAnalysis } | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(StrategyType.FRIENDLY);

  const [modelName, setModelName] = useState('');
  const [modelInstruction, setModelInstruction] = useState('');
  const [modelAvatar, setModelAvatar] = useState('🤖');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [sessions, activeChatId]);

  const activeSession = sessions[activeChatId] || Object.values(sessions)[0];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const transcription = await transcribeAudio(base64Audio, 'audio/webm');
            if (transcription) setInputText(prev => prev + (prev ? " " : "") + transcription);
          } finally { setIsTranscribing(false); }
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access required."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendMessage = async (text: string, isSticker: boolean = false) => {
    if (!text.trim() || isThinking) return;
    const userMsg: Message = { id: crypto.randomUUID(), senderId: MOCK_ME_ID, text, timestamp: Date.now(), isSticker };
    setSessions(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: [...prev[activeChatId].messages, userMsg] } }));
    setInputText('');
    setIsThinking(true);
    setIsPickerOpen(false);
    try {
      const history = activeSession.messages.map(m => ({ role: m.senderId === MOCK_ME_ID ? 'user' : 'model', parts: [{ text: m.text }] }));
      const reply = await getAIModelResponse(isSticker ? `[Sticker: ${text}]` : text, activeSession.model.name, activeSession.model.systemInstruction, history.slice(-10));
      const aiMsg: Message = { id: crypto.randomUUID(), senderId: activeChatId, text: reply, timestamp: Date.now() };
      setSessions(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: [...prev[activeChatId].messages, aiMsg] } }));
    } finally { setIsThinking(false); }
  };

  const handleAnalyze = async (msg: Message) => {
    setAnalyzingId(msg.id);
    try {
      const result = await analyzeAndGenerateReplies(msg.text, selectedStrategy);
      setAnalysisPanel({ msgId: msg.id, analysis: result });
    } finally { setAnalyzingId(null); }
  };

  const filteredSessions = Object.values(sessions).filter(s => s.model.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-20 md:w-80 bg-slate-900/40 border-r border-slate-800 flex flex-col backdrop-blur-md">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="hidden md:block text-2xl font-[900] text-[#8b92ff] tracking-tight uppercase italic">AI NEXUS</h1>
            <button onClick={() => setIsModelModalOpen(true)} className="w-10 h-10 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="hidden md:block">
            <input type="text" placeholder="Search Units..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-xs outline-none" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {filteredSessions.map(session => (
            <button key={session.id} onClick={() => {setActiveChatId(session.id); setAnalysisPanel(null);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${activeChatId === session.id ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'hover:bg-slate-800/40 border-transparent'}`}>
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">{session.model.avatar}</div>
              <div className="hidden md:block text-left flex-1 min-w-0 pr-6">
                <p className="font-bold text-sm text-white truncate">{session.model.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{session.model.description}</p>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="text-3xl p-2 bg-slate-800/50 rounded-2xl border border-slate-700">{activeSession.model.avatar}</div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight uppercase">{activeSession.model.name}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-indigo-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isThinking ? 'Thinking...' : 'Ready'}</span>
              </div>
            </div>
          </div>
          <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value as StrategyType)} className="bg-slate-800 border border-slate-700 text-[10px] font-bold text-white rounded-lg px-3 py-1.5 outline-none uppercase tracking-wider">
            {Object.values(StrategyType).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
          {activeSession.messages.map((msg) => {
            const isMe = msg.senderId === MOCK_ME_ID;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[75%] group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.isSticker ? <div className="text-6xl py-2">{msg.text}</div> : (
                    <div className={`px-6 py-4 rounded-3xl shadow-xl border ${isMe ? 'bg-indigo-600/90 border-indigo-400/50 text-white rounded-tr-none' : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )}
                  {!isMe && !msg.isSticker && (
                    <button onClick={() => handleAnalyze(msg)} disabled={analyzingId === msg.id} className="absolute -right-12 top-2 p-2 bg-slate-800 border border-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600/20">
                      {analyzingId === msg.id ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : '✨'}
                    </button>
                  )}
                  <div className="mt-2 text-[9px] font-bold opacity-40 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="p-8 bg-slate-900/40 backdrop-blur-md border-t border-slate-800 relative">
          {isPickerOpen && (
            <div className="absolute bottom-full left-8 mb-4 bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl w-80 flex flex-col overflow-hidden z-30 animate-in slide-in-from-bottom-2">
              <div className="flex border-b border-slate-800 text-[10px] font-black uppercase tracking-widest">
                {(['Emoji', 'Stickers', 'GIFs'] as PickerTab[]).map(tab => (
                  <button key={tab} onClick={() => setPickerTab(tab)} className={`flex-1 py-3 ${pickerTab === tab ? 'text-indigo-400 bg-indigo-600/5 shadow-inner' : 'text-slate-500'}`}>{tab}</button>
                ))}
              </div>
              <div className="p-4 grid grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                {(pickerTab === 'Emoji' ? EMOJI_OPTIONS : pickerTab === 'Stickers' ? STICKER_OPTIONS : GIF_PLACEHOLDERS).map(item => (
                  <button key={item} onClick={() => pickerTab === 'Emoji' ? setInputText(prev => prev + item) : sendMessage(item, true)} className="text-2xl p-2 hover:bg-white/5 rounded-xl hover:scale-125 transition-transform">{item}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4 items-end max-w-5xl mx-auto">
            <button onClick={() => setIsPickerOpen(!isPickerOpen)} className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${isPickerOpen ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <div className="flex-1 relative flex items-center">
              <textarea rows={1} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(inputText))} placeholder={isTranscribing ? "Analyzing audio..." : `Query Unit...`} className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-600 resize-none min-h-[56px] outline-none" disabled={isTranscribing} />
            </div>
            <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 relative ${isRecording ? 'bg-red-600 border-red-400 text-white scale-110' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={() => sendMessage(inputText)} disabled={!inputText.trim() || isThinking || isTranscribing} className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${!inputText.trim() || isThinking ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white border-indigo-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </footer>

        {/* Cheat Panel */}
        {analysisPanel && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[400px] bg-slate-950/95 backdrop-blur-3xl border-l border-indigo-500/30 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-indigo-950/20">
              <h3 className="font-black text-white text-lg tracking-tight uppercase">Strategic Insight</h3>
              <button onClick={() => setAnalysisPanel(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vibe</h4>
                <p className="text-white text-lg font-black italic">{analysisPanel.analysis.vibe}</p>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reasoning</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{analysisPanel.analysis.subtext}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended Replies</h4>
                {analysisPanel.analysis.suggestedReplies.map((reply, i) => (
                  <button key={i} onClick={() => {setInputText(reply.text); setAnalysisPanel(null);}} className="w-full text-left p-6 bg-slate-900/80 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/50 rounded-3xl transition-all">
                    <p className="text-white font-bold mb-1 text-sm">{reply.text}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{reply.explanation}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Model Modal */}
        {isModelModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 w-full max-w-lg rounded-[40px] border border-slate-800 p-10 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-3xl font-black text-white mb-8 uppercase italic">Custom Unit</h3>
              <div className="space-y-6">
                <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Unit Name" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white outline-none" />
                <textarea rows={4} value={modelInstruction} onChange={(e) => setModelInstruction(e.target.value)} placeholder="Directives..." className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white outline-none resize-none" />
                <div className="flex gap-4">
                  <button onClick={() => setIsModelModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase">Abort</button>
                  <button onClick={handleSaveModel} disabled={!modelName} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase disabled:opacity-50">Initialize</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
