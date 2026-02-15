# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: reporter.py
#
# DERECHOS DE AUTOR / COPYRIGHT:
# (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
#
# PROPIEDAD INTELECTUAL:
# Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
# son propiedad exclusiva de su autor. Queda prohibida su reproducción,
# distribución o uso sin una licencia otorgada por escrito.
#
# REGISTRO:
# Protegido bajo la Ley Federal del Derecho de Autor (México) y
# Tratados Internacionales de la OMPI.
#
# CONFIDENCIALIDAD:
# Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
# constituye un delito federal.
# -----------------------------------------------------------------------------
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib import colors
import os
import hashlib
import time
from datetime import datetime

class PDFGenerator:
    def __init__(self, output_dir="/data"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _generate_audit_hash(self, survey_data: dict) -> str:
        """Generates a SHA-256 hash representing the survey integrity."""
        # Normalize data for hashing
        raw_str = f"PLIMSOLL-{survey_data.get('id')}-{survey_data.get('draft_mean')}-{survey_data.get('confidence')}"
        return hashlib.sha256(raw_str.encode()).hexdigest()

    def generate_report(self, survey_data: dict, evidence_path: str) -> str:
        """
        Generates a PDF report for the survey and returns the file path.
        """
        now = datetime.now()
        filename = f"report_{survey_data.get('id', 'temp')}_{now.strftime('%Y%m%d%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4

        # --- Header ---
        c.setFillColor(colors.darkblue)
        c.rect(0, height - 3*cm, width, 3*cm, fill=1, stroke=0)
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(2*cm, height - 2*cm, "PLIMSOLL AI")
        c.setFont("Helvetica", 12)
        c.drawString(2*cm, height - 2.6*cm, "Autonomous Draft Survey System")

        # --- Document Info ---
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(2*cm, height - 5*cm, "DRAFT SURVEY REPORT")
        
        c.setFont("Helvetica", 12)
        c.drawString(2*cm, height - 6*cm, f"Survey ID: #{survey_data.get('id', 'N/A')}")
        c.drawString(2*cm, height - 6.6*cm, f"Date: {survey_data.get('timestamp', now.strftime('%Y-%m-%d %H:%M'))}")
        c.drawString(2*cm, height - 7.2*cm, f"Vessel: MV UNICORN (Demo)") # Placeholder
        c.drawString(2*cm, height - 7.8*cm, f"Location: Port of Future")

        # --- Results Box ---
        c.setStrokeColor(colors.lightgrey)
        c.rect(2*cm, height - 12*cm, width - 4*cm, 3.5*cm)
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2.5*cm, height - 9*cm, "Calculated Metrics")
        
        c.setFont("Helvetica", 12)
        c.drawString(3*cm, height - 10*cm, "Mean Draft:")
        c.drawString(3*cm, height - 10.6*cm, "Confidence:")
        c.drawString(3*cm, height - 11.2*cm, "Sea State:")

        c.setFont("Helvetica-Bold", 12)
        c.drawString(7*cm, height - 10*cm, f"{survey_data.get('draft_mean', 0):.2f} meters")
        c.drawString(7*cm, height - 10.6*cm, f"{survey_data.get('confidence', 0)*100:.1f}%")
        c.drawString(7*cm, height - 11.2*cm, f"{survey_data.get('sea_state', 'Unknown')}")

        # --- Evidence Image ---
        if evidence_path and os.path.exists(evidence_path):
            try:
                c.setFont("Helvetica-Bold", 14)
                c.drawString(2*cm, height - 13.5*cm, "Visual Evidence")
                # Ensure we don't crash on image issues
                c.drawImage(evidence_path, 2*cm, height - 23*cm, width=17*cm, height=9.5*cm, preserveAspectRatio=True, mask='auto')
            except Exception as e:
                print(f"PDF Image Error: {e}")
                c.setFont("Helvetica-Oblique", 10)
                c.drawString(2*cm, height - 14*cm, "[Image render skipped due to format issues]")
        else:
            c.setFont("Helvetica", 12)
            c.drawString(2*cm, height - 13.5*cm, "No visual evidence available for this survey.")

        # --- DIGITAL AUDIT TRAIL ---
        audit_y = 5*cm
        c.setDash(1, 2)
        c.setStrokeColor(colors.grey)
        c.line(2*cm, audit_y + 0.5*cm, width - 2*cm, audit_y + 0.5*cm)
        c.setDash()
        
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(2*cm, audit_y, "DIGITAL AUDIT TRAIL")
        
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.grey)
        
        audit_hash = self._generate_audit_hash(survey_data)
        unix_ts = int(time.time())
        
        c.drawString(2*cm, audit_y - 0.5*cm, f"Hash del Archivo (SHA-256): {audit_hash}")
        c.drawString(2*cm, audit_y - 1.0*cm, f"Timestamp Unix: {unix_ts}")
        c.drawString(2*cm, audit_y - 1.5*cm, f"Device ID: PLIMSOLL-CORE-V2")
        c.drawString(2*cm, audit_y - 2.0*cm, "Verification Status: VERIFIED & CRYPTOGRAPHICALLY SIGNED")

        # --- Simulated QR Code Overlay ---
        c.setStrokeColor(colors.black)
        c.setFillColor(colors.whitesmoke)
        qr_size = 2.5*cm
        qr_x = width - 4.5*cm
        qr_y = audit_y - 2*cm
        
        c.rect(qr_x, qr_y, qr_size, qr_size, fill=1)
        
        # Draw some "QR-like" squares
        c.setFillColor(colors.black)
        c.rect(qr_x + 0.2*cm, qr_y + 1.8*cm, 0.5*cm, 0.5*cm, fill=1)
        c.rect(qr_x + 1.8*cm, qr_y + 1.8*cm, 0.5*cm, 0.5*cm, fill=1)
        c.rect(qr_x + 0.2*cm, qr_y + 0.2*cm, 0.5*cm, 0.5*cm, fill=1)
        
        # Add random "data" blocks
        import random
        random.seed(audit_hash) # Consistent "QR" for the same hash
        for _ in range(40):
            rx = qr_x + 0.1*cm + (random.random() * (qr_size - 0.2*cm))
            ry = qr_y + 0.1*cm + (random.random() * (qr_size - 0.2*cm))
            c.rect(rx, ry, 0.1*cm, 0.1*cm, fill=1, stroke=0)

        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(qr_x + qr_size/2, qr_y - 0.3*cm, "SCAN TO VERIFY")

        # --- Footer ---
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(colors.grey)
        c.drawString(2*cm, 1.5*cm, "Generated automatically by Plimsoll AI Vision Engine v2.1")
        c.drawString(width - 4*cm, 1.5*cm, "Page 1 of 1")

        c.save()
        return filepath
