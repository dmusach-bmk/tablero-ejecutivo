// Mock initial data tailored for Diego Paolo Musach - Executive Command Dashboard

export const INITIAL_NOTION_CARDS = [
  {
    id: "notion-101",
    title: "Migración de Arquitectura Microservicios V2 a Kubernetes",
    project: "Core Infrastructure",
    status: "En Revisión Técnica",
    priority: "Alta",
    assignedTo: "Lucas Fernández (Senior DevOps)",
    deadline: "2026-08-15",
    missingDeadline: false,
    summary: "Se completó la definición de manifiestos Helm y terraform scripts. Pendiente validación de stress testing de carga y failover multi-región.",
    transcript: "Transcripción de Reunión Técnica (08/Ago):\n- Diego Musach remarcó la importancia de NO comprometer el SLA del 99.99% durante la migración.\n- Lucas expuso las pruebas de caída de pod. Se acordó hacer canary deployment con 10% del tráfico inicial.\n- Diego exigió reporte de memoria de los pods y revisión estricta de seguridad en secretos de Vault.",
    comments: [
      { author: "Diego Musach", date: "2026-08-08 14:30", text: "Excelente avance en Helm. Favor de incluir alertas de latencia p99 en Datadog antes del pase a QA." },
      { author: "Lucas Fernández", date: "2026-08-08 16:15", text: "Agregadas alertas p99. Quedo a la espera del visto bueno final de Diego para el canary deployment." }
    ]
  },
  {
    id: "notion-102",
    title: "Refactorización de la API de Autenticación & OAuth2 Sync",
    project: "Security & Auth",
    status: "Bloqueado",
    priority: "Crítica",
    assignedTo: "Sofía Gómez (Lead Backend Engineer)",
    deadline: "", // Missing deadline! Will trigger deadline prompter
    missingDeadline: true,
    summary: "Refactor de tokens JWT a rotación asimétrica RS256. Bloqueado por dependencia con la API externa de proveedor de identidad.",
    transcript: "Transcripción Standup Diaria (09/Ago):\n- Sofía comentó que el proveedor externo demoró 48hs en enviar la llave pública para sandbox.\n- Diego sugirió implementar un mock server interno para avanzar con los tests de integración sin depender del proveedor.",
    comments: [
      { author: "Sofía Gómez", date: "2026-08-09 09:45", text: "El mock server sugerido por Diego nos desbloqueó los unit tests. Necesitamos definir fecha tope de entrega." }
    ]
  },
  {
    id: "notion-103",
    title: "Optimización de Consultas PostgreSQL y Cache Redis",
    project: "Database Performance",
    status: "En Progreso",
    priority: "Media",
    assignedTo: "Martín Rossi (Backend Engineer)",
    deadline: "2026-08-12",
    missingDeadline: false,
    summary: "Identificados 5 queries de alto costo en el Dashboard de reportes. Implementación de índices parciales e invalidación inteligente de Redis.",
    transcript: "Transcripción 1-on-1 Diego & Martín (07/Ago):\n- Diego felicitó a Martín por reducir el tiempo de respuesta del query principal de 1.8s a 120ms.\n- Se revisó la estrategia de invalidación de caché para evitar 'cache stampede'.",
    comments: [
      { author: "Diego Musach", date: "2026-08-07 11:20", text: "Gran trabajo de profiling. Mantengamos la exigencia de latencia < 200ms en el 100% de los endpoints." }
    ]
  },
  {
    id: "notion-104",
    title: "Integración con Sistema de Facturación Electrónica B2B",
    project: "Billing & Integrations",
    status: "Pendiente",
    priority: "Alta",
    assignedTo: "Valentina Paz (Fullstack Engineer)",
    deadline: "", // Missing deadline!
    missingDeadline: true,
    summary: "Diseño del pipeline de eventos para emisión automática de facturas y webhooks de confirmación fiscal.",
    transcript: "Transcripción Planning Sprint (05/Ago):\n- Valentina presentó el diagrama C4 de la arquitectura de facturación.\n- Diego enfatizó la necesidad de idempotencia en el procesamiento de eventos de cobro para evitar doble facturación.",
    comments: []
  }
];

