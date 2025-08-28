# English Learning App 🚀

Una aplicación web moderna e inteligente para aprender inglés con IA personalizada y ejercicios únicos garantizados.

## 🌟 Características Principales

### ✅ **Sistema de Ejercicios Anti-Repetición**
- **100+ ejercicios únicos** distribuidos por nivel y tema
- **Algoritmo inteligente** que previene repeticiones
- **Progresión educativa** desde conceptos básicos hasta avanzados
- **Historial inteligente** que recuerda ejercicios completados

### 🤖 **IA Personalizada (Opcional)**
- **Generación dinámica** de ejercicios con Google AI (Gemini)
- **Adaptación al progreso** individual del usuario
- **Fallback robusto** a ejercicios curados cuando la IA falla
- **API Key personal** - cada usuario usa su propia clave

### 🎮 **Gamificación Completa**
- **Sistema XP** con recompensas por ejercicio
- **Tracking de precisión** en tiempo real
- **Streaks diarios** para mantener motivación
- **Progresión de niveles** A1 → A2 → B1 → B2

### 🔐 **Autenticación Segura**
- **Firebase Auth** con email y Google
- **Progreso persistente** en la nube
- **Perfiles personalizados** con estadísticas detalladas

## 🏗️ Arquitectura Técnica

### **Frontend**
- **React 18** + TypeScript
- **CSS Moderno** con sistema de utilidades personalizado
- **Componentes optimizados** con React.memo y useCallback
- **Responsive design** para móvil y desktop

### **Backend & Servicios**
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos en tiempo real
- **Google AI Studio** - Generación de ejercicios con IA
- **localStorage** - Cache local y historial

### **Deployment**
- **Vercel** - Hosting principal (recomendado)
- **Netlify** - Alternativa con configuración incluida
- **Firebase Hosting** - Integración nativa
- **GitHub Pages** - Opción gratuita básica

