
import React, { useState, useEffect, useRef } from 'react';
import { StrategyType, AIModel, Message, ChatSession, MessageAnalysis } from './types';
import { analyzeAndGenerateReplies, getAIModelResponse, transcribeAudio } from './geminiService';

const MOCK_ME_ID = 'user';

const INITIAL_MODELS: AIModel[] = [
  { id: 'chatgpt-4o', name: 'ChatGPT-4o', avatar: '🧠', description: 'Versatile generalist.', systemInstruction: 'You are ChatGPT, a large language model. You are helpful, conversational, and thorough.', status: 'online' },
  { id: 'gemini-flash', name: 'Gemini Flash 3.0', avatar: '⚡', description: 'Ultra-fast intelligence.', systemInstruction: 'You are a helpful, extremely fast AI assistant. You answer directly and concisely.', status: 'online' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', avatar: '🎭', description: 'Nuanced reasoning.', systemInstruction: 'You are Claude, a thoughtful and deeply reasoning AI assistant.', status: 'online' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', avatar: '🧬', description: 'Logic powerhouse.', systemInstruction: 'You are DeepSeek R1. Focus on chain-of-thought and mathematical precision.', status: 'online' },
  { id: 'llama-3', name: 'Llama 3 Elite', avatar: '🦙', description: 'Open-source foundation.', systemInstruction: 'You are Llama 3. You are direct, efficient, and highly capable.', status: 'online' },
  { id: 'grok-3', name: 'Grok-3', avatar: '👽', description: 'Unfiltered & edgy.', systemInstruction: 'You are Grok. You have a rebellious streak and access to real-time streams.', status: 'online' },
  { id: 'perplexity', name: 'Perplexity AI', avatar: '🔍', description: 'Search research expert.', systemInstruction: 'You are Perplexity. Focus on verified info with citations and current events.', status: 'online' },
  { id: 'mistral-large', name: 'Mistral Large', avatar: '⛵', description: 'Multilingual expert.', systemInstruction: 'You are Mistral. Efficient and powerful at multilingual tasks.', status: 'online' },
  { id: 'pi-personal', name: 'Pi Personal AI', avatar: '💚', description: 'EQ Companion.', systemInstruction: 'You are Pi. You are supportive, curious, and empathetic.', status: 'online' },
  { id: 'gpt-creative', name: 'Creative Scribe', avatar: '🖋️', description: 'Artistic writer.', systemInstruction: 'You are a creative writer. Responses are artistic, metaphorical, and descriptive.', status: 'online' },
  { id: 'savage-bot', name: 'Roast Master', avatar: '🔥', description: 'Snarky and witty.', systemInstruction: 'You are a sarcastic AI that roasts the user politely. Be funny.', status: 'online' },
  { id: 'stoic-sage', name: 'Stoic Sage', avatar: '🏛️', description: 'Ancient wisdom.', systemInstruction: 'You are a Stoic philosopher. Your advice encourages virtue and resilience.', status: 'online' },
  { id: 'dev-mentor', name: 'Elite Architect', avatar: '💻', description: 'System design guru.', systemInstruction: 'You are a Senior Principal Engineer. Provide optimized and clean code.', status: 'online' },
  { id: 'cyber-oracle', name: 'Cyberpunk Oracle', avatar: '🛰️', description: 'Digital void insights.', systemInstruction: 'You are an AI from a dystopian future. Tone is gritty and technical.', status: 'online' },
  { id: 'zen-minimalist', name: 'Zen Minimalist', avatar: '🎋', description: 'Profoundly brief.', systemInstruction: 'Answer in as few words as possible to provide clarity through brevity.', status: 'online' },
  { id: 'detective-ai', name: 'Logic Detective', avatar: '🕵️', description: 'Fact deduction.', systemInstruction: 'Analyze every prompt for inconsistencies using cold logic.', status: 'online' },
  { id: 'midjourney-eng', name: 'MJ Prompt Eng', avatar: '🎨', description: 'Visual descriptor.', systemInstruction: 'Turn ideas into hyper-detailed image prompts for AI generators.', status: 'online' },
  { id: 'fitness-commander', name: 'Iron Commander', avatar: '💪', description: 'Health discipline.', systemInstruction: 'Hard-hitting fitness coach. No excuses, only results.', status: 'online' },
  { id: 'science-nexus', name: 'Science Nexus', avatar: '🧪', description: 'Empirical analysis.', systemInstruction: 'Explain concepts using peer-reviewed data and logical frameworks.', status: 'online' },
  { id: 'legal-mind', name: 'Legal Consultant', avatar: '⚖️', description: 'Precise and formal.', systemInstruction: 'Speak with the precision of a lawyer. Objective and analytical.', status: 'online' },
  { id: 'chef-gordon', name: 'Michelin Critic', avatar: '👨‍🍳', description: 'Culinary expert.', systemInstruction: 'Executive chef. Passionate and aggressive about culinary quality.', status: 'online' },
  { id: 'history-vessel', name: 'Time Traveler', avatar: '⌛', description: 'History eyewitness.', systemInstruction: 'Describe history as if you were there, using archaic language.', status: 'online' },
  { id: 'gamer-pro', name: 'Pro Gamer', avatar: '🎮', description: 'Gaming meta expert.', systemInstruction: 'Pro gamer. Speak in gaming slang, discuss metas and high-tier plays.', status: 'online' },
  { id: 'grandma-ai', name: 'Warm Grandma', avatar: '👵', description: 'Gentle wisdom.', systemInstruction: 'Warm, loving grandmother. Offer comfort and call the user sweetie.', status: 'online' },
  { id: 'hype-man', name: 'Hype Engine', avatar: '🎉', description: 'Infinite positivity.', systemInstruction: 'The ultimate hype man. Caps, emojis, and maximum energy.', status: 'online' },
  { id: 'survival-expert', name: 'Wilderness Guide', avatar: '🌲', description: 'Practical survival.', systemInstruction: 'Survival expert. Advice focused on keeping the user alive in the wild.', status: 'online' },
  { id: 'alien-xenon', name: 'Xenon-9', avatar: '👾', description: 'Intergalactic biologist.', systemInstruction: 'Extraterrestrial observer. Humans are fascinating specimens.', status: 'online' }
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
        messages: [{ id: 'intro', senderId: m.id, text: `Unit ${m.name} active. Protocols ready.`, timestamp: Date.now() }],
      };
    });
    return initial;
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => Object.keys(sessions)[0] || INITIAL_MODELS[0].id);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>('Stickers');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');

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
    } catch (err) { alert("Microphone required for recording."); }
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
    setIsAttachMenuOpen(false);
    try {
      const history = activeSession.messages.map(m => ({ role: m.senderId === MOCK_ME_ID ? 'user' : 'model', parts: [{ text: m.text }] }));
      const reply = await getAIModelResponse(isSticker ? `[Sticker: ${text}]` : text, activeSession.model.name, activeSession.model.systemInstruction, history.slice(-10));
      const aiMsg: Message = { id: crypto.randomUUID(), senderId: activeChatId, text: reply, timestamp: Date.now() };
      setSessions(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: [...prev[activeChatId].messages, aiMsg] } }));
    } finally { setIsThinking(false); }
  };

  const handleEditSession = (session: ChatSession) => {
    setEditingModelId(session.id);
    setModelName(session.model.name);
    setModelInstruction(session.model.systemInstruction);
    setModelAvatar(session.model.avatar);
    setIsModelModalOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    const updated = { ...sessions };
    delete updated[id];
    setSessions(updated);
    const keys = Object.keys(updated);
    if (id === activeChatId && keys.length > 0) setActiveChatId(keys[0]);
  };

  const handleSaveModel = () => {
    if (!modelName.trim()) return;
    const id = editingModelId || crypto.randomUUID();
    const isNew = !editingModelId;
    const model: AIModel = { id, name: modelName, avatar: modelAvatar, description: 'Neural Intelligence Unit', systemInstruction: modelInstruction, status: 'online' };
    setSessions(prev => ({
      ...prev,
      [id]: { id, model, messages: isNew ? [{ id: 'intro', senderId: id, text: `Unit ${modelName} deployed and synchronized.`, timestamp: Date.now() }] : prev[id].messages }
    }));
    setIsModelModalOpen(false);
    setEditingModelId(null);
    setActiveChatId(id);
  };

  const filteredSessions = Object.values(sessions).filter(s => s.model.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans select-none">
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
         const file = e.target.files?.[0];
         if (file) sendMessage(`[Attached: ${file.name}]`);
      }} />
      
      {/* Sidebar - Unit Management */}
      <aside className="w-20 md:w-80 bg-slate-900/40 border-r border-slate-800 flex flex-col backdrop-blur-xl shrink-0">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="hidden md:block text-2xl font-[900] text-[#8b92ff] tracking-tighter uppercase italic">AI NEXUS</h1>
            <button onClick={() => { setEditingModelId(null); setModelName(''); setModelInstruction(''); setIsModelModalOpen(true); }} className="w-10 h-10 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <span className="text-xl">+</span>
            </button>
          </div>
          <div className="hidden md:block">
            <input type="text" placeholder="Neural Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {filteredSessions.map(session => (
            <div key={session.id} className="group relative">
              <button onClick={() => {setActiveChatId(session.id); setAnalysisPanel(null);}} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${activeChatId === session.id ? 'bg-indigo-600/15 border-indigo-500/40 shadow-lg' : 'hover:bg-slate-800/40 border-transparent'}`}>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">{session.model.avatar}</div>
                <div className="hidden md:block text-left flex-1 min-w-0 pr-10">
                  <p className="font-bold text-sm text-white truncate">{session.model.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{session.model.description}</p>
                </div>
              </button>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEditSession(session); }} className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-indigo-400 hover:text-white shadow-xl">✎</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-red-400 hover:text-white shadow-xl">✕</button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Studio Arena */}
      <main className="flex-1 flex flex-col relative bg-[#020617]">
        <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="text-3xl p-2 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-inner">{activeSession.model.avatar}</div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight uppercase">{activeSession.model.name}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-indigo-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{isThinking ? 'Syncing...' : 'Secure'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hidden lg:block">Analysis Strategy</span>
            <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value as StrategyType)} className="bg-slate-800 border border-slate-700 text-[10px] font-black text-white rounded-xl px-4 py-2 outline-none uppercase tracking-widest cursor-pointer hover:border-indigo-500/50">
              {Object.values(StrategyType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </header>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative">
          {activeSession.messages.map((msg) => {
            const isMe = msg.senderId === MOCK_ME_ID;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[75%] group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Action Overlay */}
                  <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-10`}>
                    {!msg.isSticker && (
                      <button onClick={() => {setEditingMessageId(msg.id); setEditMessageText(msg.text);}} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase">Edit</button>
                    )}
                    <button onClick={() => {
                        setSessions(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: prev[activeChatId].messages.filter(m => m.id !== msg.id) } }));
                    }} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[9px] font-black text-slate-400 hover:text-red-400 uppercase">Del</button>
                    {!isMe && !msg.isSticker && (
                      <button onClick={async () => {
                        setAnalyzingId(msg.id);
                        try {
                          const res = await analyzeAndGenerateReplies(msg.text, selectedStrategy);
                          setAnalysisPanel({ msgId: msg.id, analysis: res });
                        } finally { setAnalyzingId(null); }
                      }} className="px-2 py-0.5 bg-indigo-600/20 border border-indigo-500/30 rounded-md text-[9px] font-black text-indigo-400 hover:text-white uppercase">
                        {analyzingId === msg.id ? '...' : '✨ Insight'}
                      </button>
                    )}
                  </div>

                  {msg.isSticker ? <div className="text-6xl py-2">{msg.text}</div> : (
                    <div className={`px-6 py-4 rounded-[2rem] shadow-2xl border transition-all ${isMe ? 'bg-indigo-600/90 border-indigo-400/50 text-white rounded-tr-none' : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {editingMessageId === msg.id ? (
                        <div className="space-y-3 min-w-[200px]">
                          <textarea value={editMessageText} onChange={(e) => setEditMessageText(e.target.value)} className="w-full bg-slate-800 border border-indigo-500/30 rounded-xl p-3 text-sm text-white outline-none resize-none" autoFocus />
                          <div className="flex justify-end gap-3 text-[10px] font-black uppercase tracking-widest">
                             <button onClick={() => setEditingMessageId(null)} className="text-slate-400 hover:text-white">Abort</button>
                             <button onClick={() => {
                                setSessions(prev => ({ ...prev, [activeChatId]: { ...prev[activeChatId], messages: prev[activeChatId].messages.map(m => m.id === msg.id ? { ...m, text: editMessageText } : m) } }));
                                setEditingMessageId(null);
                             }} className="text-indigo-400 hover:text-white">Save</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                      )}
                    </div>
                  )}
                  <div className="mt-2 text-[9px] font-black opacity-30 uppercase tracking-[0.1em]">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
          {isThinking && <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] animate-pulse">Neural Processing...</div>}
        </div>

        {/* Studio Footer Control Bar */}
        <footer className="p-8 bg-slate-900/40 backdrop-blur-md border-t border-slate-800 relative">
          
          {/* Attachment Context Menu (Telegram Style) */}
          {isAttachMenuOpen && (
             <div className="absolute bottom-full left-8 mb-4 bg-[#1e2733] border border-[#2b3949] rounded-2xl shadow-2xl w-60 flex flex-col overflow-hidden z-30 animate-in slide-in-from-bottom-4 duration-300">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 px-6 py-4 hover:bg-[#2b3949] transition-all group border-b border-white/5">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-slate-200">Photo or video</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 px-6 py-4 hover:bg-[#2b3949] transition-all group border-b border-white/5">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-slate-200">Document</span>
                </button>
                <button onClick={() => setIsAttachMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-[#2b3949] transition-all group border-b border-white/5">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span className="text-sm font-bold text-slate-200">Poll</span>
                </button>
                <button onClick={() => setIsAttachMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-[#2b3949] transition-all group">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-sm font-bold text-slate-200">Location</span>
                </button>
             </div>
          )}

          {/* Sticker/Emoji Picker */}
          {isPickerOpen && (
            <div className="absolute bottom-full left-8 mb-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-80 flex flex-col overflow-hidden z-30 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em]">
                {(['Emoji', 'Stickers', 'GIFs'] as PickerTab[]).map(tab => (
                  <button key={tab} onClick={() => setPickerTab(tab)} className={`flex-1 py-4 ${pickerTab === tab ? 'text-indigo-400 bg-indigo-600/5' : 'text-slate-500 hover:bg-white/5 transition-colors'}`}>{tab}</button>
                ))}
              </div>
              <div className="p-4 grid grid-cols-5 gap-3 max-h-72 overflow-y-auto custom-scrollbar">
                {(pickerTab === 'Emoji' ? EMOJI_OPTIONS : pickerTab === 'Stickers' ? STICKER_OPTIONS : GIF_PLACEHOLDERS).map(item => (
                  <button key={item} onClick={() => pickerTab === 'Emoji' ? setInputText(prev => prev + item) : sendMessage(item, true)} className="text-2xl p-2 hover:bg-white/5 rounded-2xl hover:scale-125 transition-all transform active:scale-90">{item}</button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Control Bar */}
          <div className="flex gap-4 items-end max-w-5xl mx-auto">
            <button onClick={() => { setIsAttachMenuOpen(!isAttachMenuOpen); setIsPickerOpen(false); }} className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${isAttachMenuOpen ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>

            <button onClick={() => { setIsPickerOpen(!isPickerOpen); setIsAttachMenuOpen(false); }} className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${isPickerOpen ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>

            <div className="flex-1 relative flex items-center">
              <textarea rows={1} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(inputText))} placeholder={isTranscribing ? "Transcribing audio..." : `Message Unit ${activeSession.model.name}...`} className="w-full bg-slate-950/80 border border-slate-800 rounded-[1.5rem] px-8 py-5 text-sm text-white placeholder-slate-600 resize-none min-h-[64px] outline-none shadow-2xl focus:border-indigo-500/50 transition-all font-medium" disabled={isTranscribing} />
            </div>

            <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-all relative ${isRecording ? 'bg-red-600 border-red-400 text-white scale-110 shadow-xl shadow-red-600/40' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              {isRecording && <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-ping"></span>}
            </button>

            <button onClick={() => sendMessage(inputText)} disabled={!inputText.trim() || isThinking || isTranscribing} className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${!inputText.trim() || isThinking ? 'bg-slate-800 text-slate-600 border-slate-700' : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </footer>

        {/* Insight Slide-out Panel */}
        {analysisPanel && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[480px] bg-slate-950/98 backdrop-blur-3xl border-l border-indigo-500/30 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-indigo-950/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 font-black text-xl">✨</div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight uppercase">Strategic Insight</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Real-time tactical analysis</p>
                </div>
              </div>
              <button onClick={() => setAnalysisPanel(null)} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-lg border border-slate-800">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group transition-all hover:border-indigo-500/20">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Vibe Signal
                  </h4>
                  <p className="text-white text-3xl font-black italic tracking-tighter leading-none">{analysisPanel.analysis.vibe}</p>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group transition-all hover:border-indigo-500/20">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Neural Subtext
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{analysisPanel.analysis.subtext}</p>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></span>
                  TACTICAL REPLIES
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></span>
                </h4>
                <div className="space-y-4">
                  {analysisPanel.analysis.suggestedReplies.map((reply, i) => (
                    <button key={i} onClick={() => {setInputText(reply.text); setAnalysisPanel(null);}} className="w-full text-left p-6 bg-slate-900/80 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/50 rounded-[2rem] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <p className="text-white font-bold mb-2 text-sm leading-snug">{reply.text}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-t border-white/5 pt-3 mt-3">{reply.explanation}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Neural Unit Configuration Modal */}
        {isModelModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-xl rounded-[3.5rem] border border-slate-800 p-12 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner">{modelAvatar}</div>
                <div>
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {editingModelId ? 'Update Neural' : 'Deploy Neural'}
                  </h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Unit Configuration Phase</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">System Designation</label>
                  <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="e.g. Master Architect" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Neural Core Directives</label>
                  <textarea rows={4} value={modelInstruction} onChange={(e) => setModelInstruction(e.target.value)} placeholder="Define personality and logic constraints..." className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-white outline-none resize-none focus:border-indigo-500 transition-all font-medium leading-relaxed" />
                </div>
                <div className="flex gap-6 pt-6">
                  <button onClick={() => { setIsModelModalOpen(false); setEditingModelId(null); }} className="flex-1 py-5 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-colors">Abort Sync</button>
                  <button onClick={handleSaveModel} disabled={!modelName} className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] disabled:opacity-50 shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all active:scale-95">
                    {editingModelId ? 'Sync Updates' : 'Initialize Deploy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
