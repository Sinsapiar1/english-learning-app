# 🔍 PROMPT PARA ANÁLISIS COMPLETO DE CLAUDE

## 📋 INSTRUCCIONES PARA CLAUDE

Eres un experto desarrollador de aplicaciones educativas con IA. Necesito que analices completamente este repositorio de una app de aprendizaje de inglés y me des instrucciones exactas para solucionar todos los problemas identificados.

## 🎯 CONTEXTO DEL PROYECTO

**APLICACIÓN**: English Learning App - Plataforma de aprendizaje de inglés con IA
**OBJETIVO**: Generar ejercicios únicos y personalizados para enseñar inglés real
**STACK**: React + TypeScript + Firebase + Google Gemini 1.5 Flash
**DEPLOY**: https://english-learning-app-nu.vercel.app

## 🚨 PROBLEMAS CRÍTICOS A ANALIZAR

### 1. **REPETICIÓN DE EJERCICIOS**
- **PROBLEMA**: Usuario reporta que aún ve preguntas repetidas
- **SISTEMA ACTUAL**: ExerciseTracker en localStorage + SmartAI con reintentos
- **NECESITO**: Análisis de por qué falla el sistema anti-repetición

### 2. **CALIDAD DE EJERCICIOS**
- **PROBLEMA**: Ejercicios pueden no ser suficientemente variados o educativos
- **SISTEMA ACTUAL**: Gemini 1.5 Flash con prompt redesignado
- **NECESITO**: Evaluación de la calidad pedagógica actual

### 3. **ARQUITECTURA DE DATOS**
- **PROBLEMA**: Posible conflicto entre localStorage y Firebase
- **SISTEMA ACTUAL**: Híbrido localStorage + Firestore
- **NECESITO**: Revisión de la estrategia de persistencia

## 📊 ANÁLISIS REQUERIDO

### A. **REVISIÓN DE CÓDIGO**
Analiza estos archivos críticos y identifica problemas:

1. **`src/services/geminiAI.ts`** - Generación de ejercicios con IA
2. **`src/services/smartAI.ts`** - Orquestación inteligente
3. **`src/services/exerciseTracker.ts`** - Sistema anti-repetición
4. **`src/services/intelligentLearning.ts`** - Perfil de usuario
5. **`src/components/LessonSessionFixed.tsx`** - Componente principal
6. **`src/components/MultipleChoice.tsx`** - Display de preguntas

### B. **EVALUACIÓN PEDAGÓGICA**
Evalúa si los ejercicios realmente enseñan inglés:

- ¿Los 4 tipos de ejercicio son efectivos?
- ¿Las explicaciones son útiles para principiantes?
- ¿Los contextos modernos son apropiados?
- ¿La progresión de dificultad es lógica?

### C. **ANÁLISIS TÉCNICO**
Identifica problemas técnicos:

- ¿Por qué el sistema anti-repetición falla?
- ¿Hay race conditions o problemas de concurrencia?
- ¿La generación de IA es suficientemente robusta?
- ¿El manejo de errores es adecuado?

## 🎯 TIPOS DE EJERCICIOS ESPERADOS

La app debe generar estos 4 tipos de ejercicios únicos:

### **TIPO 1: VOCABULARIO** (Inglés → Español)
```
Pregunta: "What does 'stream' mean in 'I stream Netflix daily'?"
Opciones: A) transmitir ✓  B) río  C) correr  D) gritar
```

### **TIPO 2: GRAMÁTICA** (Completar en inglés)
```
Pregunta: "I ____ working remotely since the pandemic started."
Opciones: A) have been ✓  B) am  C) was  D) will be
```

### **TIPO 3: TRADUCCIÓN** (Español → Inglés)
```
Pregunta: "¿Cómo se dice 'subir una foto' en inglés?"
Opciones: A) upload a photo ✓  B) download a photo  C) like a photo  D) share a photo
```

### **TIPO 4: COMPRENSIÓN** (Texto inglés → Pregunta inglés)
```
Texto: "Maria works for Netflix as a content creator. She uploads videos daily."
Pregunta: "What does Maria do daily?"
Opciones: A) uploads videos ✓  B) watches Netflix  C) creates accounts  D) downloads content
```

## 🔍 INSTRUCCIONES ESPECÍFICAS PARA TU ANÁLISIS

### 1. **IDENTIFICA PROBLEMAS EXACTOS**
- Enumera cada problema específico encontrado
- Explica la causa raíz de cada problema
- Prioriza por impacto en la experiencia del usuario

### 2. **PROPORCIONA SOLUCIONES CONCRETAS**
- Código específico a cambiar (archivo + líneas)
- Nuevos archivos a crear si es necesario
- Configuraciones a ajustar

### 3. **VALIDA LA LÓGICA EDUCATIVA**
- ¿Los ejercicios realmente enseñan inglés?
- ¿La progresión es pedagógicamente sólida?
- ¿Las explicaciones son útiles para principiantes?

### 4. **OPTIMIZA LA ARQUITECTURA**
- ¿El sistema anti-repetición es robusto?
- ¿La generación de IA es eficiente?
- ¿El manejo de estados es consistente?

## 📋 FORMATO DE RESPUESTA ESPERADO

```
## 🚨 PROBLEMAS IDENTIFICADOS

### PROBLEMA #1: [Nombre del problema]
**Archivo**: src/path/file.ts
**Líneas**: 123-456
**Causa**: [Explicación detallada]
**Impacto**: [Alto/Medio/Bajo]
**Solución**: [Código específico o cambios necesarios]

### PROBLEMA #2: [Siguiente problema]
[Mismo formato...]

## ✅ SOLUCIONES PRIORITARIAS

1. **ALTA PRIORIDAD**: [Lista de cambios críticos]
2. **MEDIA PRIORIDAD**: [Mejoras importantes]
3. **BAJA PRIORIDAD**: [Optimizaciones futuras]

## 🎯 RECOMENDACIONES ARQUITECTÓNICAS

[Cambios estructurales recomendados]

## 📚 VALIDACIÓN PEDAGÓGICA

[Evaluación de la efectividad educativa]
```

## 🎯 OBJETIVO FINAL

Después de tu análisis, la aplicación debe:
- ✅ Generar ejercicios 100% únicos (sin repeticiones)
- ✅ Enseñar inglés real con 4 tipos de ejercicios variados
- ✅ Proporcionar explicaciones pedagógicamente útiles
- ✅ Mantener contextos modernos y relevantes
- ✅ Funcionar de manera rápida y fluida
- ✅ Rastrear progreso real del usuario

---

**¡ANALIZA TODO EL REPOSITORIO CON ESTA PERSPECTIVA Y DAME INSTRUCCIONES EXACTAS PARA CREAR LA MEJOR APP DE INGLÉS CON IA!**