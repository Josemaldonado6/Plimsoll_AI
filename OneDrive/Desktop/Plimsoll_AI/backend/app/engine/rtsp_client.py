import cv2
import time
import threading
from typing import Optional

class RTSPStreamer:
    """
    Handles connection to an RTSP/IP Camera stream.
    Optimized for low-latency reading by running a background thread to keep the buffer empty.
    """
    def __init__(self, source: str = "0"):
        self.source = source
        self.cap: Optional[cv2.VideoCapture] = None
        self.lock = threading.Lock()
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.latest_frame = None
        self.status = "DISCONNECTED"

    def start(self):
        if self.running:
            return

        print(f"[RTSP] Connecting to {self.source}...")
        try:
            # If source is digit, cast to int (webcam), else string (RTSP URL)
            src = int(self.source) if self.source.isdigit() else self.source
            self.cap = cv2.VideoCapture(src)
            
            if not self.cap.isOpened():
                self.status = "ERROR_CONNECTION"
                print(f"[RTSP] Failed to open {self.source}")
                return

            self.running = True
            self.status = "CONNECTED"
            self.thread = threading.Thread(target=self._update, daemon=True)
            self.thread.start()
            print(f"[RTSP] Stream started.")

        except Exception as e:
            self.status = f"ERROR: {str(e)}"
            print(f"[RTSP] Exception: {e}")

    def _update(self):
        while self.running and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                print("[RTSP] Frame read failed. Reconnecting...")
                self.status = "RECONNECTING"
                time.sleep(1)
                continue
            
            with self.lock:
                self.latest_frame = frame
                self.status = "STREAMING"
            
            # Limit to ~30fps to save CPU if needed, but for RTSP usually read as fast as possible to clear buffer
            time.sleep(0.01) 

        self.status = "STOPPED"

    def read(self):
        with self.lock:
            return self.latest_frame

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        if self.cap:
            self.cap.release()
        self.status = "DISCONNECTED"
        print("[RTSP] Stream stopped.")

# Singleton instance for global access
streamer = RTSPStreamer()
