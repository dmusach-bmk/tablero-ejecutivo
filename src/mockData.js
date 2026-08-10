import { REAL_NOTION_CARDS, REAL_TEAM_TRACKING } from './realNotionData';

export const INITIAL_NOTION_CARDS = REAL_NOTION_CARDS;
export const INITIAL_TEAM_TRACKING = REAL_TEAM_TRACKING;

export const INITIAL_EXCEL_DATA = [
  { fecha: "2026-08-03", sprint: "Sprint 42", responsable: "Camilo Uribe", prsRevisadas: 18, velEquipo: 88, erroresProduccion: 0, latenciaPromMs: 142, coberturaTestPct: 86.4, costoInfraUSD: 1420 },
  { fecha: "2026-08-04", sprint: "Sprint 42", responsable: "Enrique Bevilacqua", prsRevisadas: 22, velEquipo: 92, erroresProduccion: 1, latenciaPromMs: 138, coberturaTestPct: 86.8, costoInfraUSD: 1415 },
  { fecha: "2026-08-05", sprint: "Sprint 42", responsable: "Fabricio Jose Nieva", prsRevisadas: 19, velEquipo: 90, erroresProduccion: 0, latenciaPromMs: 135, coberturaTestPct: 87.1, costoInfraUSD: 1410 },
  { fecha: "2026-08-06", sprint: "Sprint 42", responsable: "Mario Maqueda", prsRevisadas: 25, velEquipo: 95, erroresProduccion: 0, latenciaPromMs: 129, coberturaTestPct: 87.5, costoInfraUSD: 1395 },
  { fecha: "2026-08-07", sprint: "Sprint 42", responsable: "Leonard Amaya", prsRevisadas: 28, velEquipo: 97, erroresProduccion: 0, latenciaPromMs: 125, coberturaTestPct: 88.0, costoInfraUSD: 1390 },
  { fecha: "2026-08-08", sprint: "Sprint 43", responsable: "Joseph Valer", prsRevisadas: 15, velEquipo: 89, erroresProduccion: 0, latenciaPromMs: 128, coberturaTestPct: 88.2, costoInfraUSD: 1385 },
  { fecha: "2026-08-09", sprint: "Sprint 43", responsable: "Diego Paolo Musach (CTO)", prsRevisadas: 21, velEquipo: 94, erroresProduccion: 0, latenciaPromMs: 121, coberturaTestPct: 88.5, costoInfraUSD: 1380 }
];

export const LEADERSHIP_PLAYBOOK = [
  {
    id: "lead-1",
    title: "Alta Exigencia Técnica + Empatía Humana",
    category: "Cultura & Estándares",
    responsable: "Diego Paolo Musach (Director)",
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
    responsable: "Diego Paolo Musach (Director)",
    summary: "Evitar promesas irrealizables a stakeholders sin caer en la procrastinación del equipo.",
    keyPoints: [
      "Cada tarea compleja DEBE tener una estimación basada en desglose de ingeniería (WBS).",
      "Exigir visibilidad inmediata ante desvíos de más de 24hs.",
      "El rol de Diego como líder es remover obstáculos técnicos, no acumular presión sin herramientas.",
      "Ante presión externa por adelantar fechas, ofrecer alcance reducido en lugar de menor calidad."
    ],
    actionableAdvice: "Usa la regla del 'Buffer del 20%': si el equipo estima 5 días, agrega 1 día para imprevistos de testing y CI/CD."
  }
];

export const LEADERSHIP_SCENARIOS = [
  {
    id: "scen-1",
    scenario: "Un desarrollador entregó una Pull Request importante sin pruebas unitarias aduciendo apuro.",
    responsable: "Diego Paolo Musach (Líder Directo)",
    recommendedResponse: "Apreciar el esfuerzo en la funcionalidad, pero NO aprobar la PR. Explicar con empatía que la falta de tests aumentará la carga de trabajo futura del equipo al provocar regresiones en producción.",
    diegoActionSteps: [
      "1. Enviar comentario amable en la PR: 'Excelente solución lógica. Para mantener nuestro estándar de resiliencia, sumemos los tests de la capa de servicio antes del merge.'",
      "2. Ofrecer una sesión corta de pair programming si necesita ayuda armando las fixtures de test.",
      "3. Registrar en el tablero la necesidad de reforzar los git hooks automáticos de verificación de coverage."
    ]
  }
];
