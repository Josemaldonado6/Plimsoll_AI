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
from PIL import Image
from app.engine.notary import BlockchainNotary

class PDFGenerator:
    def __init__(self, output_dir="/data"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Translation Dictionary
        self.translations = {
            "title": {
                "en": "DRAFT SURVEY REPORT",
                "es": "REPORTE DE SURVEY DE CALADO",
                "pt": "RELATÓRIO DE CALADO",
                "zh": "吃水检验报告"
            },
            "system_sub": {
                "en": "Autonomous Draft Survey System",
                "es": "Sistema Autónomo de Survey de Calado",
                "pt": "Sistema Autônomo de Calado",
                "zh": "自主吃水检验系统"
            },
            "survey_id": { "en": "Survey ID", "es": "ID Inspección", "pt": "ID Pesquisa", "zh": "检验ID" },
            "date": { "en": "Date", "es": "Fecha", "pt": "Data", "zh": "日期" },
            "vessel": { "en": "Vessel", "es": "Buque", "pt": "Navio", "zh": "船名" },
            "location": { "en": "Location", "es": "Ubicación", "pt": "Localização", "zh": "地点" },
            "metrics_title": {
                "en": "Calculated Metrics",
                "es": "Métricas Calculadas",
                "pt": "Métricas Calculadas",
                "zh": "计算指标"
            },
            "mean_draft": { "en": "Mean Draft", "es": "Calado Medio", "pt": "Calado Médio", "zh": "平均吃水" },
            "confidence": { "en": "Confidence", "es": "Confianza", "pt": "Confiança", "zh": "置信度" },
            "sea_state": { "en": "Sea State", "es": "Estado del Mar", "pt": "Estado do Mar", "zh": "海况" },
            "evidence_title": {
                "en": "Visual Evidence",
                "es": "Evidencia Visual",
                "pt": "Evidência Visual",
                "zh": "视觉证据"
            },
            "no_evidence": {
                "en": "No visual evidence available for this survey.",
                "es": "Sin evidencia visual disponible para esta inspección.",
                "pt": "Nenhuma evidência visual disponível.",
                "zh": "无视觉证据"
            },
            "audit_title": {
                "en": "DIGITAL AUDIT TRAIL",
                "es": "TRAZABILIDAD DIGITAL (AUDITORÍA)",
                "pt": "TRILHA DE AUDITORIA DIGITAL",
                "zh": "数字审计追踪"
            },
            "file_hash": { "en": "File Hash", "es": "Hash del Archivo", "pt": "Hash do Arquivo", "zh": "文件哈希" },
            "timestamp": { "en": "Unix Timestamp", "es": "Marca de Tiempo Unix", "pt": "Timestamp Unix", "zh": "Unix时间戳" },
            "device_id": { "en": "Device ID", "es": "ID Dispositivo", "pt": "ID Dispositivo", "zh": "设备ID" },
            "verif_status": {
                "en": "Verification Status: VERIFIED & CRYPTOGRAPHICALLY SIGNED",
                "es": "Estado: VERIFICADO Y FIRMADO CRIPTOGRÁFICAMENTE",
                "pt": "Status: VERIFICADO E ASSINADO CRIPTOGRAFICAMENTE",
                "zh": "状态：已验证并加密签名"
            },
            "scan_verify": { "en": "SCAN TO VERIFY", "es": "ESCANEAR PARA VERIFICAR", "pt": "ESCANEAR PARA VERIFICAR", "zh": "扫描验证" },
            "footer_gen": {
                "en": "Generated automatically by Plimsoll AI Vision Engine v2.1",
                "es": "Generado automáticamente por Motor de Visión Plimsoll AI v2.1",
                "pt": "Gerado automaticamente pelo Plimsoll AI Vision Engine v2.1",
                "zh": "由 Plimsoll AI 视觉引擎 v2.1 自动生成"
            },
            "page": { "en": "Page", "es": "Página", "pt": "Página", "zh": "页" },
            "displacement": { "en": "True Displacement", "es": "Desplazamiento Verdadero" },
            "tpc": { "en": "TPC (Tons/cm)", "es": "TPC (Tons/cm)" },
            "ocr_audit": { "en": "AI OCR Audit", "es": "Auditoría OCR por IA" },
            "cal_auto": { "en": "Auto-Calibration Status", "es": "Estado de Auto-Calibración" },
            "cal_status": { "en": "ACTIVE (GEOMETRIC STASIS)", "es": "ACTIVO (ESTASIS GEOMÉTRICA)" },
            "legal_footer_1": {
                "en": "This draft survey audit was generated by Plimsoll AI Autonomous Engine v1.0. The measurements are derived from",
                "es": "Esta auditoría de calado fue generada por el Motor Autónomo Plimsoll AI v1.0. Las mediciones se derivan de"
            },
            "legal_footer_2": {
                "en": "computer vision analysis and are cryptographically signed. Any alteration of this digital file invalidates the SHA-256 signature.",
                "es": "análisis de visión artificial y están firmadas criptográficamente. Cualquier alteración de este archivo invalida la firma SHA-256."
            },
            "blockchain_title": {
                "en": "BLOCKCHAIN IMMUTABILITY RECORD",
                "es": "REGISTRO DE INMUTABILIDAD EN BLOCKCHAIN"
            },
            "blockchain_desc_1": {
                "en": "This document has been cryptographically notarized on the Plimsoll Private Ledger.",
                "es": "Este documento ha sido notariado criptográficamente en el Libro Mayor Privado de Plimsoll."
            },
            "blockchain_desc_2": {
                "en": "Any modification to the digital file will invalidate this hash.",
                "es": "Cualquier modificación al archivo digital invalidará este hash."
            },
            "verified_shield": {
                "en": "✓ VERIFIED BY PLIMSOLL SMART CONTRACT (ERC-721)",
                "es": "✓ VERIFICADO POR CONTRATO INTELIGENTE PLIMSOLL (ERC-721)"
            }
        }

    def _t(self, key, lang='en'):
        """
        Returns the translation. If lang is 'bi' (bilingual), returns 'English / Local'.
        Default fallback to English.
        """
        if lang == 'bi':
            # For bilingual, we assume English / Spanish for now, or could pass secondary param
            # Let's standardize on English / Spanish as the primary bilingual mode requested
            en_val = self.translations.get(key, {}).get('en', key)
            es_val = self.translations.get(key, {}).get('es', key)
            return f"{en_val} / {es_val}"
        
        # Specific language
        return self.translations.get(key, {}).get(lang, self.translations.get(key, {}).get('en', key))

    def _generate_audit_hash(self, survey_data: dict) -> str:
        """Generates a SHA-256 hash representing the survey integrity."""
        # Normalize data for hashing
        raw_str = f"PLIMSOLL-{survey_data.get('id')}-{survey_data.get('draft_mean')}-{survey_data.get('confidence')}"
        return hashlib.sha256(raw_str.encode()).hexdigest()

    def generate_report(self, survey_data: dict, evidence_path: str, lang: str = 'en') -> str:
        """
        Generates a PDF report for the survey and returns the file path.
        lang: 'en', 'es', 'pt', 'zh', or 'bi' (Bilingual EN/ES)
        """
        now = datetime.now()
        report_id = hashlib.md5(f"{survey_data.get('id')}{now}".encode()).hexdigest().upper()
        filename = f"report_{survey_data.get('id', 'temp')}_{now.strftime('%Y%m%d%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        c = canvas.Canvas(filepath, pagesize=A4)
        width, height = A4
        
        # Helper for bilingual text rendering
        def draw_label_value(label_key, value, x_label, y, x_val):
            label = self._t(label_key, lang)
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.darkgrey)
            c.drawString(x_label, y, f"{label}:")
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(colors.black)
            c.drawString(x_val, y, str(value))

        # --- 1. Corporate / Security Header ---
        # Logo Area (Left)
        c.setFont("Times-Bold", 28) # Serif as requested
        c.setFillColor(colors.black)
        c.drawString(2*cm, height - 2.5*cm, "PLIMSOLL AI")
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.grey)
        c.drawString(2.1*cm, height - 2.9*cm, "AUTONOMOUS SURVEY ENGINE")

        # Security Info (Right)
        c.setFont("Courier-Bold", 10) # Monospace
        c.setFillColor(colors.darkblue)
        c.drawRightString(width - 2*cm, height - 2*cm, f"REPORT ID: {report_id[:16]}...")
        c.setFillColor(colors.red)
        c.drawRightString(width - 2*cm, height - 2.5*cm, "SECURITY LEVEL: CLASS A")
        
        # Line Separator
        c.setStrokeColor(colors.black)
        c.setLineWidth(2)
        c.line(2*cm, height - 3.2*cm, width - 2*cm, height - 3.2*cm)

        # --- Document Info (Compact) ---
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(colors.black)
        c.drawString(2*cm, height - 4.5*cm, self._t("title", lang))
        
        c.setFont("Helvetica", 10)
        c.drawString(2*cm, height - 5.2*cm, f"{self._t('survey_id', lang)}: #{survey_data.get('id', 'N/A')}")
        c.drawString(8*cm, height - 5.2*cm, f"{self._t('date', lang)}: {survey_data.get('timestamp', now.strftime('%Y-%m-%d %H:%M'))}")
        
        # --- Results Box (Refined) ---
        c.setStrokeColor(colors.black)
        c.setLineWidth(0.5)
        c.setFillColor(colors.whitesmoke)
        c.roundRect(2*cm, height - 9*cm, width - 4*cm, 2.5*cm, 10, fill=1, stroke=1)
        
        c.setFillColor(colors.black)
        draw_label_value("mean_draft", f"{survey_data.get('draft_mean', 0):.4f} m", 2.5*cm, height - 7.5*cm, 5.5*cm)
        draw_label_value("confidence", f"{survey_data.get('confidence', 0)*100:.2f}%", 2.5*cm, height - 8.2*cm, 5.5*cm)
        draw_label_value("sea_state", f"{survey_data.get('sea_state', 'Unknown')}", 10*cm, height - 7.5*cm, 13*cm)
        
        # New: Displacement and TPC
        physics = survey_data.get("physics", {})
        draw_label_value("displacement", f"{survey_data.get('displacement', 0):,.1f} MT", 10*cm, height - 8.2*cm, 13*cm)
        
        # --- 2. Evidence Box (The "Money Shot") ---
        evidence_y_top = height - 10*cm
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.black)
        c.drawString(2*cm, evidence_y_top, self._t("evidence_title", lang))

        if evidence_path and os.path.exists(evidence_path):
            try:
                # --- Auto-Crop Logic (15% Top/Bottom) ---
                # Open image using PIL
                with Image.open(evidence_path) as img:
                    img_w, img_h = img.size
                    # Define crop box: (left, upper, right, lower)
                    # Cut 15% from top and 15% from bottom
                    crop_box = (0, int(img_h * 0.15), img_w, int(img_h * 0.85))
                    cropped_img = img.crop(crop_box)
                    
                    # Save temporary cropped image
                    temp_crop_path = filepath.replace(".pdf", "_crop.jpg")
                    cropped_img.save(temp_crop_path, quality=95)

                # Thick Border
                c.setStrokeColor(colors.navy)
                c.setLineWidth(3)
                img_width = 17*cm
                img_height = 9.5*cm
                img_x = 2*cm
                img_y = evidence_y_top - 0.5*cm - img_height
                
                c.rect(img_x, img_y, img_width, img_height, stroke=1, fill=0)
                
                # Image
                c.drawImage(temp_crop_path, img_x + 1, img_y + 1, width=img_width-2, height=img_height-2, preserveAspectRatio=True, mask='auto')
                
                # Cleanup temp file
                try:
                    os.remove(temp_crop_path)
                except:
                    pass
                
                # Tech Specs Table (Below Image)
                table_y = img_y - 0.8*cm
                c.setFillColor(colors.black)
                c.setFont("Courier", 8)
                tech_data = f"Resolution: 4K | TPC: {physics.get('tpc', 'N/A')} t/cm | Precision: {physics.get('precision', 'CubicSpline ISO-12217')}"
                c.drawCentredString(width/2, table_y, tech_data)
                
                # New: OCR Evidence Overlays in Report
                ocr_audit = survey_data.get("ocr_audit", {})
                if ocr_audit.get("detected_value"):
                    c.setFont("Helvetica-Bold", 9)
                    c.setFillColor(colors.green)
                    ocr_text = f"[{self._t('ocr_audit', lang)}: {ocr_audit['detected_value']} @ {ocr_audit['confidence']*100:.1f}%]"
                    c.drawString(img_x, img_y - 1.2*cm, ocr_text)
                    
                    # Cal status
                    c.setFillColor(colors.blue)
                    cal_text = f"[{self._t('cal_auto', lang)}: {self._t('cal_status', lang)}]"
                    c.drawRightString(img_x + img_width, img_y - 1.2*cm, cal_text)
                
                # Grid overlay on image (simulation of "Analysis")
                c.setStrokeColor(colors.cyan)
                c.setLineWidth(0.5)
                c.setDash(1, 4)
                c.line(img_x, img_y + img_height/2, img_x + img_width, img_y + img_height/2) # Horizon
                c.setDash()

            except Exception as e:
                print(f"PDF Image Error: {e}")
                c.drawString(2*cm, evidence_y_top - 2*cm, f"[Image error: {e}]")
        else:
            c.setFont("Helvetica", 10)
            c.drawString(2*cm, evidence_y_top - 1*cm, self._t("no_evidence", lang))

        # --- Digital Audit Trail (Compact) ---
        audit_y = 6*cm
        c.setLineWidth(1)
        c.setStrokeColor(colors.black)
        c.line(2*cm, audit_y, width - 2*cm, audit_y)
        
        c.setFont("Helvetica-Bold", 10)
        c.drawString(2*cm, audit_y - 0.5*cm, self._t("audit_title", lang))
        
        c.setFont("Courier", 7)
        audit_hash = self._generate_audit_hash(survey_data)
        unix_ts = int(time.time())
        
        c.drawString(2*cm, audit_y - 1.2*cm, f"{self._t('file_hash', lang)}: {audit_hash}")
        c.drawString(2*cm, audit_y - 1.6*cm, f"{self._t('timestamp', lang)}: {unix_ts} | {self._t('device_id', lang)}: PLIMSOLL-CORE-V2")
        
        # QR Code (Simulated)
        c.setStrokeColor(colors.black)
        c.setFillColor(colors.black)
        qr_size = 2*cm
        qr_x = width - 4*cm
        qr_y = audit_y - 2.5*cm
        c.rect(qr_x, qr_y, qr_size, qr_size, fill=0, stroke=1)
        c.rect(qr_x + 0.2*cm, qr_y + 1.4*cm, 0.4*cm, 0.4*cm, fill=1) # Top Left
        c.rect(qr_x + 1.4*cm, qr_y + 1.4*cm, 0.4*cm, 0.4*cm, fill=1) # Top Right
        c.rect(qr_x + 0.2*cm, qr_y + 0.2*cm, 0.4*cm, 0.4*cm, fill=1) # Bot Left
        
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(qr_x + qr_size/2, qr_y - 0.3*cm, "VERIFY")

        # --- 3. Legal Footer ---
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.darkgrey)
        legal_text = self._t("legal_footer_1", lang)
        legal_text_2 = self._t("legal_footer_2", lang)
        
        c.drawCentredString(width/2, 1.2*cm, legal_text)
        c.drawCentredString(width/2, 0.9*cm, legal_text_2)
        
        c.setFont("Helvetica-Oblique", 6)
        c.drawRightString(width - 2*cm, 2*cm, f"Page 1 of 1 | {report_id}")

        # Phase 26: Blockchain Notarization
        try:
            notary = BlockchainNotary()
            blockchain_record = notary.notarize_survey(survey_data)
            
            # Add Blockchain Verification Page (New Page)
            c.showPage()
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 800, self._t("blockchain_title", lang))
            
            c.setFont("Helvetica", 10)
            c.drawString(50, 770, self._t("blockchain_desc_1", lang))
            c.drawString(50, 755, self._t("blockchain_desc_2", lang))
            
            c.setFont("Courier", 9)
            c.drawString(50, 720, f"NODE VALIDATOR: {blockchain_record['node_validator']}")
            c.drawString(50, 705, f"BLOCK NUMBER:   {blockchain_record['block_number']}")
            c.drawString(50, 690, f"TIMESTAMP:      {blockchain_record['block_timestamp']} (UNIX)")
            c.drawString(50, 675, f"CONTENT HASH:   {blockchain_record['content_hash']}")
            c.drawString(50, 660, f"TRANSACTION ID: {blockchain_record['tx_id']}")
            
            # Draw "Verified" Shield
            c.setStrokeColorRGB(0.2, 0.8, 0.2)
            c.setFillColorRGB(0.9, 1.0, 0.9)
            c.rect(50, 600, 500, 40, fill=1)
            c.setFillColorRGB(0, 0.5, 0)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(70, 615, self._t("verified_shield", lang))
        except Exception as e:
            print(f"Blockchain Error: {e}")

        c.save()
        return filepath
