import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, AlertCircle, Send, CheckCircle2, FileText, Calendar, ExternalLink, MessageCircle, Mail, Sparkles } from 'lucide-react';
import { postCommentToNotion, createNotionPage } from '../services/notionService';

export default function ExecutiveFinancials({ credentials, notionCards = [] }) {
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [actionSuccessMap, setActionSuccessMap] = useState({});

  const financialItems = [
    {
      id: 'fin-1',
      project: 'EDEMSA - Control de Alimentadores & Pérdidas',
      lead: 'Camilo Uribe / Diego Musach',
      amountUSD: 50000,
      status: 'Cobro Pendiente de Facturación',
      category: 'Facturación / Cliente',
      detail: 'Grilla de 10 alimentadores auditados en Mendoza. Listo para emisión de factura.',
      notionKeyword: 'edemsa'
    },
    {
      id: 'fin-2',
      project: 'Tecsys Brasil - Homologación Certificados FCC y CE',
      lead: 'Camilo Uribe',
      amountUSD: 45000,
      status: 'Presupuesto Presentado / Traspaso a Notion',
      category: 'Licencias / Proveedor',
      detail: 'Cotización oficial por homologación de hardware y migración de planillas Excel.',
      notionKeyword: 'tecsys'
    },
    {
      id: 'fin-3',
      project: 'WIND Telecom - Cluster VMs & Single Sign-On',
      lead: 'Enrique Bevilacqua',
      amountUSD: 35000,
      status: 'En Ejecución / SLA Crítico',
      category: 'Infraestructura / Cliente',
      detail: 'Reinstalación de servidores en VMs y estándar OAuth2 de autenticación.',
      notionKeyword: 'wind'
    },
    {
      id: 'fin-4',
      project: 'Telecable Costa Rica - STB Elebao AOSP & FingerPrint',
      lead: 'Enrique Bevilacqua',
      amountUSD: 25000,
      status: 'Pruebas de Laboratorio / Montage',
      category: 'Hardware / Staging',
      detail: 'Equipos decodificadores en laboratorio para informe de homologación.',
      notionKeyword: 'telecable'
    },
    {
      id: 'fin-5',
      project: 'Desmantelamiento Heroku & Migración CableView',
      lead: 'Leonard Amaya',
      amountUSD: 14400,
      status: 'Ahorro Anual Proyectado',
      category: 'Optimización de Costos',
      detail: 'Apagado de servidores Heroku y consolidación de vistas frontend.',
      notionKeyword: 'heroku'
    },
    {
      id: 'fin-6',
      project: 'Soporte AI BOT Gemini & Reducción de Tickets',
      lead: 'Fabricio Jose Nieva / Joseph Valer',
      amountUSD: 15600,
      status: 'Ahorro Operativo Nivel 1',
      category: 'Inteligencia Artificial',
      detail: 'Reducción del 35% de tickets mediante entrenamiento con capacitaciones filmadas.',
      notionKeyword: 'soporte'
    }
  ];

  const totalUSD = financialItems.reduce((acc, curr) => acc + curr.amountUSD, 0);
  const pendingBillingUSD = financialItems.filter(i => i.status.includes('Cobro')).reduce((acc, curr) => acc + curr.amountUSD, 0);
  const totalSavingsUSD = financialItems.filter(i => i.category.includes('Optimización')).reduce((acc, curr) => acc + curr.amountUSD, 0);

  const handleSendWhatsAppAlert = (item) => {
    const leadPhoneMap = {
      'Camilo Uribe': '5491100000001',
      'Enrique Bevilacqua': '5491100000002',
      'Leonard Amaya': '5491100000003',
      'Fabricio Jose Nieva': '5491100000004'
    };

    const leadFirst = item.lead.split(' ')[0];
    const text = `Hola ${leadFirst}, desde la Dirección CTO te recordamos el hito financiero de "${item.project}" (${item.status}). Monto: USD ${item.amountUSD.toLocaleString()}. Por favor actualizar avance en Notion.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSendEmailAlert = (item) => {
    const subject = encodeURIComponent(`[ALERTA CTO] Hito Financiero: ${item.project}`);
    const body = encodeURIComponent(`Estimado equipo,\n\nRevisión directiva del proyecto "${item.project}".\nEstado: ${item.status}\nMonto involucrado: USD ${item.amountUSD.toLocaleString()}\n\nDetalle: ${item.detail}\n\nPor favor confirmar actualización en Notion API.\n\nAtentamente,\nDiego Paolo Musach\nDirector & Head of Engineering`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDispatchFinancialToNotion = async (item) => {
    setActionSuccessMap(prev => ({ ...prev, [item.id]: 'syncing' }));

    const matchedCard = notionCards.find(c => (c.title || '').toLowerCase().includes(item.notionKeyword));
    if (matchedCard) {
      const commentContent = `[AUDITORÍA FINANCIERA CTO]: ${item.project} • Monto: USD ${item.amountUSD.toLocaleString()} • Estado: ${item.status}`;
      const res = await postCommentToNotion(credentials?.notionToken, matchedCard.notionPageId || matchedCard.id, commentContent);
      if (res.success) {
        setActionSuccessMap(prev => ({ ...prev, [item.id]: 'success' }));
      }
    } else {
      const res = await createNotionPage(credentials?.notionToken, null, {
        title: `[Finanzas CTO] ${item.project} - USD ${item.amountUSD.toLocaleString()}`,
        responsable: item.lead.split('/')[0].trim(),
        status: 'Abierto',
        priority: 'P1 - CRITICA'
      });
      if (res.success) {
        setActionSuccessMap(prev => ({ ...prev, [item.id]: 'success' }));
      }
    }
  };

  return (
    <div className="executive-financials-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign className="text-emerald" size={22} /> 📊 Control Financiero & Presupuestos de Ingeniería
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Consolidado de montos negociados, cobranzas pendientes, licencias y ahorros de infraestructura.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveCurrency('USD')}
              className={`btn-secondary ${activeCurrency === 'USD' ? 'active' : ''}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              💵 Dólares (USD)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            VOLUMEN TOTAL GESTIONADO
          </span>
          <div style={{ fontSize: '1.6rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>
            USD ${totalUSD.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.2rem', display: 'block' }}>
            6 proyectos estratégicos directivos
          </span>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            COBROS / FACTURACIÓN PENDIENTE
          </span>
          <div style={{ fontSize: '1.6rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>
            USD ${pendingBillingUSD.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.2rem', display: 'block' }}>
            EDEMSA & Cotizaciones homologadas
          </span>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-purple)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            AHORRO ANUAL EN NUBE / HEROKU
          </span>
          <div style={{ fontSize: '1.6rem', color: 'var(--accent-purple)', fontWeight: 800 }}>
            USD ${totalSavingsUSD.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginTop: '0.2rem', display: 'block' }}>
            Optimización de entornos de staging
          </span>
        </div>
      </div>

      {/* Main Financial Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {financialItems.map((item) => {
          const status = actionSuccessMap[item.id];
          return (
            <div 
              key={item.id}
              className="card-glass"
              style={{
                padding: '1rem 1.2rem',
                borderLeft: '4px solid var(--accent-emerald)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span className="tag critical" style={{ fontSize: '0.64rem', padding: '0.1rem 0.4rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald)' }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    👤 {item.lead}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.96rem', color: '#fff', margin: '0 0 0.3rem 0', fontWeight: 700 }}>
                  {item.project}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.35rem 0', lineHeight: '1.35' }}>
                  {item.detail}
                </p>

                <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  📌 Estado Financiero: {item.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ fontSize: '1.3rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                  USD ${item.amountUSD.toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleSendWhatsAppAlert(item)}
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Enviar recordatorio por WhatsApp 💬"
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => handleSendEmailAlert(item)}
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Enviar notificación por Email ✉️"
                  >
                    <Mail size={13} /> Email
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleDispatchFinancialToNotion(item)}
                    disabled={status === 'success' || status === 'syncing'}
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))', whiteSpace: 'nowrap' }}
                  >
                    {status === 'syncing' ? (
                      'Sincronizando...'
                    ) : status === 'success' ? (
                      '¡Ingestado a Notion!'
                    ) : (
                      <>
                        <Send size={12} /> Derivar a Notion
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
