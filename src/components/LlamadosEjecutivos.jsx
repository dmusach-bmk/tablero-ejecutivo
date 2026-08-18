import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, Search, Calendar, User, Building, FileText, CheckCircle2 } from 'lucide-react';
import GlobalAiInbox from './GlobalAiInbox';

export default function LlamadosEjecutivos({ credentials }) {
  const [llamadas, setLlamadas] = useState(() => {
    const saved = localStorage.getItem('dm_llamados_ejecutivos');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default call (mock)
    return [
      {
        id: 'call-1',
        fecha: new Date().toISOString().slice(0, 10),
        cliente: 'ENEE',
        contacto: 'Luciano Galasso',
        motivo: 'Seguimiento de Proyecto',
        resumen: 'Pendiente de registrar el detalle de la conversación.',
        acuerdos: ''
      }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newCall, setNewCall] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    cliente: '',
    contacto: '',
    motivo: '',
    resumen: '',
    acuerdos: ''
  });

  useEffect(() => {
    localStorage.setItem('dm_llamados_ejecutivos', JSON.stringify(llamadas));
  }, [llamadas]);

  const handleSave = () => {
    if (!newCall.cliente || !newCall.contacto) return;
    setLlamadas([
      { id: `call-${Date.now()}`, ...newCall },
      ...llamadas
    ]);
    setIsAdding(false);
    setNewCall({
      fecha: new Date().toISOString().slice(0, 10),
      cliente: '',
      contacto: '',
      motivo: '',
      resumen: '',
      acuerdos: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <PhoneCall className="text-blue-400" />
          Registro de Llamados Ejecutivos
        </h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', padding: '0.5rem 1rem' }}
        >
          {isAdding ? 'Cancelar' : <><Plus size={16} /> Registrar Llamada</>}
        </button>
      </div>

      {isAdding && (
        <div className="card-glass mb-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-white mb-4">Nueva Llamada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha</label>
              <input type="date" value={newCall.fecha} onChange={e => setNewCall({...newCall, fecha: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Empresa / Cliente</label>
              <input type="text" placeholder="Ej: ENEE" value={newCall.cliente} onChange={e => setNewCall({...newCall, cliente: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Persona Contactada</label>
              <input type="text" placeholder="Ej: Luciano Galasso" value={newCall.contacto} onChange={e => setNewCall({...newCall, contacto: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Motivo Principal</label>
              <input type="text" placeholder="Ej: Renovación de contrato" value={newCall.motivo} onChange={e => setNewCall({...newCall, motivo: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Resumen de la Conversación</label>
              <textarea rows={3} placeholder="Detalles clave hablados..." value={newCall.resumen} onChange={e => setNewCall({...newCall, resumen: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Acuerdos / Next Steps</label>
              <textarea rows={2} placeholder="Qué se definió hacer..." value={newCall.acuerdos} onChange={e => setNewCall({...newCall, acuerdos: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"></textarea>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary" style={{ background: 'var(--accent-emerald)', padding: '0.5rem 1.5rem' }}>Guardar Llamada</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {llamadas.map(call => (
          <div key={call.id} className="card-glass border border-slate-700/50 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building size={16} className="text-cyan-400" /> {call.cliente}
                </h3>
                <div className="text-sm text-gray-400 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><User size={14} /> {call.contacto}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {call.fecha}</span>
                </div>
              </div>
              <span className="tag bg-slate-800 text-gray-300 border border-slate-700">{call.motivo}</span>
            </div>
            
            {call.resumen && (
              <div className="mt-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText size={12}/> Resumen</h4>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{call.resumen}</p>
              </div>
            )}
            
            {call.acuerdos && (
              <div className="mt-3 bg-emerald-900/10 p-3 rounded-lg border border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Acuerdos</h4>
                <p className="text-sm text-emerald-100/90 whitespace-pre-wrap">{call.acuerdos}</p>
              </div>
            )}
          </div>
        ))}
        {llamadas.length === 0 && (
          <div className="text-center py-10 text-gray-500 italic">No hay llamadas registradas aún.</div>
        )}
      </div>

      <GlobalAiInbox sectionName="Llamados Ejecutivos" credentials={credentials} />
    </div>
  );
}