## 🚀 Instalación y Configuración

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/Sinsapiar1/english-learning-app.git
cd english-learning-app
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=tu_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcd1234
```

### **4. Ejecutar en Desarrollo**
```bash
npm start
```

### **5. Build para Producción**
```bash
npm run build
```

## 🎯 Uso de la Aplicación

### **Para Estudiantes**

1. **Registro/Login**
   - Crear cuenta con email o Google
   - Progreso automáticamente guardado

2. **Configurar IA (Opcional)**
   - Obtener API Key gratuita en [ai.google.dev](https://ai.google.dev)
   - Configurar en la app para ejercicios personalizados

3. **Comenzar Sesiones**
   - **Lección Rápida**: Ejercicio individual
   - **Sesión IA**: 8 ejercicios consecutivos únicos
   - Progreso automático por niveles

### **Para Desarrolladores**

#### **Añadir Nuevos Ejercicios**
```typescript
// src/data/exercises.ts
{
  id: "nuevo_ejercicio_01",
  level: "A2",
  topic: "nuevo_tema",
  question: "Tu pregunta aquí _____ ?",
  instruction: "Instrucción clara",
  options: ["opción1", "opción2", "opción3", "opción4"],
  correctAnswer: 1,
  explanation: "Explicación educativa detallada",
  xpReward: 10
}
```

#### **Crear Nuevos Tipos de Ejercicios**
```typescript
// Extender la interfaz Exercise
interface NewExerciseType extends Exercise {
  exerciseType: "fill-in-blanks" | "drag-drop" | "listening";
  audioUrl?: string;
  blanks?: string[];
}
```

## 📊 Métricas y Analytics

### **Métricas de Usuario**
- **Ejercicios completados** por sesión
- **Precisión promedio** por tema
- **Tiempo promedio** por ejercicio
- **Streaks consecutivos** de estudio
- **Progresión de nivel** automática

### **Métricas de Sistema**
- **Tasa de uso de IA** vs fallbacks
- **Ejercicios únicos** servidos sin repetición
- **Tiempo de respuesta** de generación
- **Retención de usuarios** por semana

## 🔧 Configuración Avanzada

### **Personalizar Niveles**
```typescript
// src/data/exercises.ts
const CUSTOM_LEVELS = {
  "Beginner": ["basic_vocab", "simple_grammar"],
  "Intermediate": ["complex_grammar", "idioms"],
  "Advanced": ["business_english", "academic_writing"]
};
```

### **Añadir Nuevos Temas**
```typescript
// Actualizar getTopicsForLevel en LessonSessionFixed.tsx
const allTopics = {
  A1: ["present simple", "past simple", "basic_vocabulary"],
  A2: ["present perfect", "prepositions", "adverbs", "nuevo_tema"],
  // ...
};
```

### **Configurar IA Personalizada**
```typescript
// src/services/geminiAI.ts
const customPrompt = `
Tu prompt personalizado aquí...
Nivel: ${params.level}
Enfoque especial: ${params.customFocus}
`;
```

## 🐛 Troubleshooting

### **Problemas Comunes**

#### **IA No Genera Ejercicios**
```bash
# Verificar en consola del navegador
🚨 IA COMPLETAMENTE FALLIDA
🔑 PROBLEMA DE API KEY  # Configurar API key
💳 PROBLEMA DE CUOTA    # Verificar límites Google AI
```

#### **Ejercicios Se Repiten**
```bash
# Limpiar historial local
localStorage.removeItem('used_exercises_A2');
# O usar función integrada
cleanOldExerciseHistory('A2', 50);
```

#### **Build Falla**
```bash
# Verificar dependencias
npm install
# Limpiar cache
npm start -- --reset-cache
```

## 🚀 Deployment

### **Vercel (Recomendado)**
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### **Netlify**
1. Configuración incluida en `netlify.toml`
2. Redirects SPA configurados
3. Headers de cache optimizados

### **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📈 Roadmap Futuro

### **Próximas Características**
- [ ] **Nuevos tipos de ejercicios**: Fill-in-blanks, Drag & Drop
- [ ] **Comprensión auditiva**: Text-to-Speech integrado
- [ ] **Lecciones estructuradas**: Cursos completos por nivel
- [ ] **Modo offline**: PWA con cache inteligente
- [ ] **Pronunciación**: Speech Recognition API
- [ ] **Comunidad**: Leaderboards y desafíos

### **Mejoras Técnicas**
- [ ] **Micro-frontend**: Arquitectura modular
- [ ] **GraphQL**: API más eficiente
- [ ] **WebAssembly**: Procesamiento local de IA
- [ ] **Analytics avanzados**: Insights de aprendizaje
- [ ] **A/B Testing**: Optimización de UX

## 🤝 Contribuir

### **Cómo Contribuir**
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -m 'Add: nueva característica'`
4. Push rama: `git push origin feature/nueva-caracteristica`
5. Crear Pull Request

### **Áreas de Contribución**
- **Contenido educativo**: Nuevos ejercicios y explicaciones
- **UX/UI**: Mejoras de diseño e interacción
- **Características**: Nuevos tipos de ejercicios
- **Performance**: Optimizaciones y mejoras técnicas
- **Documentación**: Guías y tutoriales

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

### **Desarrollador Principal**
- **Arquitectura y desarrollo**: Sistema completo de aprendizaje
- **Especialización**: Aplicaciones educativas con IA

### **Contribuidores**
- Bienvenidas contribuciones de la comunidad
- Ver `CONTRIBUTORS.md` para lista completa

## 📞 Soporte

### **Documentación**
- **README.md**: Guía principal
- **DEPLOYMENT.md**: Guía de despliegue detallada
- **HANDOFF.md**: Análisis técnico completo

### **Contacto**
- **Issues**: Reportar bugs y solicitar características
- **Discussions**: Preguntas y ideas de la comunidad
- **Wiki**: Documentación extendida y tutoriales

---

**English Learning App** - Transformando la educación de idiomas con tecnología moderna e IA personalizada. 🌟

*Desarrollado con ❤️ para la comunidad de aprendizaje de idiomas.*