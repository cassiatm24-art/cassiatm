import React, { useState } from 'react';
import { X, Copy, Check, Database, Shield, HardDrive, Terminal } from 'lucide-react';
import { generateSupabaseSql } from '../utils/sqlGenerator';

interface SqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlModal: React.FC<SqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'storage' | 'tables'>('all');

  if (!isOpen) return null;

  const fullSql = generateSupabaseSql();

  // Extract storage portion for focused preview
  const storageSection = fullSql.slice(
    fullSql.indexOf('-- 5. CONFIGURAÇÃO DO BUCKET DE ARMAZENAMENTO'),
    fullSql.indexOf('-- 7. POLÍTICAS DE SEGURANÇA NAS TABELAS')
  );

  const tablesSection = fullSql.slice(
    0,
    fullSql.indexOf('-- 5. CONFIGURAÇÃO DO BUCKET DE ARMAZENAMENTO')
  );

  const displayedSql = activeTab === 'storage' ? storageSection : activeTab === 'tables' ? tablesSection : fullSql;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                SQL com Políticas de Armazenamento (Storage RLS)
              </h2>
              <p className="text-xs text-slate-400">
                Script pronto para execução no Supabase SQL Editor: tabelas, realtime e segurança de arquivos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL Completo</span>
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'storage'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Bucket & Políticas Storage</span>
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'tables'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Tabelas & Realtime</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>SQL Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar SQL Completo</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950/90 font-mono text-xs text-slate-200 leading-relaxed">
          <pre className="overflow-x-auto whitespace-pre selection:bg-amber-500/30 selection:text-white">
            <code>{displayedSql}</code>
          </pre>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Inclui RLS para storage.objects, bucket &apos;comandas&apos;, tabelas e triggers</span>
          </div>

          <span className="font-mono text-slate-500">
            PostgreSQL 15+ / Supabase
          </span>
        </div>
      </div>
    </div>
  );
};
