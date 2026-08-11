import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, AlertCircle, Send, CheckCircle2, FileText, Calendar, ExternalLink, MessageCircle, Mail, Sparkles, Cloud, Server, ArrowDown } from 'lucide-react';
import { postCommentToNotion, createNotionPage } from '../services/notionService';

export default function ExecutiveFinancials({ credentials, notionCards = [] }) {
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [actionSuccessMap, setActionSuccessMap] = useState({});

  // Exact Cloud Savings Breakdown provided by Diego:
  // - AWS: USD $1,800 / mes ($21,600 / año)
  // - Huawei Cloud: USD $400 / mes ($4,800 / año)
  // - Heroku: USD $40 / mes ($480 / año)
  const cloudSavingsItems = [
    { provider: 'AWS Cloud', monthlyUSD: 1800, annualUSD: 21600, detail: 'Optimización de instancias EC2, EBS y nodos de procesamiento.' },
    { provider: 'Huawei Cloud', monthlyUSD: 400, annualUSD: 4800, detail: 'Reducción de almacenamiento y ancho de banda en CDN.' },
    { provider: 'Heroku Cloud', monthlyUSD: 40, annualUSD: 480, detail: 'Desmantelamiento y auto-stop deDynos nocturnos.' }
  ];

  const totalMonthlyCloudSavings = cloudSavingsItems.reduce((acc, c) => acc + c.monthlyUSD, 0); // USD 2,240 / mes
  const totalAnnualCloudSavings = cloudSavingsItems.reduce((acc, c) => acc + c.annualUSD, 0);   // USD 26,880 / año

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
      project: 'Optimización Completa de Nubes (AWS + Huawei + Heroku)',
      lead: 'Leonard Amaya / Diego Musach',
      amountUSD: totalAnnualCloudSavings,
      status: 'Ahorro Anual Proyectado',
      category: 'Optimización de Costos',
      detail: `AWS (USD 1,800/mes) + Huawei (USD 400/mes) + Heroku (USD 40/mes) = USD 2,240/mes (USD 26,880/año).`,
      notionKeyword: 'heroku'
    }
  ];

  const totalUSD = financialItems.reduce((acc, curr) => acc + curr.amountUSD, 0);
  const pendingBillingUSD = financialItems.filter(i => i.status.includes('Cobro')).reduce((acc, curr) => acc + curr.amountUSD, 0);

  const handleSendWhatsAppAlert = (item) => {
    const message = encodeURIComponent(`Hola ${item.lead}, requerimos actualización urgente de la partida financiera "${item.project}" (USD $${item.amountUSD.toLocaleString()}). Estado actual: ${item.status}. CC: Diego Musach (CTO).`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSendEmailAlert = (item) => {
    const subject = encodeURIComponent(`[ALERTA FINANCIERA CTO] Seguimiento Presupuestario: ${item.project}`);
    const body = encodeURIComponent(`Hola ${item.lead},\n\nTe solicito por favor el reporte actualizado de la partida presupuestaria del proyecto "${item.project}" por un monto de USD $${item.amountUSD.toLocaleString()}.\n\nCategoría: ${item.category}\nEstado: ${item.status}\nDetalle: ${item.detail}\n\nQuedo a la espera de tu confirmación para Notion.\n\nSaludos,\nDiego Paolo Musach\nDirector & Head of Engineering`);
    window.open(`mailto:dmusach@bromteck.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="executive-financials-container">
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign className="text-emerald" size={22} /> 💵 Control Financiero & Presupuestario (USD / ARS)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Auditoría financiera ejecutiva de cobros pendientes y desglose exacto de ahorros cloud (AWS, Huawei Cloud y Heroku).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => setActiveCurrency('USD')}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                background: activeCurrency === 'USD' ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                color: activeCurrency === 'USD' ? '#000' : '#fff',
                fontWeight: 700
              }}
            >
              USD ($)
            </button>
            <button
              className="btn-secondary"
              onClick={() => setActiveCurrency('ARS')}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                background: activeCurrency === 'ARS' ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                color: activeCurrency === 'ARS' ? '#000' : '#fff',
                fontWeight: 700
              }}
            >
              ARS ($ 1,350)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>VOLUMEN TOTAL GESTIONADO</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>
            {activeCurrency === 'USD' ? `USD $${totalUSD.toLocaleString()}` : `ARS $${(totalUSD * 1350).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Proyectos & Ahorros 2026</div>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>COBROS PENDIENTES (EDEMSA)</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>
            {activeCurrency === 'USD' ? `USD $${pendingBillingUSD.toLocaleString()}` : `ARS $${(pendingBillingUSD * 1350).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>10 Alimentadores Mendoza</div>
        </div>

        <div className="card-glass" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>AHORRO ANUAL NUBES</div>
          <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0.2rem 0' }}>
            {activeCurrency === 'USD' ? `USD $${totalAnnualCloudSavings.toLocaleString()} / año` : `ARS $${(totalAnnualCloudSavings * 1350).toLocaleString()} / año`}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>USD $${totalMonthlyCloudSavings.toLocaleString()} / mes</div>
        </div>
      </div>

      {/* CLOUD SAVINGS DETAILED BREAKDOWN (AWS + HUAWEI + HEROKU) */}
      <div className="card-glass" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Cloud className="text-cyan" size={18} /> ☁️ Desglose Exacto de Ahorro Cloud Mensual & Anual
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {cloudSavingsItems.map((c, idx) => (
            <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.94rem', color: '#fff', fontWeight: 700 }}>
                  {c.provider}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 800 }}>
                  USD ${c.monthlyUSD.toLocaleString()} / mes
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.35rem' }}>
                💰 Ahorro Anual: USD ${c.annualUSD.toLocaleString()} / año
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                {c.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINANCIAL ITEMS STREAM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {financialItems.map((item) => (
          <div 
            key={item.id}
            className="card-glass"
            style={{
              padding: '1.1rem 1.3rem',
              borderLeft: '4px solid var(--accent-emerald)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  👤 Responsable: {item.lead}
                </span>
              </div>

              <h4 style={{ fontSize: '0.98rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
                {item.project}
              </h4>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', margin: '0 0 0.45rem 0', lineHeight: '1.4' }}>
                {item.detail}
              </p>

              <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                📍 Estado: {item.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
              <div style={{ fontSize: '1.3rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                {activeCurrency === 'USD' ? `USD $${item.amountUSD.toLocaleString()}` : `ARS $${(item.amountUSD * 1350).toLocaleString()}`}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleSendWhatsAppAlert(item)}
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }}
                  title="Enviar alerta por WhatsApp"
                >
                  <MessageCircle size={12} /> WhatsApp
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleSendEmailAlert(item)}
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  title="Enviar correo de seguimiento"
                >
                  <Mail size={12} /> Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