export const INITIAL_EXCEL_DATA = [
  { fecha: "2026-08-03", sprint: "Sprint 42", prsRevisadas: 18, velEquipo: 88, erroresProduccion: 0, latenciaPromMs: 142, coberturaTestPct: 86.4, costoInfraUSD: 1420 },
  { fecha: "2026-08-04", sprint: "Sprint 42", prsRevisadas: 22, velEquipo: 92, erroresProduccion: 1, latenciaPromMs: 138, coberturaTestPct: 86.8, costoInfraUSD: 1415 },
  { fecha: "2026-08-05", sprint: "Sprint 42", prsRevisadas: 19, velEquipo: 90, erroresProduccion: 0, latenciaPromMs: 135, coberturaTestPct: 87.1, costoInfraUSD: 1410 },
  { fecha: "2026-08-06", sprint: "Sprint 42", prsRevisadas: 25, velEquipo: 95, erroresProduccion: 0, latenciaPromMs: 129, coberturaTestPct: 87.5, costoInfraUSD: 1395 },
  { fecha: "2026-08-07", sprint: "Sprint 42", prsRevisadas: 28, velEquipo: 97, erroresProduccion: 0, latenciaPromMs: 125, coberturaTestPct: 88.0, costoInfraUSD: 1390 },
  { fecha: "2026-08-08", sprint: "Sprint 43", prsRevisadas: 15, velEquipo: 89, erroresProduccion: 0, latenciaPromMs: 128, coberturaTestPct: 88.2, costoInfraUSD: 1385 },
  { fecha: "2026-08-09", sprint: "Sprint 43", prsRevisadas: 21, velEquipo: 94, erroresProduccion: 0, latenciaPromMs: 121, coberturaTestPct: 88.5, costoInfraUSD: 1380 }
];

export const INITIAL_TEAM_TRACKING = [
  {
    id: "dev-1",
    name: "Lucas Fernández",
    role: "Senior DevOps & Cloud Arch",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    activePRs: 3,
    prReviewTimeHours: 2.1,
    velocityScore: 96,
    codeQualityScore: 98,
    status: "Excelente ritmo",
    blockers: "Ninguno",
    weeklyGoal: "Concluir canary deploy K8s y reducir costo infra en 5%",
    lastFeedback: "Excelente nivel técnico en la migración de Helm. Mantener enfoque en documentación.",
    next1on1Date: "2026-08-11"
  },
  {
    id: "dev-2",
    name: "Sofía Gómez",
    role: "Lead Backend Engineer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    activePRs: 2,
    prReviewTimeHours: 4.5,
    velocityScore: 84,
    codeQualityScore: 94,
    status: "Bloqueada por tercero",
    blockers: "Respuesta de proveedor externo OAuth2",
    weeklyGoal: "Finalizar refactor OAuth con mock server interno",
    lastFeedback: "Reconocer esfuerzo en diseño de arquitectura. Ayudar a destrabar gestiones externas.",
    next1on1Date: "2026-08-12"
  },
  {
    id: "dev-3",
    name: "Martín Rossi",
    role: "Backend Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    activePRs: 4,
    prReviewTimeHours: 3.2,
    velocityScore: 92,
    codeQualityScore: 90,
    status: "En progreso activo",
    blockers: "Ninguno",
    weeklyGoal: "Optimizar queries Postgres restantes y configurar Redis invalidation tags",
    lastFeedback: "Muy buena iniciativa en profiling de BD. Reforzar unit tests en casos bordes.",
    next1on1Date: "2026-08-13"
  },
  {
    id: "dev-4",
    name: "Valentina Paz",
    role: "Fullstack Engineer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    activePRs: 1,
    prReviewTimeHours: 5.0,
    velocityScore: 81,
    codeQualityScore: 88,
    status: "Requiere seguimiento",
    blockers: "Definición de contrato JSON de facturación",
    weeklyGoal: "Cerrar diagrama C4 e implementar endpoints idempotentes de cobro",
    lastFeedback: "Acompañar en la toma de decisiones de diseño para evitar parálisis por análisis.",
    next1on1Date: "2026-08-14"
  }
];

