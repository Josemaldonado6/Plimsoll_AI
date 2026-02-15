# PLIMSOLL AI: STRATEGIC ROADMAP (2026-2028)
**Mode:** Chief Product Officer (CPO) & Naval Architect Standard
**Status:** Living Document / Vision Statement

---

# 1. THE PLIMSOLL MANIFESTO

### The Mission
To eliminate the archaic subjectivity of human observation in global maritime commerce. PLIMSOLL AI exists to replace "estimates" with **absolute data**, ensuring that the waterline of a vessel is no longer a matter of opinion, but a matter of cryptographic truth.

### The Standard: "Zero-Tolerance for Error"
In an industry where a 2cm error in draft measurement can represent $50,000 USD in lost cargo or fuel, "good enough" is a failure. We build for the **99.9% precision**—where the software understands the physics of the sea, the properties of the water, and the structural integrity of the hull better than any human surveyor.

---

# 2. TECHNICAL ROADMAP TO DOMINATION

The following expansion phases are designed to move PLIMSOLL from a local tool to a global maritime protocol.

## PHASE 1: THE PERFECT EYE (Q1-Q2 2026)
*Target: Optical Superiority in Adverse Conditions*

*   **Wave-Cancellation Algorithm (WCA-v1):** 
    *   Implementation of temporal rolling averages at 60fps to mathematically "flatten" the sea surface.
    *   Statistical estimation of the mean waterline even in Sea State 4 (Moderate).
*   **Atmospheric Resilience (AR):** 
    *   Neural filters for Fog-Penetration and Low-Light Enhancement using Generative Adversarial Networks (GANs).
    *   Ensuring 24/7 operational capability regardless of port weather.
*   **Auto-Scale Calibration:** 
    *   Computer vision detection of the **Plimsoll Mark** (the disk and lines) to establish a baseline "Pixel-to-Meter" ratio.
    *   Elimination of manual input; the software "knows" the scale by looking at the ship's brandings.

## PHASE 2: THE PHYSICS ENGINE (Q3-Q4 2026)
*Target: Hydrostatic & Naval Intelligence*

*   **Digital Hydrostatic Tables:** 
    *   OCR ingestion of ship stability booklets. The system cross-references the measured draft with the vessel's specific **TPC (Tons per Centimeter)** to calculate cargo weight instantly.
*   **Automatic Trim & List Correction:** 
    *   Simultaneous detection of multiple draft marks (Aft, Midship, Forward).
    *   Use of the drone's IMU/Horizon data to correct for vessel inclination (List) and longitudinal pitch (Trim).
*   **IoT Salinity Integration:** 
    *   Direct API integration with water density sensors.
    *   Automatic "Dock Water Allowance" (DWA) corrections based on real-time salinity at the port of inspection.

## PHASE 3: THE PILOT'S ECOSYSTEM (Q1-Q2 2027)
*Target: Mobility & Edge Autonomy*

*   **Plimsoll Mobile App (React Native):** 
    *   Offline-first processing for extreme remote environments.
    *   Real-time telemetry streaming from the drone to the surveyor's tablet.
*   **Edge Computing (A-Series/M-Series Optimization):** 
    *   Migration of YOLOv8 and PaddleOCR models to run locally on mobile hardware (CoreML/TensorFlow Lite).
    *   0-latency analysis without requiring cloud uplink.
*   **DJI Flight Automation:** 
    *   Automated "Hull-Orbit" missions. The drone follows a pre-defined path based on ship length to capture all reference marks autonomously.

## PHASE 4: THE GLOBAL STANDARD (Q3-Q4 2027+)
*Target: Legal and Enterprise Notarization*

*   **Blockchain Notarization Layer:** 
    *   Every report hash (SHA-256) is committed to a private Hyperledger or public Ethereum L2.
    *   Creation of an "Immutability Certificate" that is universally recognized in maritime courts.
*   **ERP API Gateway:** 
    *   Native connectors for SAP, Oracle, and Navis N4.
    *   Direct feeding of draft data into port management and billing systems.
*   **Digital Twin & Structural Audit:** 
    *   Expansion beyond draft survey to 3D photogrammetry of the hull.
    *   Detection of hull fouling (barnacles), corrosion, and structural dents during the same flight.

