/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: vite.config.ts
 *
 * DERECHOS DE AUTOR / COPYRIGHT:
 * (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
 *
 * PROPIEDAD INTELECTUAL:
 * Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
 * son propiedad exclusiva de su autor. Queda prohibida su reproducción,
 * distribución o uso sin una licencia otorgada por escrito.
 *
 * REGISTRO:
 * Protegido bajo la Ley Federal del Derecho de Autor (México) y
 * Tratados Internacionales de la OMPI.
 *
 * CONFIDENCIALIDAD:
 * Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
 * constituye un delito federal.
 * -----------------------------------------------------------------------------
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