export const LEADERSHIP_PLAYBOOK = [
  {
    id: "lead-1",
    title: "Alta Exigencia Técnica + Empatía Humana",
    category: "Cultura & Estándares",
    summary: "Cómo exigir excelencia en la arquitectura y en el código sin generar estrés tóxico ni desmotivación.",
    keyPoints: [
      "No comprometer nunca los estándares de ingeniería (tests, linters, arquitectura limpia, seguridad).",
      "Si un dev falla en un entregable, investigar primero las causas raíz (bloqueos, falta de claridad, contexto personal).",
      "Separar a la persona del problema técnico: 'El código carece de manejo de errores' vs 'Tu código está mal'.",
      "Reconocer públicamente los logros de refinamiento técnico y dar feedback crítico exclusivamente en privado."
    ],
    actionableAdvice: "En los Code Reviews, fundamenta siempre el 'por qué' técnico de un cambio. En lugar de ordenar, enseña la razón de arquitectura."
  },
  {
    id: "lead-2",
    title: "Gestión de Fechas Límite y Compromisos Reales",
    category: "Micromanagement Efectivo",
    summary: "Evitar promesas irrealizables a stakeholders sin caer en la procrastinación del equipo.",
    keyPoints: [
      "Cada tarea compleja DEBE tener una estimación basada en desglose de ingeniería (WBS).",
      "Exigir visibilidad inmediata ante desvíos de más de 24hs.",
      "El rol de Diego como líder es remover obstáculos técnicos, no acumular presión sin herramientas.",
      "Ante presión externa por adelantar fechas, ofrecer alcance reducido en lugar de menor calidad."
    ],
    actionableAdvice: "Usa la regla del 'Buffer del 20%': si el equipo estima 5 días, agrega 1 día para imprevistos de testing y CI/CD."
  },
  {
    id: "lead-3",
    title: "Manejo de Desarrolladores Bloqueados o Desmotivados",
    category: "Mentoring & 1-on-1s",
    summary: "Detección temprana de frustración técnica y acompañamiento asertivo.",
    keyPoints: [
      "Pregunta en cada 1-on-1: '¿Qué es lo que más te hace perder tiempo en tu día a día?'",
      "Si un dev lleva más de 4 horas atascado en un problema, promover sesiones de Pair Programming de 30 min.",
      "Celebrar la refactorización inteligente y la reducción de deuda técnica."
    ],
    actionableAdvice: "Asigna 'Spikes de investigación' con tiempo acotado (timebox de 4hs) cuando la solución técnica sea incierta."
  }
];

export const LEADERSHIP_SCENARIOS = [
  {
    id: "scen-1",
    scenario: "Un desarrollador entregó una Pull Request importante sin pruebas unitarias aduciendo apuro.",
    recommendedResponse: "Apreciar el esfuerzo en la funcionalidad, pero NO aprobar la PR. Explicar con empatía que la falta de tests aumentará la carga de trabajo futura del equipo al provocar regresiones en producción.",
    diegoActionSteps: [
      "1. Enviar comentario amable en la PR: 'Excelente solución lógica. Para mantener nuestro estándar de resiliencia, sumemos los tests de la capa de servicio antes del merge.'",
      "2. Ofrecer una sesión corta de pair programming si necesita ayuda armando las fixtures de test.",
      "3. Registrar en el tablero la necesidad de reforzar los git hooks automáticos de verificación de coverage."
    ]
  },
  {
    id: "scen-2",
    scenario: "El equipo lleva 2 semanas con retraso en una entrega crítica por cambios no especificados.",
    recommendedResponse: "Asumir el liderazgo de la comunicación con Producto/Management para blindar al equipo y re-establecer las prioridades claras.",
    diegoActionSteps: [
      "1. Congelar el alcance del sprint (Feature Freeze).",
      "2. Redactar reporte ejecutivo claro con las causas técnicas y las nuevas fechas realistas.",
      "3. Reunirse con los desarrolladores para felicitarlos por mantener la calma y darles foco exclusivo en los 3 blockers principales."
    ]
  }
];
