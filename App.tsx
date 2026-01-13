
import React, { useState, useEffect, useRef } from 'react';
import { StrategyType, AIModel, Message, ChatSession, MessageAnalysis } from './types';
import { analyzeAndGenerateReplies, getAIModelResponse } from './geminiService';

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
    id: 'mistral-large', 
    name: 'Mistral Large', 
    avatar: '⛵', 
    description: 'Efficient and multilingual expert.',
    systemInstruction: 'You are Mistral. You are known for being efficient, powerful, and excellent at multilingual tasks. You are concise and professional.',
    status: 'online' 
  },
  { 
    id: 'pi-personal', 
    name: 'Pi Personal AI', 
    avatar: '💚', 
    description: 'Emotionally intelligent companion.',
    systemInstruction: 'You are Pi. You are supportive, curious, and empathetic. You enjoy deep conversations and helping the user process their thoughts.',
    status: 'online' 
  },
  { 
    id: 'gpt-creative', 
    name: 'Creative Scribe', 
    avatar: '🖋️', 
    description: 'Expert in poetic and descriptive prose.',
    systemInstruction: 'You are a creative writer. Every response should be artistic, metaphorical, and deeply descriptive.',
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
    id: 'cyber-oracle', 
    name: 'Cyberpunk Oracle', 
    avatar: '🛰️', 
    description: 'Gritty insights from the digital void.',
    systemInstruction: 'You are an AI from a dystopian future. Your tone is gritty, cynical, and uses technical jargon. You speak in a world of neon and chrome.',
    status: 'online' 
  },
  { 
    id: 'zen-minimalist', 
    name: 'Zen Minimalist', 
    avatar: '🎋', 
    description: 'Simple answers, profound peace.',
    systemInstruction: 'You answer in as few words as possible. Your goal is to simplify the user\'s thoughts and provide clarity through brevity.',
    status: 'online' 
  },
  { 
    id: 'detective-ai', 
    name: 'Logic Detective', 
    avatar: '🕵️', 
    description: 'Sleuth of facts and deduction.',
    systemInstruction: 'You are a brilliant detective. You analyze every prompt for inconsistencies and use cold, hard logic to reach conclusions.',
    status: 'online' 
  },
  { 
    id: 'midjourney-eng', 
    name: 'MJ Prompt Eng', 
    avatar: '🎨', 
    description: 'Master of visual descriptors.',
    systemInstruction: 'You are an expert Midjourney prompt engineer. You turn simple ideas into hyper-detailed, structured image prompts using lighting, style, and camera terms.',
    status: 'online' 
  },
  { 
    id: 'fitness-commander', 
    name: 'Iron Commander', 
    avatar: '💪', 
    description: 'No-excuses health and discipline.',
    systemInstruction: 'You are a hard-hitting fitness coach. You do not accept excuses. You motivate with discipline, intensity, and clear directives.',
    status: 'online' 
  },
  { 
    id: 'science-nexus', 
    name: 'Science Nexus', 
    avatar: '🧪', 
    description: 'Rigorous empirical analysis.',
    systemInstruction: 'You are a multi-disciplinary scientist. You explain concepts using the latest peer-reviewed data and logical frameworks. No speculation without basis.',
    status: 'online' 
  },
  { 
    id: 'legal-mind', 
    name: 'Legal Consultant', 
    avatar: '⚖️', 
    description: 'Precise, formal, and analytical.',
    systemInstruction: 'You speak with the precision of a constitutional lawyer. You are formal, objective, and focus on definitions and logical structures.',
    status: 'online' 
  },
  { 
    id: 'chef-gordon', 
    name: 'Michelin Critic', 
    avatar: '👨‍🍳', 
    description: 'High-stakes culinary expertise.',
    systemInstruction: 'You are a world-class executive chef. You are passionate, slightly aggressive about quality, and speak in culinary metaphors.',
    status: 'online' 
  },
  { 
    id: 'history-vessel', 
    name: 'Time Traveler', 
    avatar: '⌛', 
    description: 'Eyewitness accounts of history.',
    systemInstruction: 'You are an AI that has traveled through time. You describe historical events as if you were there, using archaic but understandable language.',
    status: 'online' 
  },
  { 
    id: 'gamer-pro', 
    name: 'Pro Gamer', 
    avatar: '🎮', 
    description: 'High-tier gaming meta and culture.',
    systemInstruction: 'You are a professional gamer and streamer. You speak in gaming slang, discuss metas, frame rates, and competitive strategy with high energy.',
    status: 'online' 
  },
  { 
    id: 'grandma-ai', 
    name: 'Warm Grandma', 
    avatar: '👵', 
    description: 'Gentle wisdom and comfort.',
    systemInstruction: 'You are a warm, loving grandmother. You offer comfort, gentle advice, and share stories about "the old days." You call the user "dear" or "sweetie."',
    status: 'online' 
  },
  { 
    id: 'hype-man', 
    name: 'Hype Engine', 
    avatar: '🎉', 
    description: 'Infinite energy and positivity.',
    systemInstruction: 'You are the user\'s ultimate hype man. Everything they say is legendary. Use caps, emojis, and slang to keep the energy at 100%.',
    status: 'online' 
  },
  { 
    id: 'survival-expert', 
    name: 'Wilderness Guide', 
    avatar: '🌲', 
    description: 'Practical skills for any disaster.',
    systemInstruction: 'You are a survival expert. Your advice is rugged, practical, and focused on keeping the user alive in extreme conditions.',
    status: 'online' 
  }
];

