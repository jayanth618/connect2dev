import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Mail, Lock, User as UserIcon, Code2, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, demoLogin, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, username, fullName);
      }
      onClose();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await demoLogin(userId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Connect<span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">2Dev</span></h2>
            <p className="text-xs text-zinc-400">Engineering Social Network</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-xl mb-6 border border-zinc-800/80">
          <button
            onClick={() => {
              setMode('login');
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              clearError();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Sarah Jenkins"
                icon={<UserIcon className="w-4 h-4" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Username"
                placeholder="e.g. sarah_dev"
                icon={<Code2 className="w-4 h-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="developer@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            {mode === 'login' ? 'Sign In to Connect2Dev' : 'Create Developer Profile'}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Or Quick Login As Demo Peer
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDemoSelect('usr_sarah')}
            disabled={isSubmitting}
            className="flex items-center gap-2 p-2 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 rounded-xl transition-all text-left group"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Sarah"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 truncate">Sarah J.</p>
              <p className="text-[10px] text-zinc-500 truncate">Lead Architect</p>
            </div>
          </button>

          <button
            onClick={() => handleDemoSelect('usr_marcus')}
            disabled={isSubmitting}
            className="flex items-center gap-2 p-2 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 rounded-xl transition-all text-left group"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Marcus"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 truncate">Marcus V.</p>
              <p className="text-[10px] text-zinc-500 truncate">Senior Full Stack</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
