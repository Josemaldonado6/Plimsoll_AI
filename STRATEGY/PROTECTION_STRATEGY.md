# Plimsoll AI: Protección de IP y Estrategia Coatzacoalcos

Este documento detalla quiénes son los jugadores clave en tu región y cómo interactuar con ellos sin que te roben la tecnología.

---

## 🏗️ 1. Mapeo Estratégico en Coatzacoalcos, Veracruz

En tu zona hay tres tipos de empresas con las que podrías cruzarte. Aquí tienes los nombres reales para que sepas quién es quién:

### A. Los "Directos" (Surveyors / Competidores o Partners)
Estas empresas ya hacen lo que tú haces, pero de forma manual. Son tu mayor riesgo de robo, pero tu mejor opción de alianza.
- **Rain Surveyors del Golfo**: Muy fuertes en el Golfo de México. Tienen la infraestructura pero les falta tu IA.
- **Q Maritime Surveyors**: Especialistas técnicos con certificaciones internacionales.
- **Control Cargo Internacional**: Tienen laboratorios ISO 17025. Son muy profesionales y estructurados.

### B. Los "Clientes Gigantes" (Operadores de Terminales)
Ellos son los que pagan el servicio. Les interesa el ahorro, no robarte el código.
- **ASIPONA Coatzacoalcos** (Antigua API): La autoridad portuaria.
- **Pemex Terminal Marítima**: El gigante de la zona.
- **Innophos / Cemex / Vopak**: Manejan graneles y químicos donde el calado es crítico.

---

## 🛡️ 2. Cómo Evitar que te Roben (Blindaje Industrial)

El miedo a que te roben es real, pero aquí tienes cómo blindarte como un profesional:

### Táctica 1: El Pitch del "Caja Negra" (Black Box)
Nunca expliques **cómo** funciona el algoritmo (el WCA-v2). Explica **qué** hace.
- **MAL:** "Usamos una red neuronal YOLOv11 con Python y un filtro de Kalman para las olas." (Les acabas de dar la receta).
- **BIEN:** "Nuestra arquitectura propietaria procesa telemetría óptica para eliminar el 99% del ruido del oleaje, entregando un dato certificado."

### Táctica 2: El NDA (Acuerdo de Confidencialidad)
Antes de mostrar el software en vivo (DraftDashboard.tsx), **deben firmar un NDA**.
- No lo hagas tú solo. Busca un formato legal estándar de México que incluya:
    1. Prohibición de Ingeniería Inversa.
    2. No-competencia (no pueden hacer un software igual en 2-3 años).
    3. Multas claras en caso de incumplimiento.

### Táctica 3: Arquitectura de Seguridad (SaaS Only)
Tu código es tu fuerte. Nunca entregues el software para que lo instalen en sus servidores.
- **Cloud Computing:** El software vive en tus servidores controlados. Ellos solo acceden a través de un navegador.
- **Dron Offline:** Si el dron necesita procesar algo localmente, usa modelos de IA compilados y encriptados que se autodestruyan o bloqueen si se intentan copiar.

### Táctica 4: El "Audit Trail" Inmutable
Configura el sistema para que cada vez que alguien use el software, se genere un log (registro) con GPS, hora y usuario. 
- Si alguien intenta copiar el diseño o la lógica, el sistema ya tiene un registro de que tú fuiste el creador y ellos fueron usuarios.