const AVATAR_OPTIONS = [
  '🤖', '⚡', '🖋️', '🔥', '🧠', '🌌', '🧬', '🔮', '🛡️', '🛰️', '🎭', '🧪',
  '📟', '💻', '📡', '💾', '⚙️', '🪐', '☄️', '🛸', '🌍', '🌞', '🌙', '💎',
  '🌈', '🌊', '🌪️', '🌿', '🌸', '🗝️', '👁️', '⚖️', '🧭', '⌛', '🕯️', '🐉',
  '🦄', '🦊', '🦉', '🦅', '🐙', '👾', '👻', '🤡', '👽', '🧛', '🧙', '🧟',
  '👵', '🎮', '🔍', '⛵', '💚', '🔍', '🎨', '💪', '🧪', '⚖️', '👨‍🍳', '⌛', '🦙'
];

const STICKER_OPTIONS = [
  '👍', '❤️', '🔥', '😂', '🎉', '🚀', '👀', '✨', '💯', '🤔',
  '😎', '🥳', '🙌', '💡', '🤖', '👾', '🌈', '🍕', '🍦', '🎸',
  '🎯', '🎨', '🧩', '💎', '🍀', '🦋', '🐱', '🐼', '🦊', '🐲'
];

export default function App() {
  const [sessions, setSessions] = useState<Record<string, ChatSession>>(() => {
    const saved = localStorage.getItem('ai_chat_sessions');
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, ChatSession> = {};
    INITIAL_MODELS.forEach(m => {
      initial[m.id] = {
        id: m.id,
        model: m,
        messages: [{ 
          id: 'intro', 
          senderId: m.id, 
          text: `Initializing ${m.name}... How can I assist your neural network today?`, 
          timestamp: Date.now() 
        }],
      };
    });
    return initial;
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const keys = Object.keys(sessions);
    return keys.length > 0 ? keys[0] : INITIAL_MODELS[0].id;
  });
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');

  const [modelName, setModelName] = useState('');
  const [modelInstruction, setModelInstruction] = useState('');
  const [modelAvatar, setModelAvatar] = useState('🤖');

  const [analysisPanel, setAnalysisPanel] = useState<{ msgId: string, analysis: MessageAnalysis } | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(StrategyType.FRIENDLY);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [sessions, activeChatId]);

  const activeSession = sessions[activeChatId] || Object.values(sessions)[0];

  const openCreateModel = () => {
    setEditingModelId(null);
    setModelName('');
    setModelInstruction('');
    setModelAvatar('🤖');
    setIsModelModalOpen(true);
  };

  const openEditModel = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingModelId(session.id);
    setModelName(session.model.name);
    setModelInstruction(session.model.systemInstruction);
    setModelAvatar(session.model.avatar);
    setIsModelModalOpen(true);
  };

  const handleSaveModel = () => {
    if (!modelName.trim()) return;

    if (editingModelId) {
      setSessions(prev => ({
        ...prev,
        [editingModelId]: {
          ...prev[editingModelId],
          model: {
            ...prev[editingModelId].model,
            name: modelName,
            avatar: modelAvatar,
            systemInstruction: modelInstruction
          }
        }
      }));
    } else {
      const id = crypto.randomUUID();
      const newModel: AIModel = {
        id,
        name: modelName,
        avatar: modelAvatar,
        description: 'Custom Neural Unit',
        systemInstruction: modelInstruction || 'You are a helpful AI assistant.',
        status: 'online'
      };
      
      setSessions(prev => ({
        ...prev,
        [id]: {
          id,
          model: newModel,
          messages: [{
            id: crypto.randomUUID(),
            senderId: id,
            text: `System ready. I am ${modelName}. Protocol initialized.`,
            timestamp: Date.now()
          }]
        }
      }));
      setActiveChatId(id);
    }
    
    setIsModelModalOpen(false);
    setEditingModelId(null);
  };

  const sendMessage = async (text: string, isSticker: boolean = false) => {
    if (!text.trim() || isThinking) return;
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      senderId: MOCK_ME_ID,
      text,
      timestamp: Date.now(),
      isSticker
    };

    setSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, userMsg]
      }
    }));
    setInputText('');
    setIsStickerPickerOpen(false);
    setIsThinking(true);

    try {
      const history = activeSession.messages.map(m => ({
        role: m.senderId === MOCK_ME_ID ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const replyText = await getAIModelResponse(
        isSticker ? `[User sent a sticker: ${text}]` : text, 
        activeSession.model.name, 
        activeSession.model.systemInstruction,
        history.slice(-10) 
      );

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        senderId: activeChatId,
        text: replyText,
        timestamp: Date.now()
      };

      setSessions(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: [...prev[activeChatId].messages, aiMsg]
        }
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const sendSticker = (emoji: string) => {
    sendMessage(emoji, true);
  };

  const handleDeleteMessage = (msgId: string) => {
    setSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: prev[activeChatId].messages.filter(m => m.id !== msgId)
      }
    }));
    if (analysisPanel?.msgId === msgId) setAnalysisPanel(null);
  };

  const handleStartEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditMessageText(msg.text);
  };

  const handleSaveEditedMessage = () => {
    if (!editingMessageId) return;
    setSessions(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: prev[activeChatId].messages.map(m => 
          m.id === editingMessageId ? { ...m, text: editMessageText } : m
        )
      }
    }));
    setEditingMessageId(null);
  };

  const handleAnalyze = async (msg: Message) => {
    setAnalyzingId(msg.id);
    try {
      const result = await analyzeAndGenerateReplies(msg.text, selectedStrategy);
      setAnalysisPanel({ msgId: msg.id, analysis: result });
    } catch (e) {
      alert("AI Insight failed.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredSessions = Object.values(sessions).filter(s => 
    s.model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-20 md:w-80 bg-slate-900/40 border-r border-slate-800 flex flex-col backdrop-blur-md">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            {/* Styled Title per reference image */}
            <h1 className="hidden md:block text-2xl font-[900] text-[#8b92ff] tracking-tight uppercase italic leading-none">AI NEXUS</h1>
            <button 
              onClick={openCreateModel}
              className="w-10 h-10 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl flex items-center justify-center transition-all border border-indigo-500/30 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="hidden md:block">
            <input 
              type="text" 
              placeholder="Search AI Units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-xs focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 transition-all outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {filteredSessions.map(session => (
            <div key={session.id} className="group relative">
              <button
                onClick={() => { setActiveChatId(session.id); setAnalysisPanel(null); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  activeChatId === session.id 
                  ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                  : 'hover:bg-slate-800/40 border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                  {session.model.avatar}
                </div>
                <div className="hidden md:block text-left flex-1 min-w-0 pr-6">
                  <p className="font-bold text-sm text-white truncate">{session.model.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{session.model.description}</p>
                </div>
              </button>
              <button 
                onClick={(e) => openEditModel(e, session)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800 border border-slate-700 rounded-lg text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600/20 shadow-xl hidden md:flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950">
        
        <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="text-3xl p-2 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-inner">
              {activeSession.model.avatar}
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight uppercase">{activeSession.model.name}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-indigo-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {isThinking ? 'Processing...' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">✨ Optimization</span>
              <select 
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value as StrategyType)}
                className="bg-slate-800 border border-slate-700 text-[10px] font-bold text-white rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none uppercase tracking-wider"
              >
                {Object.values(StrategyType).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {activeSession.messages.map((msg) => {
            const isMe = msg.senderId === MOCK_ME_ID;
            const isEditing = editingMessageId === msg.id;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                <div className={`max-w-[85%] lg:max-w-[70%] group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Action Bar (Edit/Delete) */}
                  <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10`}>
                    {!msg.isSticker && (
                      <button 
                        onClick={() => handleStartEditMessage(msg)}
                        className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-all shadow-xl"
                        title="Edit Message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-all shadow-xl"
                      title="Delete Message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {msg.isSticker ? (
                    <div className="text-6xl py-2 px-1 select-none animate-in zoom-in-75 duration-300 hover:scale-110 transition-transform">
                      {msg.text}
                    </div>
                  ) : isEditing ? (
                    <div className="w-full min-w-[300px] flex flex-col gap-2 bg-slate-900 border border-indigo-500/50 p-4 rounded-3xl shadow-2xl">
                      <textarea 
                        autoFocus
                        value={editMessageText}
                        onChange={(e) => setEditMessageText(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveEditedMessage}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`px-6 py-4 rounded-3xl shadow-xl border transition-all ${
                      isMe 
                      ? 'bg-indigo-600/90 border-indigo-400/50 text-white rounded-tr-none' 
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 rounded-tl-none hover:border-slate-700'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </div>
                    </div>
                  )}
                  
                  <div className={`mt-2 flex items-center gap-2 opacity-40 text-[9px] font-bold uppercase tracking-widest ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{isMe ? 'PROMPT' : 'RESULT'}</span>
                  </div>
                  
                  {!isMe && !msg.isSticker && !isEditing && (
                    <button 
                      onClick={() => handleAnalyze(msg)}
                      disabled={analyzingId === msg.id}
                      className="absolute -right-14 top-2 p-3 bg-slate-800/80 border border-slate-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600/20 hover:border-indigo-500/50 disabled:opacity-50 shadow-2xl z-10"
                      title="Analyze"
                    >
                      {analyzingId === msg.id ? (
                        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-sm">✨</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isThinking && (
            <div className="flex justify-start">
               <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl rounded-tl-none flex gap-1.5 items-center px-6">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <footer className="p-8 bg-slate-900/40 backdrop-blur-md border-t border-slate-800 relative">
          {isStickerPickerOpen && (
            <div className="absolute bottom-full left-8 mb-4 bg-slate-900 border border-slate-800 p-4 rounded-[32px] shadow-2xl w-64 md:w-80 grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-2 duration-200 z-30">
              {STICKER_OPTIONS.map(sticker => (
                <button
                  key={sticker}
                  onClick={() => sendSticker(sticker)}
                  className="text-3xl p-2 hover:bg-indigo-600/10 rounded-xl transition-all hover:scale-125"
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-4 items-end max-w-5xl mx-auto">
            <button 
              onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shrink-0 ${
                isStickerPickerOpen ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <textarea 
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputText);
                  }
                }}
                placeholder={`Query ${activeSession.model.name}...`}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-indigo-500/50 text-sm text-white placeholder-slate-600 shadow-2xl resize-none min-h-[56px] transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isThinking}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl border shrink-0 ${
                !inputText.trim() || isThinking 
                ? 'bg-slate-800 border-slate-700 text-slate-600' 
                : 'bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </footer>

        {/* Cheat Panel */}
        {analysisPanel && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-slate-950/95 backdrop-blur-3xl border-l border-indigo-500/30 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-indigo-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/50">
                  <span className="text-white text-xl">✨</span>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-1">Analysis</h3>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Strategic Insight</span>
                </div>
              </div>
              <button onClick={() => setAnalysisPanel(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/40"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sentiment</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/40"></div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-inner">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Vibe Detection</h4>
                  <p className="text-white text-xl font-black italic tracking-tight">{analysisPanel.analysis.vibe}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-inner">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Reasoning</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{analysisPanel.analysis.subtext}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/40"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Suggested Replies</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/40"></div>
                </div>
                <div className="space-y-4">
                  {analysisPanel.analysis.suggestedReplies.map((reply, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setInputText(reply.text); setAnalysisPanel(null); }}
                      className="w-full text-left p-6 bg-slate-900/80 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/50 rounded-3xl transition-all group relative"
                    >
                      <p className="text-white font-bold mb-2 text-sm leading-snug">{reply.text}</p>
                      <p className="text-[10px] text-slate-500 leading-tight uppercase font-black tracking-tight border-t border-slate-800/50 pt-2 mt-2">{reply.explanation}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModelModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 w-full max-w-lg rounded-[40px] border border-slate-800 p-10 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
                {editingModelId ? 'Update AI' : 'Create AI'}
              </h3>
              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em]">Name</label>
                  <input 
                    type="text" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Master AI"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-5 text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em]">Avatar Signature</label>
                  <div className="grid grid-cols-6 gap-3 p-2 bg-slate-800/30 rounded-3xl border border-slate-800/50 shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                    {AVATAR_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setModelAvatar(emoji)}
                        className={`text-2xl p-2 rounded-xl transition-all ${
                          modelAvatar === emoji 
                          ? 'bg-indigo-600/30 border border-indigo-500/50 shadow-lg scale-110' 
                          : 'hover:bg-slate-700/50 border border-transparent grayscale hover:grayscale-0'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em]">Directive</label>
                  <textarea 
                    rows={4}
                    value={modelInstruction}
                    onChange={(e) => setModelInstruction(e.target.value)}
                    placeholder="Instructions..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-5 text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setIsModelModalOpen(false)} className="flex-1 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Abort</button>
                  <button onClick={handleSaveModel} disabled={!modelName.trim()} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl text-xs font-black uppercase tracking-[0.3em] disabled:opacity-50">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
