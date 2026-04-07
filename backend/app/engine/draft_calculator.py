# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: draft_calculator.py
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
import cv2
import numpy as np
import os
import logging
import subprocess
import json
import tempfile
import sys
from typing import List, Dict, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .physics_v2 import NavalArchitect, MOCK_HYDRO_DATA
from .notary import BlockchainNotary
from .enhancer import AtmosphericEnhancer
from app.engine.rtsp_client import streamer

# [ORDER 66] Legacy DraftSurveyor has been deprecated. 
# Plimsoll V4 now operates exclusively via AIDraftSurveyorV4 in ai_vision.py.
