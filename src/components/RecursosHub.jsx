import React, { useState, useEffect } from 'react';
import { Folder, Video, Zap, FileText, FileSpreadsheet, ExternalLink, HardDrive, Compass, ArrowRight, ShieldCheck, Download, Search, RefreshCw } from 'lucide-react';
import { fetchDriveFolderFiles } from '../services/googleWorkspaceService';

export default function RecursosHub({ credentials }) {
  const [activeSubMenu, setActiveSubMenu] = useState('video');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [videoFiles, setVideoFiles] = useState([
    {
      name: 'Manual_STB_Elebao_AOSP_Telecable.pdf',
      type: 'pdf',
      size: '4.8 MB',
      date: '10/08/2026',
      desc: 'Manual oficial de instalación y configuración de decodificadores STB Elebao AOSP para Telecable Costa Rica.',
      url: 'https://drive.google.com/drive/u/1/folders/19ZFurar61WyGtaImaDLofK1f3jIGxFjS'
    },
    {
      name: 'FingerPrint_Watermark_HLS_DASH_Integration.pdf',
      type: 'pdf',
      size: '2.4 MB',
      date: '08/08/2026',
      desc: 'Guía de integración de marca de agua digital dinámica sobre transmisiones HLS y DASH con chips Montage.',
      url: 'https://drive.google.com/drive/u/1/folders/19ZFurar61WyGtaImaDLofK1f3jIGxFjS'
    },
    {
      name: 'Roadmap_Video_Streaming_Bromteck_Q3_Q4.xlsx',
      type: 'xlsx',
      size: '1.2 MB',
      date: '05/08/2026',
      desc: 'Planilla de hitos, responsables y fechas límite para la migración de CableView y apagado de Heroku.',
      url: 'https://drive.google.com/drive/u/1/folders/19ZFurar61WyGtaImaDLofK1f3jIGxFjS'
    },
    {
      name: 'Especificaciones_Montage_Chips_AOSP.pdf',
      type: 'pdf',
      size: '8.1 MB',
      date: '28/07/2026',
      desc: 'Fichas técnicas y datasheets de microprocesadores Montage utilizados en decodificadores.',
      url: 'https://drive.google.com/drive/u/1/folders/19ZFurar61WyGtaImaDLofK1f3jIGxFjS'
    }
  ]);

  const [energiaFiles, setEnergiaFiles] = useState([
    {
      name: 'Control_Alimentadores_EDEMSA_2026.xlsx',
      type: 'xlsx',
      size: '12.4 MB',
      date: '11/08/2026',
      desc: 'Reporte técnico de pérdidas de energía en BT en los 10 alimentadores clave en Mendoza Capital con Sergio Palmucci.',
      url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit?gid=1845085710#gid=1845085710'
    },
    {
      name: 'Relevamiento_2300_Gabinetes_Arg_Col.xlsx',
      type: 'xlsx',
      size: '8.7 MB',
      date: '03/08/2026',
      desc: 'Planilla consolidada de cotizaciones y relevamiento operativo de 2,300 gabinetes de fibra de vidrio en Argentina y Colombia.',
      url: 'https://docs.google.com/spreadsheets/d/1wYtI9vmRuu6wWlIlfk7RdH-ElbcZ2QSjDgVA5gJEdGRw/edit'
    },
    {
      name: 'Certificaciones_FCC_CE_Tecsys_Brasil.docx',
      type: 'docx',
      size: '1.9 MB',
      date: '02/08/2026',
      desc: 'Detalle de costos de USD 45,000 en certificaciones FCC y CE solicitadas por Camilo Uribe.',
      url: 'https://drive.google.com/drive/u/1/folders/1MeHLfES27oXZgEZEQHzQXkWJ6rS2CwpZ'
    },
    {
      name: 'Auditoria_Tecnica_BT_Sergio_Palmucci.pdf',
      type: 'pdf',
      size: '3.1 MB',
      date: '25/07/2026',
      desc: 'Minuta técnica firmada con Zuin, Nicolás y Palmucci validando los 10 alimentadores.',
      url: 'https://drive.google.com/drive/u/1/folders/1MeHLfES27oXZgEZEQHzQXkWJ6rS2CwpZ'
    }
  ]);

  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState(null);

  const googleToken = credentials?.googleAccessToken || localStorage.getItem('dm_google_oauth_token') || '';

  const handleFetchLiveFolderFiles = async () => {
    if (!googleToken) return;
    setIsLoadingDrive(true);
    setDriveError(null);

    // Fetch Video Folder
    const resVideo = await fetchDriveFolderFiles(googleToken, '19ZFurar61WyGtaImaDLofK1f3jIGxFjS');
    if (resVideo.success && resVideo.files.length > 0) {
      setVideoFiles(resVideo.files);
    } else if (resVideo.error) {
      setDriveError(resVideo.error);
    }

    // Fetch Energia Folder
    const resEnergia = await fetchDriveFolderFiles(googleToken, '1MeHLfES27oXZgEZEQHzQXkWJ6rS2CwpZ');
    if (resEnergia.success && resEnergia.files.length > 0) {
      setEnergiaFiles(resEnergia.files);
    }

    setIsLoadingDrive(false);
  };

  useEffect(() => {
    if (googleToken) {
      handleFetchLiveFolderFiles();
    }
  }, [googleToken]);

  const resourcesData = {
    video: {
      title: '🎥 Recursos de Video & TV',
      description: 'Documentación técnica, manuales de STB Elebao AOSP, marcas de agua digitales FingerPrint y roadmaps de streaming.',
      driveUrl: 'https://drive.google.com/drive/u/1/folders/19ZFurar61WyGtaImaDLofK1f3jIGxFjS',
      files: videoFiles
    },
    energia: {
      title: '⚡ Recursos de Energía & Pérdidas',
      description: 'Auditorías de pérdidas en baja tensión (BT), relevamiento de gabinetes de fibra de vidrio y certificaciones Tecsys.',
      driveUrl: 'https://drive.google.com/drive/u/1/folders/1MeHLfES27oXZgEZEQHzQXkWJ6rS2CwpZ',
      files: energiaFiles
    }
  };

  const currentCategory = resourcesData[activeSubMenu];

  const filteredFiles = currentCategory.files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="recursos-container" style={{ padding: '1.5rem', minHeight: '80vh' }}>
      
      {/* Header Banner */}
      <div className="card-glass" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.95))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Folder className="text-cyan" size={22} /> 📂 Biblioteca Directiva de Recursos & Archivos
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Repositorio corporativo de Google Drive y planillas técnicas de Video (STB) y Energía (EDEMSA).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="status-badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--accent-emerald)' }}>
              <ShieldCheck size={13} /> Drive Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        
        {/* Left Submenu Navigation Panel */}
        <div className="card-glass" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.86rem', color: 'var(--accent-cyan)', margin: '0 0 0.5rem 0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🗂️ Sub-Menús
          </h3>
          
          <button
            onClick={() => { setActiveSubMenu('video'); setSearchQuery(''); }}
            className={`nav-tab-btn ${activeSubMenu === 'video' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              background: activeSubMenu === 'video' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(0,0,0,0.3)',
              border: activeSubMenu === 'video' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Video size={16} className={activeSubMenu === 'video' ? 'text-cyan' : ''} />
            <span>🎥 Video y STB</span>
          </button>

          <button
            onClick={() => { setActiveSubMenu('energia'); setSearchQuery(''); }}
            className={`nav-tab-btn ${activeSubMenu === 'energia' ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              background: activeSubMenu === 'energia' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.3)',
              border: activeSubMenu === 'energia' ? '1.5px solid var(--accent-orange)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Zap size={16} className={activeSubMenu === 'energia' ? 'text-orange' : ''} />
            <span>⚡ Energía y Pérdidas</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Active Category Header Card */}
          <div className="card-glass" style={{ padding: '1.25rem', borderLeft: `4px solid ${activeSubMenu === 'video' ? 'var(--accent-cyan)' : 'var(--accent-orange)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>{currentCategory.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '680px' }}>
                  {currentCategory.description}
                </p>
              </div>

              <a
                href={currentCategory.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: activeSubMenu === 'video' ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))'
                }}
              >
                <HardDrive size={14} /> Abrir Carpeta en Google Drive <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Search bar inside files */}
          <div className="card-glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '18px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Buscar archivos en ${activeSubMenu === 'video' ? 'Video' : 'Energía'}...`}
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', fontSize: '0.82rem', height: '32px' }}
            />
          </div>

          {/* Files List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, idx) => {
                const Icon = file.type === 'xlsx' ? FileSpreadsheet : FileText;
                const iconColor = file.type === 'xlsx' ? 'text-emerald' : 'text-cyan';

                return (
                  <div
                    key={idx}
                    className="card-glass"
                    style={{
                      padding: '1.1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon className={iconColor} size={24} />
                      </div>

                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                          {file.name}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.4rem 0', lineHeight: '1.4' }}>
                          {file.desc}
                        </p>
                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>📦 Tamaño: <strong>{file.size}</strong></span>
                          <span>•</span>
                          <span>📅 Modificado: <strong>{file.date}</strong></span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        padding: '0.45rem 0.8rem',
                        fontSize: '0.74rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span>Abrir Archivo</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="card-glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                🔍 No se encontraron archivos que coincidan con "{searchQuery}".
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
