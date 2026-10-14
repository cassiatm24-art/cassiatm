import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Plus } from 'lucide-react';
import { kitchenAudio } from '../utils/audio';

interface KitchenHeaderProps {
  onOpenNewOrder: () => void;
  naFilaCount: number;
  emPreparoCount: number;
  prontoCount: number;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  onOpenNewOrder,
  naFilaCount,
  emPreparoCount,
  prontoCount
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    kitchenAudio.enabled = next;
    setAudioEnabled(next);
    if (next) {
      kitchenAudio.playItemDone();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-3">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 sm:gap-8">
        {/* Zona 1: Brand title, single line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-base">
            K
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
            KDS Pro Cozinha
          </span>
        </div>

        {/* Zona 2: Contadores das 3 frentes + relógio operacional */}
        <div className="hidden md:flex items-center gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Fila:</span>
              <strong className="text-slate-100 font-mono-numbers">{naFilaCount}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Preparo:</span>
              <strong className="text-slate-100 font-mono-numbers">{emPreparoCount}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Prontos:</span>
              <strong className="text-slate-100 font-mono-numbers">{prontoCount}</strong>
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-700">/</span>

          <span className="font-mono-numbers text-slate-400 font-semibold tracking-wider">
            {currentTime}
          </span>
        </div>

        {/* Zona 3: Ações e controles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Som ligado/desligado */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-colors ${
              audioEnabled
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:border-slate-700'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
            title={audioEnabled ? 'Sons de comanda ativados (clique para mutar)' : 'Sons de comanda mutados'}
            aria-label="Alternar som da cozinha"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Modo Tela Cheia */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors"
            title="Tela cheia para monitor de cozinha"
            aria-label="Alternar tela cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Botão Primário: Novo Pedido */}
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>
    </header>
  );
};
