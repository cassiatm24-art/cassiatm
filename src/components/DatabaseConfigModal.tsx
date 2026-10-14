import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Trash2, Key, Globe, Copy, Check, Database, Sparkles, ExternalLink } from 'lucide-react';
import { supabaseService, ConnectionTestResult } from '../services/supabaseService';
import { generateSupabaseSql } from '../utils/sqlGenerator';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
  onOpenSqlModal?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onOpenSqlModal
}) => {
  const currentConfig = supabaseService.getConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      const sql = generateSupabaseSql();
      await navigator.clipboard.writeText(sql);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveAndTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Preencha a URL do projeto e a Chave Anon para conectar.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await supabaseService.testConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      supabaseService.saveConfig(url, anonKey);
      onConfigSaved();
    }
  };

  const handleSeedOrders = async () => {
    setSeeding(true);
    const success = await supabaseService.seedInitialOrdersToSupabase();
    setSeeding(false);
    if (success) {
      setSeedSuccess(true);
      onConfigSaved();
      setTimeout(() => {
        setSeedSuccess(false);
        onClose();
      }, 1500);
    }
  };

  const handleDisconnect = () => {
    setUrl('');
    setAnonKey('');
    supabaseService.saveConfig('', '');
    onConfigSaved();
    setTestResult({
      success: true,
      message: 'Desconectado do Supabase. Operando em modo de cache local ultrarrápido.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Conectar com o Supabase</span>
                {supabaseService.isConnected() && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ativo
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Sincronize pedidos em tempo real com seu projeto PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Guia Passo a Passo Rápido */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              Como conectar em 2 passos simples:
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 font-bold flex items-center justify-center shrink-0 text-amber-300 text-[11px]">
                  1
                </span>
                <div className="flex-1">
                  <p>
                    Copie o script SQL (tabelas, realtime e políticas de armazenamento RLS) e execute no <strong>SQL Editor</strong> do seu painel Supabase.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-colors"
                    >
                      {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{sqlCopied ? 'SQL Copiado com Sucesso!' : 'Copiar Script SQL Completo'}</span>
                    </button>
                    {onOpenSqlModal && (
                      <button
                        type="button"
                        onClick={onOpenSqlModal}
                        className="text-slate-400 hover:text-slate-200 underline text-xs"
                      >
                        Visualizar SQL
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 font-bold flex items-center justify-center shrink-0 text-amber-300 text-[11px]">
                  2
                </span>
                <div>
                  <p>
                    Cole abaixo a <strong>URL do Projeto</strong> e a <strong>Chave Anon (public)</strong> encontradas em seu projeto em:
                  </p>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Project Settings &gt; API &gt; Project URL &amp; Project API keys (anon public)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>URL do Projeto Supabase</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">https://xyz.supabase.co</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chave Pública Anon (API Key)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">anon public</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Test feedback banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.success ? 'Conexão Estabelecida!' : 'Atenção na Conexão'}</p>
                <p className="leading-relaxed opacity-90">{testResult.message}</p>
                {testResult.success && testResult.count === 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSeedOrders}
                      disabled={seeding || seedSuccess}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{seeding ? 'Inserindo...' : seedSuccess ? 'Pedidos Inseridos!' : 'Inserir Pedidos de Teste no Supabase'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Desconectar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleSaveAndTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testando Conexão...' : 'Testar e Salvar Conexão'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
