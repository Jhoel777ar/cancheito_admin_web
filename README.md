# Cancheito — Panel Administrativo Web 

<div align="center">

![VERIFIED](https://img.shields.io/badge/VERIFIED-BY--ArkDevSystem-brightgreen?style=for-the-badge&logo=github)

**Panel Administrativo Web para la plataforma Cancheito**  
*Construido con Next.js, Firebase y potenciado por IA*

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🚀 Descripción

**Cancheito Admin Web** es el panel administrativo oficial de la plataforma **Cancheito**, una solución integral que conecta postulantes y empleadores de manera eficiente. Este panel proporciona una interfaz web completa impulsada por IA y respaldada por Firebase para gestionar todos los aspectos de la plataforma.

### ✨ Funcionalidades principales

- 📊 **Monitoreo en tiempo real** - Usuarios, ofertas laborales y postulaciones
- 🎛️ **Gestión de datos** - Administración completa de información de la plataforma  
- 📈 **Analytics y métricas** - Reportes detallados y análisis de comportamiento
- 🛡️ **Moderación de contenido** - Activación, moderación y eliminación de contenido
- ⚙️ **Configuración del sistema** - Administración de parámetros globales
- 🤖 **Integración con IA** - Funcionalidades inteligentes automatizadas

> 💡 **Complemento perfecto**: Este panel trabaja en conjunto con la [App Móvil Cancheito](https://github.com/SamStormDEV/App_Movil_Cancheito.git) desarrollada en Kotlin para Android.

---

## 🏗️ Arquitectura y Tecnologías

<table>
<tr>
<td width="50%">

### 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 15 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS |
| **Autenticación** | Firebase Auth |
| **Base de Datos** | Firestore |
| **Storage** | Firebase Storage |
| **Backend** | Firebase Functions |
| **IA** | Servicios integrados |
| **Deploy** | Firebase Hosting |

</td>
<td width="50%">

### 📁 Estructura del Proyecto

```
cancheito_admin_web/
├── 📂 src/
│   ├── 📂 app/          # Rutas (App Router)
│   ├── 📂 components/   # Componentes UI
│   ├── 📂 hooks/        # Hooks personalizados
│   ├── 📂 services/     # Lógica Firebase/IA
│   ├── 📂 contexts/     # Contextos globales
│   ├── 📂 layouts/      # Layouts de secciones
│   ├── 📂 utils/        # Utilidades
│   └── 📂 styles/       # Estilos globales
├── 📂 public/           # Assets estáticos
├── 🔧 .env.local        # Variables de entorno
├── ⚙️ next.config.ts    # Config Next.js
├── 🎨 tailwind.config.ts # Config Tailwind
└── 📋 package.json
```

</td>
</tr>
</table>

---

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

- Node.js 18.0 o superior
- npm o yarn
- Cuenta de Firebase configurada
- Git

### ⚡ Inicio rápido

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Jhoel777ar/cancheito_admin_web.git
   cd cancheito_admin_web
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o con yarn
   yarn install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env.local` en la raíz:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   GEMINI_API_KEY=tu_api_key_gemini
   
   # Servicios adicionales (IA, APIs, etc.)
   # Agregar según necesidades específicas
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```
   
   📱 Accede a: `http://localhost:3000`

### 🏭 Producción

```bash
# Construir la aplicación
npm run build

# Ejecutar en producción local
npm run start

# Desplegar en Firebase Hosting
firebase deploy --only hosting
```

---

## 🔗 Integración con Ecosistema Cancheito

### 📱 App Móvil (Android)

Este panel administrativo está íntimamente conectado con la aplicación móvil oficial:

- **Repositorio**: [App_Movil_Cancheito](https://github.com/SamStormDEV/App_Movil_Cancheito.git)
- **Tecnología**: Kotlin para Android
- **Sincronización**: Mismo proyecto Firebase (Auth, Firestore, Storage)
- **Datos compartidos**: Las métricas del panel se generan desde la actividad de la app móvil

> ⚠️ **Importante**: Mantener consistencia en esquemas de Firestore entre ambos proyectos.

---

## 📊 Características del Panel

### 🎯 Dashboard Principal
- Vista general de métricas clave
- Gráficos en tiempo real
- Alertas y notificaciones importantes

### 👥 Gestión de Usuarios
- Lista completa de postulantes y empleadores
- Perfiles detallados y historial de actividad
- Herramientas de moderación y soporte

### 💼 Administración de Ofertas
- Monitor de ofertas laborales activas
- Gestión de categorías y filtros
- Control de calidad de contenido

### 📈 Analytics Avanzados
- Reportes de uso y engagement
- Métricas de conversión
- Análisis de tendencias del mercado laboral

---

## 🛡️ Seguridad y Buenas Prácticas

### 🔐 Seguridad
- ✅ Control de acceso basado en roles administrativos
- ✅ Reglas de Firestore para proteger datos sensibles  
- ✅ Autenticación robusta con Firebase Auth
- ✅ Logs de auditoría para todas las acciones críticas

### ⚡ Rendimiento
- ✅ Optimización de consultas para dashboards con grandes volúmenes
- ✅ Lazy loading de componentes pesados
- ✅ Cacheo inteligente de datos frecuentes
- ✅ Compresión y optimización de assets

### 🎨 UI/UX
- ✅ Consistencia visual con sistema de design Tailwind
- ✅ Responsive design para todos los dispositivos
- ✅ Accesibilidad web (WCAG 2.1)
- ✅ Feedback visual claro para todas las acciones

---

## 📄 Licencia

Este proyecto es parte del ecosistema Cancheito. Para información sobre licencias, contactar al equipo de desarrollo.

---

## 🔧 Soporte y Contacto

- **Issues**: [GitHub Issues](https://github.com/Jhoel777ar/cancheito_admin_web/issues)
- **Desarrollador**: [@Jhoel777ar](https://github.com/Jhoel777ar)
- **Organización**: ArkDevSystem
