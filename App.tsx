import React, { useState, useEffect, useRef } from 'react';
import {
  Snowflake,
  Wand2,
  Video,
  LogOut,
  Send,
  Loader2,
  Play,
  MessageSquareQuote,
  CheckCircle2,
  Share2,
  Lightbulb,
  FileText,
  Mail,
  Lock,
  User as UserIcon,
  Chrome,
  CloudUpload,
  Coins,
} from 'lucide-react';
import Snowfall from './components/Snowfall';
import { refineMessageWithElf, generateSantaVideo } from './services/gemini';
import { renderFinalVideo } from './services/videoMerger';
import {
  subscribeToAuth,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logOut,
  saveProjectToFirestore,
  getUserProjects,
  uploadFinalVideo,
  updateUserCredits,
} from './services/firebase';
import { User, MessageState, ChatMessage, ScriptOption } from './types';

// Fonte de áudio confiável
const SUGGESTED_PROMPTS = [
  'Para minha filha que foi muito obediente e passou de ano.',
  'Para meu marido agradecendo por cuidar da nossa família.',
  'Para a equipe do trabalho que bateu a meta este ano.',
];

// --- PLAYER REESCRITO (SEQUENCIAL ESTRITO) ---
const SeamlessPlayer = ({ videoUrls }: { videoUrls: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Reiniciar estado quando a lista de vídeos mudar
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setHasEnded(false);
    if (videoRef.current) {
      // Garante que o src seja atualizado
      videoRef.current.src = videoUrls[0];
      videoRef.current.load();
    }
  }, [videoUrls]);

  const handlePlay = async () => {
    if (!videoRef.current) return;

    // Se já terminou tudo, reinicia
    if (hasEnded) {
      setCurrentIndex(0);
      setHasEnded(false);
      videoRef.current.src = videoUrls[0];
      videoRef.current.currentTime = 0;
    }

    // Se o src estiver vazio por algum motivo, força a atualização
    if (
      !videoRef.current.src ||
      videoRef.current.src === window.location.href
    ) {
      videoRef.current.src = videoUrls[currentIndex];
    }

    setIsPlaying(true);

    // Tenta tocar o vídeo
    try {
      await videoRef.current.play();
    } catch (e) {
      console.error('Video play failed:', e);
      setIsPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    if (currentIndex < videoUrls.length - 1) {
      // Tocar próximo vídeo
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (videoRef.current) {
        videoRef.current.src = videoUrls[nextIndex];
        videoRef.current.play().catch(console.error);
      }
    } else {
      // Fim da playlist
      setIsPlaying(false);
      setHasEnded(true);
    }
  };

  return (
    <div className="relative w-full h-full bg-black group rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Elemento de Vídeo Único (Alternamos o SRC) */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onEnded={handleVideoEnded}
        playsInline
        preload="auto"
        onClick={() => {
          if (isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
          } else {
            handlePlay();
          }
        }}
        // REMOVED crossOrigin="anonymous" to fix playback issues with Firebase Storage URLs
      />

      {/* Overlay de Play / Replay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
          <button
            onClick={e => {
              e.stopPropagation();
              handlePlay();
            }}
            className="group/btn relative px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full text-xl font-bold shadow-2xl transform transition-all hover:scale-110 flex items-center gap-3"
          >
            {hasEnded ? (
              <Video size={32} />
            ) : (
              <Play fill="currentColor" size={32} />
            )}
            {hasEnded ? 'Assistir Novamente' : 'Tocar Mensagem'}
          </button>
        </div>
      )}

      {/* Indicador de Parte */}
      {isPlaying && videoUrls.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white/80 border border-white/10">
          Cena {currentIndex + 1}/{videoUrls.length}
        </div>
      )}
    </div>
  );
};