## PHASE 5: THE SINGULARITY (100% AI AUTOMATION)
*Target: The Autonomous Enterprise (Zero-Touch Money Machine)*

*   **AI-Powered Universal Academy (Auto-Certification):**
    *   **Tech Stack:** HeyGen (Avatar Video) + GPT-4 (Contextual Translation).
    *   **Functionality:** Automatic generation of "Plimsoll Certified Pilot" courses. Code updates trigger auto-regeneration of video tutorials in 50 languages. Users pay, learn from AI Avatars, pass automated exams, and receive digital certificates instantly.
*   **The Self-Selling Engine (Sales without Humans):**
    *   **Tech Stack:** Interactive Demos (Arcade/Navattic) + Conversational AI (Vapi.ai).
    *   **Functionality:** A living Sales Page where users talk to the website. The AI demonstrates specific use-cases, handles objections (e.g., ROI calculations), and processes Stripe payments without a single human meeting.
*   **Augmented Reality Onboarding (Support without Humans):**
    *   **Tech Stack:** WebXR + Mobile Computer Vision.
    *   **Functionality:** Mobile App scans the client's drone and uses AR overlays (green/red arrows) to guide physical calibration and pre-flight checks. The App physically prevents takeoff if the setup is incorrect.
*   **Autonomous Client Acquisition (Marketing without Humans):**
    *   **Tech Stack:** Programmatic SEO + AI Cold Outreach Agent.
    *   **Functionality:**
        *   **Programmatic SEO:** Auto-generation of thousands of specific landing pages (e.g., "Draft Survey for Coal in Rotterdam").
        *   **AI Outreach:** Monitoring of global maritime traffic (AIS Data) to identify incoming vessels, find the responsible agency, and email a personalized proposal with a pre-generated "Demo" report.

> **Result:** A Decentralized Autonomous Enterprise where CAC approaches $0 and Net Margin approaches 99%.

---

# 3. THE QUALITY DOCTRINE (ISO/IEC 25010 COMPLIANCE)

To transition from a pioneer tool to critical world infrastructure, PLIMSOLL AI adheres to a "No-Failure" engineering philosophy. Our development lifecycle is governed by the following pillars of excellence:

### 1. RELIABILITY & STABILITY (Fault-Tolerant Infrastructure)
*   **Engineering Standard:** ISO/IEC 25010 Reliability Compliance.
*   **Operational Goal:** 99.99% Guaranteed Uptime (SLA-Grade).
*   **Mechanism:** Migration to a **Self-Healing Kubernetes (K8s) Cluster**. Automated health probes will detect AI inference hangs or memory leaks, triggering micro-service recycling in < 50ms without session disruption.
*   **Resilience Testing:** Implementation of **Chaos Engineering** protocols (Gremlin/Chaos Mesh) to verify system behavior during artificial network partitions, latency spikes, and container deaths.

### 2. PERFORMANCE EFFICIENCY (Low-Latency Processing)
*   **Inference Standard:** Strict Latency Budgets (< 200ms per frame).
*   **Optimization Layer:** Porting core bottleneck logic from native Python to **Cython/C++ extensions** and utilizing **WebAssembly (WASM)** for browser-side pre-processing.
*   **Global Distribution:** Deployment of **Edge-CDNs** and Load Balancing to ensure that a surveyor in the Port of Singapore experienced the same sub-second responsiveness as one in Rotterdam or Veracruz.

### 3. SECURITY & DATA PRIVACY (Fortress-Level Integrity)
*   **Audit Standard:** OWASP Top 10 & ISO 27001 Preparedness.
*   **Mechanism:** Mandatory **AES-256 Encryption-at-Rest** for all telemetry, evidence images, and generated PDF reports.
*   **DevSecOps Pipeline:** Automated **SAST (Static Analysis)** and **DAST (Dynamic Analysis)** scanning on every PR. Any code containing vulnerable dependencies or injection vectors is automatically rejected from the Main branch.
*   **Access Control:** Corporate-grade **MFA (Multi-Factor Authentication)** and Role-Based Access Control (RBAC) to ensure per-vessel data isolation.

