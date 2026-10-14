import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ElapsedTimeBadgeProps {
  createdAt: string;
  startedAt?: string | null;
  readyAt?: string | null;
  status: 'na_fila' | 'em_preparo' | 'pronto' | 'finalizado';
}

export const ElapsedTimeBadge: React.FC<ElapsedTimeBadgeProps> = ({
  createdAt,
  startedAt,
  readyAt,
  status
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const calculateSeconds = () => {
      const now = readyAt ? new Date(readyAt).getTime() : Date.now();
      const referenceTime = new Date(createdAt).getTime();
      const diff = Math.max(0, Math.floor((now - referenceTime) / 1000));
      setElapsedSeconds(diff);
    };

    calculateSeconds();

    // If order is already ready/finalized, freeze timer
    if (status === 'pronto' || status === 'finalizado') {
      return;
    }

    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [createdAt, readyAt, status]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Color urgency threshold based on elapsed time:
  // < 10 mins: normal (emerald)
  // 10 - 18 mins: attention (amber)
  // > 18 mins: urgent / delayed (rose)
  let badgeStyle = 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
  let label = 'Tempo total';

  if (status === 'pronto') {
    badgeStyle = 'text-sky-300 bg-sky-950/50 border-sky-800/60';
    label = 'Concluído em';
  } else if (minutes >= 18) {
    badgeStyle = 'text-rose-300 bg-rose-950/60 border-rose-800 animate-pulse';
    label = 'Atrasado';
  } else if (minutes >= 10) {
    badgeStyle = 'text-amber-300 bg-amber-950/50 border-amber-800/70';
    label = 'Atenção';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border ${badgeStyle}`}
      title={`${label}: ${formattedTime} (${minutes} minutos)`}
    >
      <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span className="font-mono-numbers tracking-tight font-semibold">{formattedTime}</span>
    </div>
  );
};