interface OptionSelectorProps {
  options: ScriptOption[];
  onSelect: (option: ScriptOption) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  onSelect,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
    {options.map(opt => (
      <button
        key={opt.id}
        onClick={() => onSelect(opt)}
        className="glass-panel p-4 rounded-xl text-left hover:bg-white/10 transition-all border border-transparent hover:border-yellow-400 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <MessageSquareQuote size={16} /> {opt.title}
        </h4>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="pl-2 border-l-2 border-green-500/50">
            1. "{opt.parts[0]}"
          </p>
          <p className="pl-2 border-l-2 border-red-500/50">
            2. "{opt.parts[1]}"
          </p>
        </div>
        <div className="mt-3 flex items-center text-xs text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
          Selecionar este roteiro <CheckCircle2 size={12} />
        </div>
      </button>
    ))}
  </div>
);

// --- Sub-components (Extracted to avoid re-render bugs) ---

interface LandingViewProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  setAuthError: (err: string | null) => void;
  handleEmailAuth: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
  displayName: string;
  setDisplayName: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  authError: string | null;
  loading: boolean;
}

const LandingView: React.FC<LandingViewProps> = ({
  authMode,
  setAuthMode,
  setAuthError,
  handleEmailAuth,
  handleGoogleLogin,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  authError,
  loading,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-10 py-10">
    <div className="mb-4 animate-bounce">
      <Snowflake size={64} className="text-white opacity-90" />
    </div>
    <h1 className="text-5xl md:text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-red-500 christmas-font drop-shadow-lg">
      NoelVision
    </h1>
    <p className="text-lg md:text-xl text-blue-100 mb-8 font-light">
      Transforme mensagens em vídeos mágicos do Papai Noel com IA.
    </p>

    {/* Auth Card */}
    <div className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-2xl border-t border-white/20 relative z-20">
      <div className="flex justify-center mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => {
            setAuthMode('login');
            setAuthError(null);
          }}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            authMode === 'login'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => {
            setAuthMode('register');
            setAuthError(null);
          }}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            authMode === 'register'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Cadastrar
        </button>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {authMode === 'register' && (
          <div className="relative group z-20">
            <UserIcon
              className="absolute left-3 top-3 text-gray-400 group-focus-within:text-white"
              size={18}
            />
            <input
              type="text"
              placeholder="Seu Nome"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all relative z-20"
              required
            />
          </div>
        )}
        <div className="relative group z-20">
          <Mail
            className="absolute left-3 top-3 text-gray-400 group-focus-within:text-white"
            size={18}
          />
          <input
            type="email"
            placeholder="Seu Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all relative z-20"
            required
          />
        </div>
        <div className="relative group z-20">
          <Lock
            className="absolute left-3 top-3 text-gray-400 group-focus-within:text-white"
            size={18}
          />
          <input
            type="password"
            placeholder="Sua Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-all relative z-20"
            required
          />
        </div>

        {authError && (
          <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/20">
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : authMode === 'login' ? (
            'Acessar Oficina'
          ) : (
            'Criar Conta Mágica'
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10"></div>
        <span className="text-gray-500 text-xs uppercase">Ou continue com</span>
        <div className="h-px flex-1 bg-white/10"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 relative z-20"
      >
        <Chrome size={20} className="text-red-500" /> Google
      </button>
    </div>
  </div>
);

interface DashboardViewProps {
  user: User | null;
  handleLogout: () => void;
  startNewProject: () => void;
  projects: MessageState[];
  setCurrentProject: (p: MessageState) => void;
  setView: (v: 'landing' | 'dashboard' | 'create' | 'result') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  handleLogout,
  startNewProject,
  projects,
  setCurrentProject,
  setView,
}) => {
  const credits = user?.credits || 0;

  return (
    <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto relative z-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h2 className="text-4xl christmas-font text-white">
            Olá, {user?.displayName}
          </h2>
          <p className="text-gray-400 text-sm">
            Seus projetos mágicos salvos no Polo Norte.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>

      {credits === 0 && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center gap-3 text-red-200">
          <Lock size={20} />
          <p>
            Seus créditos acabaram! Você não pode criar novos vídeos no momento.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          onClick={credits > 0 ? startNewProject : undefined}
          className={`glass-panel rounded-2xl p-8 flex flex-col items-center justify-center transition-all border-2 border-dashed h-80 group ${
            credits > 0
              ? 'cursor-pointer hover:bg-white/10 border-gray-600 hover:border-green-500'
              : 'cursor-not-allowed border-gray-700 opacity-50'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors mb-4 ${
              credits > 0
                ? 'bg-green-500/10 group-hover:bg-green-500/20'
                : 'bg-gray-700'
            }`}
          >
            <Wand2
              className={`${
                credits > 0 ? 'text-green-400' : 'text-gray-500'
              } w-8 h-8`}
            />
          </div>
          <h3
            className={`text-2xl font-bold transition-colors ${
              credits > 0
                ? 'text-white group-hover:text-green-400'
                : 'text-gray-500'
            }`}
          >
            Nova Mensagem
          </h3>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {credits > 0
              ? 'Crie um novo vídeo mágico'
              : 'Sem créditos disponíveis'}
          </p>
        </div>
        {projects.map(p => (
          <div
            key={p.id}
            className="glass-panel rounded-2xl overflow-hidden flex flex-col h-80 relative group hover:border-white/20 transition-all"
          >
            <div className="h-40 bg-black/50 flex items-center justify-center relative border-b border-white/5">
              {p.status === 'completed' ? (
                <Video className="text-red-500 w-12 h-12" />
              ) : (
                <Loader2 className="animate-spin text-yellow-500" />
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <UserIcon size={10} /> {user?.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <p className="text-gray-300 line-clamp-2 italic mb-4">
                "{p.refinedText}"
              </p>

              {p.status === 'completed' && (
                <button
                  onClick={() => {
                    setCurrentProject(p);
                    setView('result');
                  }}
                  className="mt-auto w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                  <Play size={16} /> Assistir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CreateViewProps {
  setView: (v: 'dashboard') => void;
  chatHistory: ChatMessage[];
  scriptOptions: ScriptOption[];
  selectedScript: ScriptOption | null;
  setSelectedScript: (s: ScriptOption | null) => void;
  setScriptOptions: (s: ScriptOption[]) => void;
  rawInput: string;
  setRawInput: (s: string) => void;
  handleSendMessage: () => void;
  loading: boolean;
  generationStep: string;
  errorMsg: string | null;
  handleGenerateVideo: () => void;
  handleSuggestionClick: (prompt: string) => void;
  handleSelectScript: (option: ScriptOption) => void;
  userCredits: number;
}

const CreateView: React.FC<CreateViewProps> = ({
  setView,
  chatHistory,
  scriptOptions,
  selectedScript,
  setSelectedScript,
  setScriptOptions,
  rawInput,
  setRawInput,
  handleSendMessage,
  loading,
  generationStep,
  errorMsg,
  handleGenerateVideo,
  handleSuggestionClick,
  handleSelectScript,
  userCredits,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll effect moved here
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, scriptOptions]);

  const hasCredits = userCredits > 0;

  return (
    <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto relative z-10 flex flex-col pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView('dashboard')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Voltar
        </button>
        <h2 className="text-3xl christmas-font">Oficina do Duende</h2>
      </div>

      <div className="flex-1 min-h-[300px] glass-panel rounded-2xl p-6 mb-6 overflow-y-auto space-y-4 max-h-[50vh]">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-2xl p-4 max-w-[85%] shadow-lg ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-none'
                  : 'bg-green-700 text-white rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* SUGESTÕES DE MENSAGENS */}
        {chatHistory.length === 1 && chatHistory[0].role === 'model' && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Lightbulb size={14} className="text-yellow-400" /> Exemplos para
              começar:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-sm text-blue-200 transition-colors text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.length > 0 &&
          chatHistory[chatHistory.length - 1].role === 'model' &&
          scriptOptions.length > 0 &&
          !selectedScript && (
            <OptionSelector
              options={scriptOptions}
              onSelect={handleSelectScript}
            />
          )}
        <div ref={chatEndRef} />
      </div>

      <div className="glass-panel rounded-2xl p-4 flex gap-4 items-center border-t border-white/10">
        <input
          ref={inputRef}
          type="text"
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            scriptOptions.length > 0
              ? 'Escolha uma opção ou digite para alterar...'
              : 'Digite sua mensagem...'
          }
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
          disabled={loading || generationStep !== ''}
          autoFocus
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !rawInput.trim()}
          className="p-3 bg-red-600 rounded-full hover:bg-red-700 disabled:opacity-50 text-white shadow-lg transition-transform active:scale-90"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-xl flex items-center gap-2">
          <Lock size={16} /> {errorMsg}
        </div>
      )}

      {/* ROTEIRO SELECIONADO (VISUALIZAÇÃO COMPLETA) */}
      {selectedScript && !errorMsg && !generationStep && (
        <div className="mt-6 p-6 glass-panel rounded-2xl border-t-4 border-green-500 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-400" size={20} />
              <h3 className="text-lg font-bold text-green-400">
                Roteiro Selecionado ({selectedScript.title})
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedScript(null);
                setScriptOptions([]);
              }}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Escolher outro
            </button>
          </div>

          <div className="mb-6 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
            {selectedScript.parts.map((part, i) => (
              <p key={i} className="text-gray-200 font-medium italic">
                <span className="text-green-500/50 not-italic mr-2">
                  Parte {i + 1}:
                </span>
                "{part}"
              </p>
            ))}
          </div>

          <button
            onClick={handleGenerateVideo}
            disabled={!hasCredits}
            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
              hasCredits
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:scale-[1.02]'
                : 'bg-gray-600 cursor-not-allowed opacity-70'
            }`}
          >
            {hasCredits ? (
              <>
                <Video /> Gerar Vídeo Mágico (1 Crédito)
              </>
            ) : (
              <>
                <Lock size={20} /> Sem créditos disponíveis
              </>
            )}
          </button>
          {!hasCredits && (
            <p className="text-center text-gray-400 text-sm mt-3">
              Você atingiu o limite de vídeos da versão de demonstração.
            </p>
          )}
        </div>
      )}

      {generationStep && (
        <div className="mt-6 p-6 glass-panel rounded-2xl flex items-center justify-center gap-3 text-yellow-400 animate-pulse border border-yellow-500/20">
          <Loader2 className="animate-spin" /> {generationStep}
        </div>
      )}
    </div>
  );
};

interface ResultViewProps {
  setView: (v: 'dashboard') => void;
  currentProject: MessageState | null;
  rendering: boolean;
  renderProgress: string;
  handleFinalizeAndDownload: () => void;
  handleShare: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
  setView,
  currentProject,
  rendering,
  renderProgress,
  handleFinalizeAndDownload,
  handleShare,
}) => {
  // CORREÇÃO CRÍTICA: Prioridade para finalVideoUrl.
  // Se existir finalVideoUrl, usa ela (histórico ou recém salvo).
  // Se não (criação em andamento sem upload), usa videoUrls locais.
  const videoSource = currentProject?.finalVideoUrl
    ? [currentProject.finalVideoUrl]
    : currentProject?.videoUrls;

  return (
    <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto relative z-10 flex flex-col items-center">
      <button
        onClick={() => setView('dashboard')}
        className="self-start text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        &larr; Voltar para Dashboard
      </button>

      <div className="w-full max-w-3xl">
        {videoSource && <SeamlessPlayer videoUrls={videoSource} />}
      </div>

      <div className="mt-8 text-center w-full max-w-2xl">
        <h2 className="text-4xl christmas-font text-green-400 mb-4">
          Seu vídeo está pronto!
        </h2>

        {rendering ? (
          <div className="w-full p-4 glass-panel rounded-xl flex items-center justify-center gap-3 text-yellow-400">
            <Loader2 className="animate-spin" />
            <span>{renderProgress}</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={handleFinalizeAndDownload}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <CloudUpload size={20} />
              {currentProject?.finalVideoUrl
                ? 'Baixar Vídeo'
                : 'Baixar e Salvar'}
            </button>
            <button
              id="share-btn"
              onClick={handleShare}
              className="px-8 py-4 glass-panel hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 size={20} /> Compartilhar Link
            </button>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">
          Nota: Ao baixar, o vídeo também será salvo na sua conta para acesso
          futuro.
        </p>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<
    'landing' | 'dashboard' | 'create' | 'result'
  >('landing');
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState('');

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [rawInput, setRawInput] = useState('');
  const [scriptOptions, setScriptOptions] = useState<ScriptOption[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptOption | null>(
    null
  );

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentProject, setCurrentProject] = useState<MessageState | null>(
    null
  );
  const [generationStep, setGenerationStep] = useState<string>('');
  const [projects, setProjects] = useState<MessageState[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(u => {
      if (u) {
        setUser(u);
        if (view === 'landing') setView('dashboard');
      } else {
        setUser(null);
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      const msgs = await getUserProjects(user.uid);
      setProjects(msgs);
    } catch (e) {
      console.error('Erro ao carregar projetos:', e);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'register') {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        setAuthError('Email ou senha incorretos.');
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError('Este email já está cadastrado.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setAuthError('Erro na autenticação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      setAuthError('Falha ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
  };

  const startNewProject = () => {
    setRawInput('');
    setScriptOptions([]);
    setSelectedScript(null);
    setLoading(false);
    setGenerationStep('');
    setChatHistory([
      {
        role: 'model',
        text: 'Ho ho ho! Eu sou o Duende Jingle. Diga-me, para quem você quer enviar um desejo de Natal e o que ele deve dizer?',
      },
    ]);
    setCurrentProject(null);
    setErrorMsg(null);
    setView('create');
  };

  const processMessage = async (input: string) => {
    const newHistory = [...chatHistory, { role: 'user' as const, text: input }];
    setChatHistory(newHistory);
    setRawInput('');
    setLoading(true);
    setErrorMsg(null);
    setScriptOptions([]);

    try {
      const options = await refineMessageWithElf(input);
      setScriptOptions(options);
      setChatHistory([
        ...newHistory,
        {
          role: 'model',
          text: `Preparei ${options.length} opções mágicas. Qual você prefere?`,
        },
      ]);
    } catch (error) {
      setChatHistory([
        ...newHistory,
        {
          role: 'model',
          text: 'Erro ao contatar o polo norte. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!rawInput.trim()) return;
    await processMessage(rawInput);
  };

  const handleSuggestionClick = async (text: string) => {
    await processMessage(text);
  };

  const handleSelectScript = (option: ScriptOption) => {
    const updatedParts = [...option.parts];
    const part1 = updatedParts[0].trim();
    if (!part1.toLowerCase().startsWith('ho ho ho')) {
      updatedParts[0] = `Ho ho ho! ${part1}`;
    }
    const part2 = updatedParts[1].trim();
    const cleanPart2 = part2.toLowerCase().replace(/[.!]+$/, '');
    if (!cleanPart2.endsWith('feliz natal')) {
      if (part2.endsWith('.') || part2.endsWith('!')) {
        updatedParts[1] = `${part2} Feliz Natal!`;
      } else {
        updatedParts[1] = `${part2}. Feliz Natal!`;
      }
    }
    const finalOption = { ...option, parts: updatedParts };
    setSelectedScript(finalOption);
  };

  const handleGenerateVideo = async () => {
    if (!selectedScript || !user) return;

    // Check credits
    if ((user.credits || 0) <= 0) {
      setErrorMsg('Você não possui créditos suficientes. 🎅');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setGenerationStep('Preparando o Trenó...');

    // Deduct credit immediately (optimistic update)
    const previousCredits = user.credits;
    const newCredits = Math.max(0, previousCredits - 1);

    // Update local state and firestore
    setUser({ ...user, credits: newCredits });
    try {
      await updateUserCredits(user.uid, newCredits);
    } catch (e) {
      console.error('Falha ao atualizar créditos', e);
      // Não bloqueia o fluxo, mas loga o erro
    }

    // Save draft state
    const newProject: MessageState = {
      id: Date.now().toString(),
      userId: user.uid,
      originalText: chatHistory.find(m => m.role === 'user')?.text || '',
      refinedText: selectedScript.parts.join(' '),
      scriptParts: selectedScript.parts,
      status: 'generating',
      createdAt: Date.now(),
      chatHistory: chatHistory, // Persist chat
    };
    setCurrentProject(newProject);

    try {
      const videoUrls = await generateSantaVideo(selectedScript.parts, step =>
        setGenerationStep(step)
      );
      const completedProject: MessageState = {
        ...newProject,
        status: 'completed',
        videoUrls: videoUrls,
      };

      // Save to Firestore (with silent fail for permissions to not block user flow)
      try {
        await saveProjectToFirestore(completedProject);
      } catch (saveError) {
        console.warn(
          'Salvamento no Firestore falhou, mas continuando o fluxo:',
          saveError
        );
      }

      setCurrentProject(completedProject);
      // Reload projects to sync list (might fail if permissions bad, but thats ok)
      loadProjects().catch(() => {});

      setView('result');
    } catch (error: any) {
      console.error(error);

      // REFUND CREDIT ON FAILURE
      setUser({ ...user, credits: previousCredits });
      try {
        await updateUserCredits(user.uid, previousCredits);
      } catch (e) {
        console.error('Falha ao reembolsar créditos', e);
      }

      let msg = 'Erro desconhecido.';
      if (error.message === 'API_KEY_MISSING') msg = 'Chave de API necessária.';
      else if (error.message === 'QUOTA_EXCEEDED')
        msg = 'Muitos pedidos (Erro 429). Aguarde.';
      else if (error.message?.includes('No video URI'))
        msg = 'Falha técnica no vídeo.';
      else if (error.code === 'permission-denied')
        msg = 'Erro de permissão no banco de dados.';
      setErrorMsg(msg);
      setCurrentProject(prev => (prev ? { ...prev, status: 'failed' } : null));
    } finally {
      setLoading(false);
      setGenerationStep('');
    }
  };

  const handleFinalizeAndDownload = async () => {
    // CORREÇÃO CRÍTICA: Se já existe vídeo final (do histórico),
    // tentamos baixar via blob fetch. Se falhar (CORS), abrimos em nova aba.
    if (currentProject?.finalVideoUrl) {
      try {
        setRendering(true);
        setRenderProgress('Baixando vídeo...');
        const response = await fetch(currentProject.finalVideoUrl);
        if (!response.ok) throw new Error('Falha no download (CORS ou Rede)');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `noelvision-${currentProject.id}.webm`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (e) {
        console.warn(
          'Download direto falhou (provavelmente CORS), abrindo em nova aba como fallback',
          e
        );
        // Fallback robusto: abrir em nova aba
        window.open(currentProject.finalVideoUrl, '_blank');
      } finally {
        setRendering(false);
        setRenderProgress('');
      }
      return;
    }

    if (!currentProject?.videoUrls) return;
    setRendering(true);
    setRenderProgress('Renderizando (Otimizado)...');
    try {
      const finalBlob = await renderFinalVideo(
        currentProject.videoUrls,
        msg => setRenderProgress(msg)
      );

      // 1. Upload to Storage
      setRenderProgress('Salvando na nuvem...');
      try {
        const publicUrl = await uploadFinalVideo(finalBlob, currentProject.id);

        // Update project with final URL
        const updatedProject = { ...currentProject, finalVideoUrl: publicUrl };
        setCurrentProject(updatedProject);
        await saveProjectToFirestore(updatedProject);
      } catch (uploadError) {
        console.warn(
          'Upload falhou, mas permitindo download local:',
          uploadError
        );
      }

      // 2. Trigger Download
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noelvision-${currentProject.id}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro na renderização:', e);
      setErrorMsg('Não foi possível processar o vídeo final. Tente novamente.');
    } finally {
      setRendering(false);
      setRenderProgress('');
    }
  };

  const handleShare = async () => {
    const shareUrl =
      (currentProject as any).finalVideoUrl || window.location.href;
    const textToShare = `Veja a mensagem especial do Papai Noel que criei: "${currentProject?.refinedText}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NoelVision - Mensagem do Papai Noel',
          text: textToShare,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.warn('Compartilhamento nativo cancelado ou falhou:', err);
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById('share-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class='flex items-center gap-2'><CheckCircle2 size={20}/> Link Copiado!</span>`;
        setTimeout(() => (btn.innerHTML = originalText), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Helper para cor dos créditos
  const getCreditColor = (credits: number) => {
    if (credits === 0) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (credits === 1)
      return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-green-400 border-green-500/30 bg-green-500/10';
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden text-white font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-900/20 rounded-full blur-[100px]" />
      </div>

      <Snowfall />

      {/* Navbar */}
      {user && view !== 'landing' && (
        <nav className="fixed top-0 w-full z-50 h-16 glass-panel border-b-0 border-white/5 flex items-center px-6 justify-between backdrop-blur-md">
          <span
            className="christmas-font text-2xl text-red-500 cursor-pointer"
            onClick={() => setView('dashboard')}
          >
            NoelVision
          </span>
          <div className="flex items-center gap-4">
            {/* Credit Counter */}
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border transition-colors ${getCreditColor(
                user.credits
              )}`}
            >
              <Coins size={14} />
              <span>
                {user.credits} Crédito{user.credits !== 1 && 's'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 hidden md:inline">
                {user.displayName}
              </span>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-gray-600 bg-gray-800"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold border border-red-400">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {view === 'landing' && (
        <LandingView
          authMode={authMode}
          setAuthMode={setAuthMode}
          setAuthError={setAuthError}
          handleEmailAuth={handleEmailAuth}
          handleGoogleLogin={handleGoogleLogin}
          displayName={displayName}
          setDisplayName={setDisplayName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authError={authError}
          loading={loading}
        />
      )}
      {view === 'dashboard' && (
        <DashboardView
          user={user}
          handleLogout={handleLogout}
          startNewProject={startNewProject}
          projects={projects}
          setCurrentProject={setCurrentProject}
          setView={setView}
        />
      )}
      {view === 'create' && (
        <CreateView
          setView={setView}
          chatHistory={chatHistory}
          scriptOptions={scriptOptions}
          selectedScript={selectedScript}
          setSelectedScript={setSelectedScript}
          setScriptOptions={setScriptOptions}
          rawInput={rawInput}
          setRawInput={setRawInput}
          handleSendMessage={handleSendMessage}
          loading={loading}
          generationStep={generationStep}
          errorMsg={errorMsg}
          handleGenerateVideo={handleGenerateVideo}
          handleSuggestionClick={handleSuggestionClick}
          handleSelectScript={handleSelectScript}
          userCredits={user ? user.credits : 0}
        />
      )}
      {view === 'result' && (
        <ResultView
          setView={setView}
          currentProject={currentProject}
          rendering={rendering}
          renderProgress={renderProgress}
          handleFinalizeAndDownload={handleFinalizeAndDownload}
          handleShare={handleShare}
        />
      )}
    </div>
  );
}

export default App;