### 4. MAINTAINABILITY & CODE QUALITY (Zero-Debt Policy)
*   **Software Architecture:** Clean Onion Architecture with strict separation of Domain, Logic, and Infrastructure layers.
*   **Testing Rigor:** Mandatory **Code Coverage > 90%** for all core engine modules.
*   **Type Safety:** Strict **TypeScript** configurations and **Python Type Hints** enforced via MyPy to eliminate runtime type errors.
*   **The "Clean Repository" Rule:** Blocking Git Hooks using Black (Formatter) and Flake8 (Linter). Code that is not "Clean" by standard is not deployable.

---

# 5. INTEGRATIONS & PARTNERSHIPS
- [ ] Integration with Navis N4 (TOS) via API.
- [ ] Data push to Lloyd's Register 'Class Direct'.
- [ ] Partnerships with P&I Clubs for premium reductions.

# 6. GLOBAL EXPANSION LAYER (LINGUISTIC DOMINATION)
## Phase 1 (Foundation)
- [ ] Native EN/ES support with Hot-Swap UI.
- [ ] Internationalization (i18n) architecture implementation.

## Phase 2 (The BRICS Expansion)
- [ ] Portuguese (PT-BR) support for Iron Ore markets (Brazil).
- [ ] Mandarin (ZH-CN) support for Soy/Grain markets (China).

## Phase 3 (The Oil Trade)
- [ ] Arabic (AR) support with RTL layout for Middle East interfaces.

## Phase 4 (The Universal Translator)
- [ ] AI-powered automatic translation of comments/observations in reports.


**Mode:** Chief Strategy Officer (CSO) & Business Architect
**Objective:** Scale globally as a "One-Man Unicorn" with Zero-Touch Operations.

### PILLAR 1: ZERO-TOUCH OPERATIONS (Automatización Total)
*Meta:* Que el usuario en Singapur compre, use y reciba factura sin intervención humana.
*   **Q2 2026:** Integración de **Stripe Connect** para cobros globales en USD/EUR/SGD.
*   **Q2 2026:** Sistema de "Self-Onboarding". Tutoriales interactivos dentro de la app (Walkme/Intro.js) para que el capitán aprenda a usar el software sin soporte técnico.
*   **Q3 2026:** Generación automática de Facturas (Invoicing API) y cálculo de impuestos internacionales (VAT/GST).

### PILLAR 2: THE CORPORATE FACADE (Percepción de Grandeza)
*Meta:* Parecer una corporación de 500 empleados siendo solo uno.
*   **Q2 2026:** Lanzamiento de "PLIMSOLL.AI". Landing page de conversión agresiva con casos de éxito (Case Studies).
*   **Q3 2026:** Setup de "Virtual HQ". Direcciones físicas virtuales en Delaware (US) y Londres (UK) para correspondencia corporativa.
*   **Q3 2026:** Despliegue de Bots de Soporte (AI Support Agents) entrenados con la documentación técnica para responder tickets 24/7.

### PILLAR 3: FINANCIAL & LEGAL STRUCTURE (Estructura Global)
*Meta:* Recibir dinero institucional y proteger el activo.
*   **Q4 2026:** Constitución de **LLC en Delaware** (vía Stripe Atlas) para bancarización en EE.UU.
*   **Q4 2026:** Registro de Marca Internacional (WIPO Madrid System) en clases de Software Marítimo.
*   **Q1 2027:** Auditoría de Seguridad SOC2 Type II (Requisito para venderle a Enterprise).

### PILLAR 4: THE GOD SEAL (Certificación & Alianzas)
*Meta:* Volverse el estándar obligatorio de la industria.
*   **2027-2028:** Obtención del **"Type Approval Certificate"** de DNV (Det Norske Veritas) o Lloyd's Register.
*   *Efecto:* Una vez certificado, las aseguradoras (P&I Clubs) exigirán el uso de PLIMSOLL para validar pólizas de carga.
*   **2028:** API Integration con Terminal Operating Systems (TOS) como Navis N4.

---

# 5. GLOSSARY OF VICTORY

We measure our success by these non-negotiable KPIs:

| Metric | Target | Description |
| :--- | :--- | :--- |
| **Draft Precision** | < 0.1% | Absolute margin of error vs. manual measurement. |
| **Inference Latency** | < 5s | Time from video capture to data stabilization. |
| **Legal Admissibility** | 100% | Reports accepted as primary evidence by major P&I Clubs. |
| **Uptime** | 99.98% | System availability for 24/7 port operations. |

**The future of maritime survey is autonomous. The future is Plimsoll.**
