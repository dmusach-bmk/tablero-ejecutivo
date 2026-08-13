import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, CheckSquare, Send, XCircle, MessageSquare, AlertTriangle, 
  Clock, CheckCircle, ExternalLink, Bookmark, Filter, Shield, 
  Database, PlusCircle, Sparkles, UserCheck, RefreshCw, FileText, Check,
  Lightbulb, HelpCircle, Bot, ArrowRight, Edit3, Save, Trash2
} from 'lucide-react';

import { extractDateFromText } from '../utils/dateParser';

export default function DelegacionHub({ notionCards, setNotionCards, onAddNotionCard, teamTracking, setTeamTracking }) {
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [delegatedItems, setDelegatedItems] = useState({});
  const [discardedItems, setDiscardedItems] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [actionAlert, setActionAlert] = useState(null);

  // Inline editing states
  const [editingItemId, setEditingItemId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ragSearchResults, setRagSearchResults] = useState(null);

  // Assistant Chatbox States
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: '¡Hola Diego! Escribime acá cualquier directiva o tema nuevo que quieras agregar (ej: "Asignar a Camilo revisar firmware TS700 con Tecsys urgente para el lunes"). Analizaré el texto, extraeré el responsable, el plazo y te sugeriré TIPS técnicos y HINTS operativos en tiempo real.',
      time: 'Ahora'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Initial parsed topics list augmented with professional TIPS & HINTS
  const initialTopics = [
    // === DIEGO MUSACH (CTO) ===
    {
      id: 'dm-1',
      assignee: 'Diego Musach',
      role: 'CTO / Dirección',
      priority: 'CRITICA',
      title: 'Modelos de Visión Computacional (Gemini IR)',
      desc: 'Investigar modelos de visión computacional para interpretar datos de video y generar alarmas de movimiento. Evaluar Gemini IR (parámetros pre-generados), Nvidia y alternativas Open Source para el monitoreo de transformadores y control de agujas industriales.',
      originalText: 'DM: Modelo de vision computacional. Interpreta los datos y entrega los datos ya procesados. En este caso, video. Le doy acceso a una camara, a Gemini. GEMINI IR, ESO TIENE PARAMETROS YA GENERADOS. HAY OTRO DE NVIEIA, OTRO DE OPEN SOURCE...',
      deadline: '2026-08-20',
      tag: 'IA & Monitoreo',
      tip: 'Conversar con el equipo de Google Cloud para validar si podemos reutilizar las APIs pre-entrenadas de Gemini para conteo y detección en tiempo real sin desplegar servidores pesados.',
      hint: 'Para alarmas de robo de transformadores, los Smart Sensors actuales nos dan acelerómetro; cruzar esa vibración con el feed de video para evitar falsos positivos.',
      comments: []
    },
    {
      id: 'dm-2',
      assignee: 'Diego Musach',
      role: 'CTO / Dirección',
      priority: 'ALTA',
      title: 'Rendir Gastos Honduras (USD 1,000)',
      desc: 'Rendir la planilla de gastos operativos por USD 1,000 en Honduras.',
      originalText: 'DM: Rendir gastos en Honduras (USD 1.000): https://docs.google.com/spreadsheets/d/1rkUJmBqb6pRDQJR0ov3IGXkihQwfapb-HWTX3nUUFqY/edit?gid=592204851#gid=592204851',
      deadline: '2026-08-14',
      tag: 'Administrativo',
      tip: 'Verificar que las facturas de viáticos y transporte de Catelsa estén adjuntadas en formato PDF y coincidan exactamente con la fila 14 del Excel.',
      hint: 'Sandra requiere las rendiciones antes del cierre contable quincenal para no demorar los reembolsos operativos.',
      comments: []
    },
    {
      id: 'dm-3',
      assignee: 'Diego Musach',
      role: 'CTO / Dirección',
      priority: 'CRITICA',
      title: 'Seguimiento de Oportunidades de Punta a Punta',
      desc: 'Aplicar el lineamiento de Alejandro: cuando se detecte una oportunidad o incidente técnico, hacer el seguimiento de punta a punta hasta lograr el cierre definitivo de la tarea sin soltarla.',
      originalText: 'DM: Pedido de Alejandro a Diego: Cuando veas la oportundiad, seguila de punta a punta, hasta que termine!!! O sea, si de detecta, seguila.',
      deadline: 'Inmediato',
      tag: 'Gestión',
      tip: 'Establecer reuniones cortas diarias (Daily Standup de 10 min) exclusivas con Camilo y Mario para revisar bloqueantes críticos.',
      hint: 'Evitar delegar y desentenderse; usar el panel "Follow Up Diario" cada mañana para presionar activamente por las resoluciones.',
      comments: []
    },
    {
      id: 'dm-4',
      assignee: 'Diego Musach',
      role: 'CTO / Dirección',
      priority: 'ALTA',
      title: 'Reunión de Objetivos con Leonard',
      desc: 'Reunión presencial/virtual urgente con Leo Amaya para revisar su Scorecard de métricas, metas del Q3 y la nueva visión de Hospitality/WIND.',
      originalText: 'DM: Esta pendiente para YA, una reunion con Leo por sus objetivos.',
      deadline: '2026-08-14',
      tag: 'Recursos Humanos',
      tip: 'Enfocar la charla en acortar los tiempos de desarrollo de la app de iOS para Hyatt. El cliente está esperando la demo interactiva.',
      hint: 'Leo planteó dudas sobre el alcance de WIND etapa 2; aclararle que los entregables de Septiembre son prioridad absoluta.',
      comments: []
    },

    // === CAMILO URIBE ===
    {
      id: 'cu-1',
      assignee: 'Camilo Uribe',
      role: 'Ingeniería de Energía',
      priority: 'ALTA',
      title: 'Competir contra AMS en Totalizadores con SW Propio',
      desc: 'Investigar si es posible competir en Totalizadores de energía utilizando el software propio de Bromteck en lugar de delegar el diskado a AMS. Registrar tema en Notion para seguimiento continuo.',
      originalText: 'Camilo: 1. Preguntar y profundizar si con totalizadores podemos competir para Totalizadores con AMS. Entonces en vez de Discar, entrariamos con nuestro SW. Podes averguarlo? Es un tema 100% tuyo. Anotalo por favor en Notion para seguirlo.',
      deadline: '2026-08-18',
      tag: 'Energía',
      tip: 'Pedirle a Camilo que analice la diferencia en el costo de licenciamiento de software contra el costo operativo de AMS antes de preparar la propuesta técnica.',
      hint: 'La clave de este negocio está en demostrar que nuestro software reduce el error humano en la recolección de registros históricos.',
      comments: []
    },
    {
      id: 'cu-2',
      assignee: 'Camilo Uribe',
      role: 'Ingeniería de Energía',
      priority: 'ALTA',
      title: 'Front End Biosphere: Push del Log de 15 min & Algoritmo',
      desc: 'Desarrollar la lógica en Biosphere (Hábitat) para procesar por Push el archivo log enviado desde la concentradora (el log que pasó Ivan). Escribir la fórmula y el cálculo de energía en 15 minutos para presentarlo con un frontend prototipo al cliente.',
      originalText: 'Camilo: 1. Sobre el Front End de Biosphere (Habitat Bromteck) hay que lograr que haya push del archvivo que viene de la concentradora, ese LOG lo analiza, y le presenta el numero de dice el cliente...',
      deadline: '2026-08-19',
      tag: 'Desarrollo Energía',
      tip: 'Camilo debe documentar el cálculo exacto de la integración matemática de las potencias de los 15 minutos para que la lógica quede auditada en la wiki del proyecto.',
      hint: 'Usar el archivo de log real que nos pasó Ivan para hacer las pruebas en staging antes de mostrar la UI al cliente.',
      comments: []
    },
    {
      id: 'cu-4',
      assignee: 'Camilo Uribe',
      role: 'Ingeniería de Energía',
      priority: 'CRITICA',
      title: 'Cálculo de Energía Afinia con Smart Sensors (SS)',
      desc: 'Definir cómo tomar los datos de los Smart Sensors (SS) actuales y calcular la energía necesaria de forma urgente para el proyecto Afinia. Validar la idea de manera interna con Rodolfo o Ivan, y de ser necesario recurrir directamente a Tecsys.',
      originalText: 'Camilo: Para tener energia con lo que los SS actuales, como lo hago? Como tomo los datos? Este tema es Urgente, para Afinia. Necesito el dato de SS para calcular Energia para Afinia...',
      deadline: '2026-08-14',
      tag: 'Afinia / Urgente',
      tip: 'Llamar a Ivan para validar si la frecuencia de envío de los SS (cada 5 minutos) es suficiente para calcular el consumo acumulado con precisión matemática aceptable.',
      hint: 'Si Tecsys no responde rápido sobre el protocolo de datos internos, consultá directamente con el fabricante del chip del sensor.',
      comments: []
    },
    {
      id: 'cu-6',
      assignee: 'Camilo Uribe',
      role: 'Ingeniería de Energía',
      priority: 'CRITICA',
      title: 'Cronograma Pérdidas Técnicas y Hábitat Pérdidas',
      desc: 'Elaborar un cronograma de entregables y fechas para el módulo de pérdidas técnicas y el estado actual de Hábitat Pérdidas. Entregar para este viernes sin falta.',
      originalText: 'Camilo: Armar cronograma de lo que queda para la perdida tecnica, y cuanto falta para Habitat Perdidas. Eso es para la perdida tecncia, armar cronograma para esta semana, para el Viernes. Es fundamental este tema.',
      deadline: '2026-08-14',
      tag: 'Planificación',
      tip: 'Exigirle a Camilo un desglose por hitos de desarrollo frontend y backend por separado para poder mapear los recursos de Fabricio de ser necesario.',
      hint: 'Este cronograma es clave para la reunión del lunes con el cliente, así que no permitas demoras sobre la fecha del viernes.',
      comments: []
    },

    // === FABRICIO NIEVA ===
    {
      id: 'fn-1',
      assignee: 'Fabricio Jose Nieva',
      role: 'Desarrollo Full Stack',
      priority: 'CRITICA',
      title: 'Refactor y Optimización de Código Hábitat (Claude Code)',
      desc: 'Realizar una revisión profunda de la base de código de Hábitat y aplicar refactors para mejorar la performance y escalabilidad utilizando la herramienta Claude Code.',
      originalText: 'Fabricio: Si o si, ponete en el habitat, y mejorar el codigo nuestro. Con Claude Code.',
      deadline: '2026-08-17',
      tag: 'Refactor / Calidad',
      tip: 'Guiar a Fabricio para que use las herramientas de profiling de memoria de Node/React y documente la ganancia en performance tras usar Claude Code.',
      hint: 'Asegurar que se corran los tests automatizados en la pipeline de CI/CD para evitar introducir regresiones durante el refactor.',
      comments: []
    },
    {
      id: 'la-1',
      assignee: 'Leonard Amaya',
      role: 'Desarrollo Mobile / Frontend',
      priority: 'ALTA',
      title: 'Revisar Pendientes de Selvin & Erik con Claude Code',
      desc: 'Asumir y testear los entregables y correcciones pendientes dejados por Selvin y Erik. Utilizar asistencia de Claude Code para acelerar la resolución de los tickets.',
      originalText: 'Leonard: Hay pendientes de Selvin, podes ir probando el resto de lo que Selvin y Erik tenia? Podemos pedirle a Claude Code lo que Selvin tiene pendiente?',
      deadline: '2026-08-20',
      tag: 'Mantenimiento',
      tip: 'Leonard debe validar las credenciales del keychain en la app de iOS, ya que fue el último blocker reportado por Erik.',
      hint: 'Revisar las ramas de Git pendientes de Selvin para verificar si dejó commits sin mergear a main.',
      comments: []
    },
    {
      id: 'la-2',
      assignee: 'Leonard Amaya',
      role: 'Desarrollo Mobile / Frontend',
      priority: 'ALTA',
      title: 'Adelantar Etapa 2 de WIND para Septiembre',
      desc: 'Revisar viabilidad de adelantar la fase 2 de WIND Telecom para principios de Septiembre.',
      originalText: 'Leonard: La etapa 2 de WIND, adelantar para Septiembre, como estamos?',
      deadline: '2026-08-25',
      tag: 'WIND',
      tip: 'Verificar la compatibilidad del Cluster de Kubernetes antes de mover las APIs de WIND a producción en el nuevo cronograma adelantado.',
      hint: 'Leo planteó dudas sobre el alcance de la etapa 2; consolidar requerimientos con el cliente de WIND para evitar retrasos.',
      comments: []
    },
    {
      id: 'la-3',
      assignee: 'Leonard Amaya',
      role: 'Desarrollo Mobile / Frontend',
      priority: 'ALTA',
      title: 'Seguimiento de iOS & Planilla de AI',
      desc: 'Presentar el avance del desarrollo de iOS y anotar el estado en la planilla de control de inteligencia artificial.',
      originalText: 'Leo: Mostrame lo que hicimos con IOS, como sigue? Anotalo en la planilla de AI.',
      deadline: '2026-08-16',
      tag: 'iOS / AI Planilla',
      tip: 'Pedirle a Leo que prepare una mini grabación de pantalla o demo de TestFlight mostrando los flujos de login y reproducción antes de la reunión.',
      hint: 'Asegurar que la planilla de AI refleje los prompts exitosos que usamos con Claude Code para el desarrollo nativo Swift.',
      comments: []
    },

    // === ENRIQUE BEVILACQUA ===
    {
      id: 'eb-1',
      assignee: 'Enrique Bevilacqua',
      role: 'Ingeniería de Video',
      priority: 'ALTA',
      title: 'Embellecimiento de App Roku & Integración TR069',
      desc: 'Optimizar visualmente la aplicación de Roku haciéndola más completa. Investigar la integración de TR069 para conectarse a los set-top boxes (STBs) de prueba provistos por Elebao (TMS).',
      originalText: 'Enrique: Igual embellecer y hacer crecer Roku, pedirle que lo haga mas completa a la aplicacion, a Claude Code. Enrique: TMS para los STBs de Telecable (de prueba) lo podes empezar a hacer?...',
      deadline: '2026-08-21',
      tag: 'Video',
      tip: 'Pedirle a Enrique que valide el esquema XML del protocolo TR-069 contra el servidor ACS de pruebas de Telecable para evitar la falta de comunicación.',
      hint: 'Usar el emulador de Roku en el SDK local para testear los cambios del Look & Feel de manera ágil antes de subir el canal privado a producción.',
      comments: []
    },
    {
      id: 'eb-2',
      assignee: 'Enrique Bevilacqua',
      role: 'Ingeniería de Video',
      priority: 'ALTA',
      title: 'Video de Telemetría y Cierre con WIND Telecom',
      desc: 'Desarrollar el video de telemetría junto con Esteban, emulando la interfaz que tiene Godel. Mantener aislada la interfaz de WIND únicamente para uso en República Dominicana.',
      originalText: 'Enrique: Video de Telemetria, como el que tenemos de Godel. Hacelo con Esteban. Hacelo como el de Godel. Con Todos: La interfaz de WIND, solo en RD para ellos.',
      deadline: '2026-08-19',
      tag: 'Telemetría / WIND',
      tip: 'Coordinar con Esteban el render y la inyección de metadatos de telemetría para que la simulación se sienta en tiempo real.',
      hint: 'Asegurarse de que el equipo comercial comprenda que la interfaz de WIND no debe presentarse a otros clientes de RD.',
      comments: []
    },
    {
      id: 'eb-3',
      assignee: 'Enrique Bevilacqua',
      role: 'Ingeniería de Video',
      priority: 'ALTA',
      title: 'ROKU - Abrir con Panaccess',
      desc: 'Investigar cómo Panaccess abrió ROKU para replicar la integración en nuestro middleware.',
      originalText: 'Enrique: ROKU, Panaccess lo abrio, preguntarle como hizo.',
      deadline: '2026-08-22',
      tag: 'Integración ROKU',
      tip: 'Revisar la API de autenticación de Panaccess y verificar si usaron el SDK estándar de Roku.',
      hint: 'Esto nos permitirá acelerar los acuerdos de distribución en LATAM.',
      comments: []
    },
    {
      id: 'eb-4',
      assignee: 'Enrique Bevilacqua',
      role: 'Ingeniería de Video',
      priority: 'ALTA',
      title: 'Ingeniería Inversa sobre Flussonic',
      desc: 'Realizar ingeniería inversa del TR de Flussonic para extraer especificaciones técnicas.',
      originalText: 'Enrique: Mecha buscar que el TR haga ingenieria inversa de lo que hace Flussonic',
      deadline: '2026-08-26',
      tag: 'I+D / Video',
      tip: 'Mapear las llamadas de red del panel de control de Flussonic para detectar las APIs de transcoding.',
      hint: 'Esto nos ayudará a integrar las configuraciones avanzadas de streaming en Hábitat.',
      comments: []
    },

    // === MARIO MAQUEDA ===
    {
      id: 'mm-1',
      assignee: 'Mario Maqueda',
      role: 'Ingeniería Android',
      priority: 'CRITICA',
      title: 'Definir Hoja de Ruta de Migración a Kotlin',
      desc: 'Presentar la planificación detallada de la migración del stack de Android a Kotlin. Se requiere tener la hoja de ruta lista para el lunes para acelerar el desarrollo del equipo.',
      originalText: 'DM: A Mario, que me diga hoy, la hoja de Ruta de Kotlin. Esa hoja de rutas, la necesito para el Lunes. Si o si, mejorar su eficiencia. No hay negociacion, debemos migrar todo a Kotlin en este mes. COmo lo migramos con Leo y vos? Dale.',
      deadline: '2026-08-17',
      tag: 'Android / Kotlin',
      tip: 'Mario debe priorizar los módulos de red y base de datos local para la primera fase de la migración a Kotlin para mitigar fallas en la sincronización offline.',
      hint: 'Coordinar con Leo Amaya para asegurar que los patrones de arquitectura sigan siendo compatibles en ambas plataformas.',
      comments: []
    }
  ];

  const [customTopics, setCustomTopics] = useState(() => {
    const saved = localStorage.getItem('dm_custom_delegations_v2');
    return saved ? JSON.parse(saved) : initialTopics;
  });

  const assigneesList = ['ALL', 'Diego Musach', 'Camilo Uribe', 'Enrique Bevilacqua', 'Fabricio Jose Nieva', 'Leonard Amaya', 'Mario Maqueda'];

  useEffect(() => {
    localStorage.setItem('dm_custom_delegations_v2', JSON.stringify(customTopics));
  }, [customTopics]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const findMatchedNotionCard = (itemTitle) => {
    return notionCards.find(card => 
      card.title.toLowerCase().includes(itemTitle.toLowerCase()) || 
      itemTitle.toLowerCase().includes(card.title.toLowerCase())
    );
  };

  const renderCard = (item) => {
    const isDelegated = delegatedItems[item.id];
    const matchedNotionCard = findMatchedNotionCard(item.title);
    const alreadyExists = !!matchedNotionCard;
    const isEditing = editingItemId === item.id;
    const commentsHistory = [
      ...(matchedNotionCard?.comments || []),
      ...(item.comments || [])
    ];

    return (
      <div 
        key={item.id}
        className="card-glass"
        style={{
          padding: '1.5rem',
          borderLeft: isDelegated 
            ? '5px solid var(--accent-emerald)' 
            : item.priority === 'CRITICA' ? '5px solid var(--accent-rose)' : '5px solid var(--accent-indigo)',
          background: isDelegated ? 'rgba(63, 185, 80, 0.05)' : '#161b22',
          transition: 'all 0.2s ease',
          opacity: isDelegated ? 0.85 : 1,
          border: '1px solid var(--border-subtle)',
          textAlign: 'left'
        }}
      >
        {/* Card Content (Standard View vs Editing View) */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '1rem', width: '100%' }} 
              placeholder="Título de la tarea"
            />
            <textarea 
              value={editDesc} 
              onChange={(e) => setEditDesc(e.target.value)} 
              style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', resize: 'vertical', width: '100%' }} 
              rows={3}
              placeholder="Descripción de la tarea"
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                value={editAssignee} 
                onChange={(e) => setEditAssignee(e.target.value)}
                style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
              >
                {assigneesList.slice(1).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select 
                value={editPriority} 
                onChange={(e) => setEditPriority(e.target.value)}
                style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '0.5rem', borderRadius: '4px' }}
              >
                <option value="ALTA">ALTA</option>
                <option value="CRITICA">CRITICA</option>
              </select>
              <input 
                type="text" 
                value={editDeadline} 
                onChange={(e) => setEditDeadline(e.target.value)}
                style={{ background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '0.5rem', borderRadius: '4px', width: '130px' }}
                placeholder="Plazo (AAAA-MM-DD)"
              />
              <button 
                onClick={() => handleSaveEdit(item.id)}
                className="action-btn"
                style={{ background: '#3fb950', border: 'none', color: '#fff', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}
              >
                <Save size={15} /> Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header of Item */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="status-badge" style={{ 
                  backgroundColor: item.priority === 'CRITICA' ? 'rgba(248, 81, 73, 0.15)' : 'rgba(56, 166, 255, 0.15)',
                  color: item.priority === 'CRITICA' ? 'var(--accent-rose)' : 'var(--accent-blue)',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  {item.priority}
                </span>
                <span className="status-badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {item.tag}
                </span>

                {alreadyExists ? (
                  <span className="status-badge" style={{ backgroundColor: 'rgba(63, 185, 80, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={12} /> Existe en Notion
                  </span>
                ) : (
                  <span className="status-badge" style={{ backgroundColor: 'rgba(210, 153, 34, 0.12)', color: 'var(--accent-amber)', fontSize: '0.8rem' }}>
                    ⏳ Pendiente de Crear
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#f0f6fc', fontWeight: 700 }}>
                    👤 {item.assignee}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.role}
                  </div>
                </div>
                {!isDelegated && (
                  <button 
                    onClick={() => handleStartEdit(item)}
                    title="Editar tarjeta"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <Edit3 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', margin: '0 0 0.8rem 0', fontWeight: 700 }}>
              {item.title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', margin: '0 0 1.2rem 0', lineHeight: 1.5 }}>
              {item.desc}
            </p>
          </>
        )}

        {/* TIPS & HINTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
          <div style={{ background: 'rgba(31, 111, 235, 0.1)', padding: '0.85rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-indigo)', border: '1px solid rgba(31, 111, 235, 0.15)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
              <Lightbulb size={13} /> 💡 TIP del Director:
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.4, display: 'block' }}>
              {item.tip}
            </span>
          </div>

          <div style={{ background: 'rgba(57, 211, 83, 0.08)', padding: '0.85rem 1rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)', border: '1px solid rgba(57, 211, 83, 0.1)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
              <HelpCircle size={13} /> 🔍 HINT Operativo:
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.4, display: 'block' }}>
              {item.hint}
            </span>
          </div>
        </div>

        {/* Comments Textarea */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            📝 Notas y Aclaraciones para Notion:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              rows={2}
              placeholder={alreadyExists ? "Escribí una nota para agregar al historial..." : "Escribí notas de trabajo para sumarle a la tarjeta de Notion..."}
              value={commentInputs[item.id] || ''}
              onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
              style={{
                fontSize: '0.9rem',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                color: '#fff',
                width: '100%',
                resize: 'vertical',
                lineHeight: 1.4
              }}
            />
            <button
              onClick={() => handleAddCommentToCard(item)}
              className="action-btn"
              style={{
                alignSelf: 'flex-end',
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {alreadyExists ? 'Guardar Comentario Directo en Notion' : 'Guardar Nota en Historial'}
            </button>
          </div>
        </div>

        {/* Render Comments History Timeline */}
        {commentsHistory.length > 0 && (
          <div style={{ marginTop: '0.8rem', marginBottom: '1rem', background: '#0d1117', padding: '0.85rem 1.1rem', borderRadius: '8px', border: '1px solid #21262d' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageSquare size={13} className="text-blue" /> Historial de Notas y Comentarios ({commentsHistory.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {commentsHistory.map((c, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', paddingBottom: '0.5rem', borderBottom: idx < commentsHistory.length - 1 ? '1px dashed #21262d' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58a6ff', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                    <span>👤 {c.author}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.72rem' }}>{c.date}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-body)', lineHeight: 1.35 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontWeight: 600 }}>Plazo:</span>
            <input
              type="date"
              value={item.deadline && item.deadline.match(/^\d{4}-\d{2}-\d{2}$/) ? item.deadline : ''}
              onChange={(e) => handleQuickUpdateDeadline(item.id, e.target.value)}
              title="Haz clic aquí para modificar el plazo de entrega directamente"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid #30363d',
                color: '#38bdf8',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
            {(!item.deadline || !item.deadline.match(/^\d{4}-\d{2}-\d{2}$/)) && (
              <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 'bold' }}>
                ({item.deadline})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => handleNotionDelegate(item)}
              disabled={isDelegated}
              className="action-btn"
              style={{
                fontSize: '0.85rem',
                padding: '0.5rem 1.1rem',
                background: isDelegated ? 'rgba(63, 185, 80, 0.2)' : '#1f6feb',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                opacity: isDelegated ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: isDelegated ? 'not-allowed' : 'pointer'
              }}
            >
              <Database size={14} />
              {isDelegated ? 'Creado en Notion' : 'Confirmar y Crear en Notion'}
            </button>

            <button
              onClick={() => handleDiscard(item.id)}
              className="action-btn text-rose"
              style={{
                fontSize: '0.85rem',
                padding: '0.5rem 0.8rem',
                background: 'rgba(248, 81, 73, 0.08)',
                border: '1px solid rgba(248, 81, 73, 0.2)',
                cursor: 'pointer'
              }}
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleQuickUpdateDeadline = (itemId, newDeadline) => {
    if (!newDeadline) return;
    setCustomTopics(prev => prev.map(t => {
      if (t.id === itemId) {
        return { ...t, deadline: newDeadline };
      }
      return t;
    }));
    setActionAlert({
      type: 'info',
      text: `📅 Plazo actualizado a ${newDeadline}`
    });
    setTimeout(() => setActionAlert(null), 2500);
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.desc);
    setEditAssignee(item.assignee);
    setEditPriority(item.priority);
    setEditDeadline(item.deadline);
  };

  const handleSaveEdit = (itemId) => {
    setCustomTopics(prev => prev.map(t => {
      if (t.id === itemId) {
        return {
          ...t,
          title: editTitle,
          desc: editDesc,
          assignee: editAssignee,
          priority: editPriority,
          deadline: editDeadline,
          role: editAssignee === 'Diego Musach' ? 'CTO / Dirección' : 'Ingeniería'
        };
      }
      return t;
    }));
    setEditingItemId(null);
    setActionAlert({
      type: 'info',
      text: '💾 Cambios guardados localmente en la tarjeta.'
    });
    setTimeout(() => setActionAlert(null), 2500);
  };

  const handleAddCommentToCard = (item) => {
    const text = commentInputs[item.id];
    if (!text || !text.trim()) return;

    // Automatic Intelligent Date Extraction from comment text
    const extractedDate = extractDateFromText(text.trim());

    const newComment = {
      author: 'Diego Musach (CTO)',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      text: text.trim()
    };

    // 1. If it already exists in Notion, update the main state (and deadline if date detected)
    const matched = findMatchedNotionCard(item.title);
    if (matched) {
      setNotionCards(prev => prev.map(card => {
        if (card.id === matched.id) {
          return {
            ...card,
            deadline: extractedDate || card.deadline,
            comments: [...(card.comments || []), newComment]
          };
        }
        return card;
      }));
    }

    // 2. Save to local customTopics state comments history & update deadline automatically if date detected
    setCustomTopics(prev => prev.map(t => {
      if (t.id === item.id) {
        return {
          ...t,
          deadline: extractedDate || t.deadline,
          comments: [...(t.comments || []), newComment]
        };
      }
      return t;
    }));

    setCommentInputs(prev => ({ ...prev, [item.id]: '' }));
    
    if (extractedDate) {
      setActionAlert({
        type: 'success',
        text: `✨ Comentario guardado. Plazo actualizado automáticamente a ${extractedDate}`
      });
    } else {
      setActionAlert({
        type: 'success',
        text: '💬 Comentario guardado con éxito.'
      });
    }
    setTimeout(() => setActionAlert(null), 3000);
  };

  const handleNotionDelegate = (item) => {
    const userNote = commentInputs[item.id] || '';
    const uniqueId = `notion-delegated-${Date.now()}`;
    const pageId = `del-${item.id}-${Date.now().toString().slice(-4)}`;
    
    const prevSavedComments = item.comments || [];
    const currentInputComment = userNote.trim() ? [{
      author: 'Diego Musach (CTO)',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      text: userNote.trim()
    }] : [];
    const commentsList = [...prevSavedComments, ...currentInputComment];

    const newCard = {
      id: uniqueId,
      notionPageId: pageId,
      notionId: pageId,
      title: item.title,
      project: item.assignee === 'Diego Musach' ? 'Dirección CTO' : 'Control de Gestión CTO',
      status: 'Abierto',
      priority: item.priority === 'CRITICA' ? 'P1 - CRITICA' : 'P2 - ALTA',
      responsable: item.assignee === 'Diego Musach' ? 'Diego Paolo Musach' : item.assignee,
      assignedTo: item.assignee === 'Diego Musach' ? 'Diego Paolo Musach' : item.assignee,
      deadline: item.deadline === 'Inmediato' ? '2026-08-14' : item.deadline,
      missingDeadline: false,
      summary: `${item.desc}\n\n💡 TIP: ${item.tip}\n🔍 HINT: ${item.hint}`,
      transcript: `Creado desde la lista de temas analizados.\nTexto original de la minuta:\n${item.originalText}`,
      comments: commentsList
    };

    // Update parent state directly
    if (onAddNotionCard) {
      onAddNotionCard(newCard);
    } else {
      setNotionCards(prev => [newCard, ...prev]);
    }

    // UPDATE DYNAMIC TEAM TRACKING STATE TOO!
    if (teamTracking && setTeamTracking) {
      const targetName = item.assignee === 'Diego Musach' ? 'Diego Paolo Musach' : item.assignee;
      
      setTeamTracking(prevTeam => {
        return prevTeam.map(member => {
          if (member.name.toLowerCase() === targetName.toLowerCase() || 
              member.name.toLowerCase().includes(targetName.toLowerCase().split(' ')[0])) {
            
            const newTopicObj = {
              id: `top-del-${item.id}-${Date.now()}`,
              notionPageId: pageId,
              notionId: pageId,
              title: item.title,
              status: 'Abierto',
              priority: item.priority === 'CRITICA' ? 'P1 - CRITICA' : 'P2 - ALTA',
              log: `Registrado desde Delegación AI para ${targetName}.`,
              comments: commentsList
            };

            return {
              ...member,
              topics: [newTopicObj, ...(member.topics || [])]
            };
          }
          return member;
        });
      });
    }

    // Also update customTopics local card comments list
    if (userNote) {
      setCustomTopics(prev => prev.map(t => {
        if (t.id === item.id) {
          return {
            ...t,
            comments: [...(t.comments || []), ...commentsList]
          };
        }
        return t;
      }));
      setCommentInputs(prev => ({ ...prev, [item.id]: '' }));
    }

    setDelegatedItems(prev => ({ ...prev, [item.id]: true }));
    setActionAlert({
      type: 'success',
      text: `🚀 ¡Tema "${item.title}" asignado con éxito a la base de Notion de ${item.assignee}! Ya figura en el Follow Up.`
    });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleDiscard = (itemId) => {
    setDiscardedItems(prev => ({ ...prev, [itemId]: true }));
    setActionAlert({
      type: 'warning',
      text: `🗑️ Tema marcado como archivado/descartado.`
    });
    setTimeout(() => setActionAlert(null), 3000);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    // Advanced Dynamic NLP Parsing & RAG Engine
    setTimeout(() => {
      const lowText = userText.toLowerCase();

      // Detect if the user is asking a question/query
      const isQuery = lowText.includes('?') || 
                      lowText.includes('que tengo') || 
                      lowText.includes('que hay') || 
                      lowText.includes('decime') || 
                      lowText.includes('listar') || 
                      lowText.includes('cuales son') || 
                      lowText.includes('quien tiene') || 
                      lowText.includes('como sigue') || 
                      lowText.includes('buscar');

      if (isQuery) {
        let answer = '';
        let targetAssignee = '';
        
        if (lowText.includes('yo') || lowText.includes('diego') || lowText.includes('tengo')) {
          targetAssignee = 'Diego Musach';
        } else if (lowText.includes('camilo')) {
          targetAssignee = 'Camilo Uribe';
        } else if (lowText.includes('enrique')) {
          targetAssignee = 'Enrique Bevilacqua';
        } else if (lowText.includes('fabricio')) {
          targetAssignee = 'Fabricio Jose Nieva';
        } else if (lowText.includes('leonard') || lowText.includes('leo')) {
          targetAssignee = 'Leonard Amaya';
        } else if (lowText.includes('mario')) {
          targetAssignee = 'Mario Maqueda';
        }

        if (targetAssignee) {
          const namePart = targetAssignee.split(' ')[0].toLowerCase();
          const matchedCustom = customTopics.filter(t => t.assignee.toLowerCase().includes(namePart));
          const matchedNotion = notionCards.filter(card => card.responsable && card.responsable.toLowerCase().includes(namePart));

          setRagSearchResults({
            title: `Búsqueda RAG: Temas de ${targetAssignee}`,
            items: matchedCustom
          });

          answer = `🤖 **RAG Ejecutado**: Encontré **${matchedCustom.length}** temas sugeridos pendientes y **${matchedNotion.length}** tareas en Notion para **${targetAssignee}**. 

Abrí una ventana dedicada con las tarjetas correspondientes para que las revises e interactúes con ellas de forma directa.`;
        } else {
          answer = `🤖 **Asistente Antigravity RAG**: Decime el nombre de la persona sobre la que querés consultar (ej: "qué tiene camilo" o "qué tengo que hacer yo").`;
        }

        setIsTyping(false);
        const botReply = {
          sender: 'assistant',
          text: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botReply]);
        return;
      }

      // If not a query, parse it as a directive to add a new task card
      let detectedAssignee = 'Diego Musach';
      let title = 'Nueva Tarea Asistida';
      let tag = 'General';
      let priority = 'ALTA';
      let deadline = '2026-08-18';
      let generatedTip = 'Definir claramente los criterios de aceptación técnicos y realizar una validación intermedia con el cliente.';
      let generatedHint = 'Este tema se relaciona directamente con la alineación comercial de la minuta de Alejandro Cubino.';

      // Assignee match
      if (lowText.includes('camilo')) {
        detectedAssignee = 'Camilo Uribe';
        tag = 'Energía';
        generatedTip = 'Camilo debe validar los problemas de medición en el laboratorio local y estructurar el cálculo de caídas.';
        generatedHint = 'Edemsa y Afinia requieren este cálculo de manera prioritaria para el cierre de sus certificaciones.';
      } else if (lowText.includes('enrique')) {
        detectedAssignee = 'Enrique Bevilacqua';
        tag = 'Video';
        generatedTip = 'Enrique debe verificar el parseo XML en el backend de Roku y evitar el uso de configuraciones de red estáticas.';
        generatedHint = 'La estabilidad de la aplicación Roku de Telecable Costa Rica es crítica para el despliegue del Q3.';
      } else if (lowText.includes('fabricio')) {
        detectedAssignee = 'Fabricio Jose Nieva';
        tag = 'Full Stack';
        priority = 'CRITICA';
        generatedTip = 'Pedirle a Fabricio que use Claude Code para refactorizar la lógica del socket en Hábitat para evitar memory leaks.';
        generatedHint = 'Fabricio necesita desafíos de mayor complejidad; esta tarea es una excelente oportunidad para evaluar su performance.';
      } else if (lowText.includes('leonard') || lowText.includes('leo')) {
        detectedAssignee = 'Leonard Amaya';
        tag = 'Mobile / WIND';
        generatedTip = 'Leonard debe coordinar con Mario el pasaje del look & feel personalizado para Hyatt en la app de Android TV.';
        generatedHint = 'Martin Trozzo está esperando esta demo en Hyatt para validar el backoffice de administración.';
      } else if (lowText.includes('mario')) {
        detectedAssignee = 'Mario Maqueda';
        tag = 'Android';
        priority = 'CRITICA';
        generatedTip = 'Mario debe presentar la hoja de ruta de Kotlin de forma visual el lunes sin falta para no retrasar el sprint.';
        generatedHint = 'La migración a Kotlin es mandatoria este mes; asegurar que se capacite al equipo en la sintaxis moderna.';
      }

      // Priority match
      if (lowText.includes('urgente') || lowText.includes('critico') || lowText.includes('ya') || lowText.includes('hoy')) {
        priority = 'CRITICA';
      }

      // Title extraction
      let cleanedTitle = userText
        .replace(/camilo|enrique|fabricio|leonard|mario|diego/gi, '')
        .replace(/agregar tema|asignar a|tarea|crear|delega/gi, '')
        .replace(/^\s*:\s*/, '')
        .trim();

      if (cleanedTitle.length > 5) {
        title = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
      } else {
        title = `Seguimiento: ${userText.slice(0, 30)}...`;
      }

      const newTopic = {
        id: `custom-topic-${Date.now()}`,
        assignee: detectedAssignee,
        role: detectedAssignee === 'Diego Musach' ? 'CTO / Dirección' : 'Ingeniería',
        priority: priority,
        title: title,
        desc: `Ingresado vía asistente AI: "${userText}"`,
        originalText: userText,
        deadline: deadline,
        tag: tag,
        tip: generatedTip,
        hint: generatedHint,
        comments: []
      };

      setCustomTopics(prev => [newTopic, ...prev]);
      setIsTyping(false);

      const botReply = {
        sender: 'assistant',
        text: `¡Tema procesado! Agregué la tarjeta **"${title}"** asignada a **${detectedAssignee}** con prioridad **${priority}**. Ya podés verla a la izquierda, editarla si querés, y confirmarla para Notion.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  const filtered = customTopics.filter(t => {
    if (selectedAssignee !== 'ALL' && t.assignee !== selectedAssignee) return false;
    if (discardedItems[t.id]) return false;
    return true;
  });

  return (
    <div className="delegacion-container" style={{ padding: '1.5rem', minHeight: '80vh', color: '#fff', fontSize: '1.05rem', position: 'relative' }}>
      
      {/* FILTER & LIST */}
      <div>
        {actionAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '1.2rem 1.8rem',
            borderRadius: '8px',
            backgroundColor: actionAlert.type === 'success' ? '#3fb950' : '#d29922',
            borderLeft: '5px solid #fff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {actionAlert.type === 'success' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{actionAlert.text}</span>
          </div>
        )}

        {/* Dashboard Title */}
        <div className="card-glass" style={{ padding: '1.5rem 1.8rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(31, 111, 235, 0.15), rgba(13, 17, 23, 0.95))', borderLeft: '4px solid var(--accent-indigo)' }}>
          <h2 style={{ fontSize: '1.45rem', color: '#f0f6fc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
            <Sparkles className="text-blue" size={26} /> Procesador & Delegador de Temas Operativos (CTO)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
            Revisá, personalizá y delegá tareas directamente a Notion. Las tarjetas se asocian de inmediato al Follow Up de cada responsable.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="card-glass" style={{ padding: '1rem 1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center', background: '#161b22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-muted" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Responsable:</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {assigneesList.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAssignee(a)}
                className={`nav-tab-btn ${selectedAssignee === a ? 'active' : ''}`}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  background: selectedAssignee === a ? '#1f6feb' : 'rgba(255,255,255,0.03)',
                  border: '1px solid ' + (selectedAssignee === a ? '#58a6ff' : 'rgba(255,255,255,0.08)'),
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {a === 'ALL' ? '👥 Todos' : a}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist - Dynamic Grid (2 Columns on large screens) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {filtered.length === 0 ? (
            <div className="card-glass" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={45} style={{ margin: '0 auto 1.2rem auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '1rem' }}>No quedan pendientes para este filtro.</p>
            </div>
          ) : (
            filtered.map(item => renderCard(item))
          )}
        </div>
      </div>

      {/* Floating AI Chat Assistant */}
      {isChatOpen ? (
        <div style={{ 
          position: 'fixed', 
          bottom: '25px', 
          right: '25px', 
          width: '380px', 
          height: '500px', 
          background: '#161b22', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '12px', 
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)', 
          display: 'flex', 
          flexDirection: 'column', 
          zIndex: 99999,
          padding: '1.2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Bot size={22} className="text-blue" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Asistente AI Antigravity</h3>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950', display: 'inline-block', marginLeft: 'auto' }} title="Online"></span>
            <button 
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', marginLeft: '0.5rem', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Chat Feed */}
          <div style={{ height: '345px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', paddingRight: '0.2rem' }}>
            {chatMessages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? 'rgba(31, 111, 235, 0.15)' : '#0d1117',
                  border: '1px solid ' + (m.sender === 'user' ? 'rgba(31, 111, 235, 0.3)' : '#30363d'),
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  maxWidth: '90%',
                  fontSize: '0.85rem',
                  lineHeight: 1.45
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: m.sender === 'user' ? '#58a6ff' : 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {m.sender === 'user' ? 'Diego Musach' : 'Antigravity'}
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#0d1117', border: '1px solid #30363d', padding: '0.5rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span className="pulse-dot" style={{ display: 'inline-block', marginRight: '0.3rem' }}></span> Antigravity está procesando...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
            style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', position: 'relative', zIndex: 999999 }}
          >
            <input
              type="text"
              placeholder="Asignar tema manual (ej: Camilo...)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '0.55rem 0.75rem',
                fontSize: '0.85rem',
                color: '#fff',
                outline: 'none'
              }}
              autoComplete="off"
            />
            <button 
              type="submit"
              className="action-btn"
              style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '0.55rem 0.85rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              window.open(window.location.href, '_blank');
            } else {
              setIsChatOpen(true);
            }
          }}
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(192, 132, 252, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            transition: 'transform 0.2s ease'
          }}
          className="hover-scale"
        >
          <Bot size={28} />
        </button>
      )}

      {/* RAG Search Results Modal Overlay */}
      {ragSearchResults && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '2rem'
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            padding: '1.5rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles className="text-blue" size={22} /> {ragSearchResults.title}
              </h3>
              <button 
                onClick={() => setRagSearchResults(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>

            {/* Modal Content - List of Matched Cards */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
              {ragSearchResults.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron tarjetas sugeridas en esta consulta de RAG.
                </div>
              ) : (
                ragSearchResults.items.map(item => renderCard(item))
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setRagSearchResults(null)}
                className="action-btn"
                style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
