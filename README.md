# 🚀 Tablero de Comandos Ejecutivo CTO & Control de Gestión

> **Sistema de Control Directivo, Seguimiento de Ingeniería y Automatización IA con Notion & Fathom Video Notetaker.**  
> *Diseñado para Diego Paolo Musach | Director & Head of Engineering.*

---

## 🌟 Resumen de Funcionalidades Principales

### 1. 🎥 Integración Inteligente con Fathom Video Notetaker (`dmusach@bromteck.com`)
- **Ingesta Histórica:** Extrae y analiza el 100% de las videollamadas grabadas desde el **1° de Julio de 2026** a la fecha.
- **Auto-Cron Polling (60m):** Sincroniza automáticamente en segundo plano la aparición de reuniones nuevas cada 60 minutos.
- **Formulación de Títulos Ejecutivos con Criterio:** Formula tareas orientadas a objetivos directivos claros.
- **Detección de Tarjetas Existentes:** Si el tema ya está abierto en Notion, **suma el avance como comentario directo** a la tarjeta existente sin duplicarla. Si no existe, genera la nueva tarjeta en 1-click.

### 2. 🚨 Follow Up Diario & Speeches Adaptativos
- **Speeches Directivos Únicos:** Genera un discurso adaptado para cada uno de los 165 temas clave (EDEMSA, Tecsys, WIND, Telecable, Heroku, Soporte BOT AI, Pérdidas, etc.).
- **Reacciones de Contingencia:** Provee la respuesta directiva exacta ante excusas o demoras del equipo.
- **Notion 2-Way Sync:** Publicación de comentarios literales e instantáneos a Notion API y actualización del estado (Abierto/Cerrado).

### 3. 📊 Scorecards & Micromanagement de Ingeniería
- Visibilidad completa sobre la velocidad, calidad de código, PRs activas y bloqueos por integrante del equipo (Camilo, Enrique, Fabricio, Mario, Leonard, Joseph, Sabrina, Kenyi, Martin).

---

## 🛠️ Guía Rápida de Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/diegomusach/tablero-ejecutivo.git

# 2. Ingresar al directorio e instalar dependencias
cd tablero-ejecutivo
npm install

# 3. Iniciar servidor de desarrollo local
npm run dev
```

El tablero estará disponible en: `http://127.0.0.1:5173/`

---

## 🔒 Seguridad & Credenciales
- **Notion Integration:** Vinculado mediante Token API oficial y formato canónico UUID de 36 caracteres.
- **Persistencia Local:** Credenciales y reuniones almacenadas en `localStorage` del navegador para retención permanente a 0ms tras recargar.

---
*Desarrollado para la Dirección de Ingeniería CTO.*
