# Mission Simulation Guide: Plimsoll Pilot v3.0

Para lograr una experiencia de usuario **perfecta**, he implementado un simulador de misión en tiempo real que te permite probar el flujo completo sin necesidad de hardware físico.

## 1. Preparación del Sistema
Asegúrate de que tanto el backend como la terminal de Expo estén activos:
- **Backend**: `http://localhost:8000`
- **Mobile**: `npx expo start`

## 2. Ejecución de la Misión Sugerida
Sigue estos pasos en la aplicación móvil para ver la simulación en acción:

1.  **Conexión**: Abre la app y verifica que el badge superior indique "LINK ACTIVE".
2.  **Planificación**: En el panel "HULL-ORBIT MISSION", presiona el botón **GENERATE HULL-ORBIT PLAN**.
    - El sistema calculará automáticamente 6 puntos de inspección (FWD-P, MID-P, AFT-P, AFT-S, MID-S, FWD-S) basados en el buque V LOCUS (229m).
3.  **Ejecución**: Presiona **EXECUTE MISSION**.
    - Verás cómo el estado cambia de "FLYING" a "NAVIGATING TO FWD-P".
    - Los indicadores de posición (X, Y) comenzarán a cambiar suavemente mientras el dron se desplaza.
    - La barra de progreso se actualizará en tiempo real hasta llegar al 100%.

## 3. Verificación de Seguridad
El simulador respeta estrictamente los estándares industriales:
- **Batería**: Consumo real de 0.05% por segundo durante el vuelo.
- **Limpieza**: Al presionar **LAND**, el dron regresará a las coordenadas (0,0) y se desconectará.

---
*Este guía garantiza una transición perfecta de la simulación al despliegue real en puerto.*
