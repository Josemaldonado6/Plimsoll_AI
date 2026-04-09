import os
import sys
import threading
import subprocess
import signal
import psutil
import customtkinter as ctk
import time
from datetime import datetime

# ==============================================================================
# PLIMSOLL SOVEREIGN OVERSEER (V5 NATIVE HUB)
# ==============================================================================

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

# Design Tokens (Cyber-Dark Industrial)
COLOR_BG = "#0a0e1a"
COLOR_SURFACE = "#171b28"
COLOR_ACCENT = "#e9c349"
COLOR_SUCCESS = "#00e639"
COLOR_DANGER = "#ff4444"
COLOR_TEXT = "#b5b8c9"

class PlimsollOverseer(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Plimsoll Sovereign Overseer (V5 Control Hub)")
        self.geometry("1100x750")
        self.configure(fg_color=COLOR_BG)

        # Process Tracking
        self.processes = {
            "backend": None,
            "frontend": None,
            "tunnel": None,
            "audit": None
        }

        # Robust Path Management (Sovereign EXE Mode)
        if getattr(sys, 'frozen', False):
            # In EXE mode, we point to the absolute project root on this specific system
            self.ROOT_DIR = r"c:\Users\joseu\OneDrive\Desktop\Plimsoll_AI"
        else:
            # In script mode, we use the local path
            self.ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
            
        self.BACKEND_DIR = os.path.join(self.ROOT_DIR, "backend")
        self.FRONTEND_DIR = os.path.join(self.ROOT_DIR, "frontend")

        self.setup_ui()

    def setup_ui(self):
        # Grid Layout
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Left Sidebar (Controls)
        self.sidebar = ctk.CTkFrame(self, width=280, corner_radius=0, fg_color=COLOR_SURFACE)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(5, weight=1)

        # Title
        title_label = ctk.CTkLabel(self.sidebar, text="PLIMSOLL\nOVERSEER", font=ctk.CTkFont(family="Courier", size=24, weight="bold"), text_color=COLOR_ACCENT)
        title_label.grid(row=0, column=0, padx=20, pady=(30, 10))

        subtitle_label = ctk.CTkLabel(self.sidebar, text="SOVEREIGN COMMAND STATION", font=ctk.CTkFont(size=10, weight="bold"), text_color=COLOR_TEXT)
        subtitle_label.grid(row=1, column=0, padx=20, pady=(0, 30))

        # Buttons (Toggles)
        self.btn_backend = ctk.CTkButton(self.sidebar, text="START BACKEND", fg_color="transparent", border_width=2, text_color=COLOR_TEXT, hover_color="#2b3145", command=lambda: self.toggle_process("backend"))
        self.btn_backend.grid(row=2, column=0, padx=20, pady=10, sticky="ew")

        self.btn_tunnel = ctk.CTkButton(self.sidebar, text="START TUNNEL", fg_color="transparent", border_width=2, text_color=COLOR_TEXT, hover_color="#2b3145", command=lambda: self.toggle_process("tunnel"))
        self.btn_tunnel.grid(row=3, column=0, padx=20, pady=10, sticky="ew")

        self.btn_frontend = ctk.CTkButton(self.sidebar, text="START FRONTEND", fg_color="transparent", border_width=2, text_color=COLOR_TEXT, hover_color="#2b3145", command=lambda: self.toggle_process("frontend"))
        self.btn_frontend.grid(row=4, column=0, padx=20, pady=10, sticky="ew")

        # Top Right (Audit & Master Kill)
        self.btn_audit = ctk.CTkButton(self.sidebar, text="SYS AUDIT: STANDBY", fg_color="transparent", text_color=COLOR_ACCENT, border_width=2, border_color=COLOR_ACCENT, hover_color="#2b3145", command=self.run_audit)
        self.btn_audit.grid(row=6, column=0, padx=20, pady=10, sticky="ew")

        self.btn_kill_all = ctk.CTkButton(self.sidebar, text="EMERGENCY SHUTDOWN", fg_color=COLOR_DANGER, text_color="white", hover_color="#cc0000", command=self.kill_all)
        self.btn_kill_all.grid(row=7, column=0, padx=20, pady=20, sticky="ew")

        # Right Main Panel (Terminal Console)
        self.console_frame = ctk.CTkFrame(self, fg_color=COLOR_BG)
        self.console_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.console_frame.grid_rowconfigure(0, weight=1)
        self.console_frame.grid_columnconfigure(0, weight=1)

        self.textbox = ctk.CTkTextbox(self.console_frame, fg_color="#000000", text_color="#00e639", font=ctk.CTkFont(family="Consolas", size=12))
        self.textbox.grid(row=0, column=0, sticky="nsew")
        self.textbox.insert("0.0", "--- PLIMSOLL SOVEREIGN KERNEL V5 INITIALIZED ---\n\n")
        self.textbox.configure(state="disabled")

    def log(self, message, color="#00e639"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.textbox.configure(state="normal")
        # In tkinter Text, applying colors requires tags, but CTkTextbox simplifies text insertion.
        # CustomTkinter textbox doesn't easily support multi-color lines without raw tk access.
        # We will use the tk Text widget internally for colors.
        
        tk_textbox = self.textbox._textbox
        tag_name = f"color_{color.replace('#', '')}"
        tk_textbox.tag_config(tag_name, foreground=color)
        
        tk_textbox.insert("end", f"[{timestamp}] {message}\n", tag_name)
        tk_textbox.yview("end")
        self.textbox.configure(state="disabled")

    def kill_process_tree(self, pid):
        try:
            parent = psutil.Process(pid)
            for child in parent.children(recursive=True):
                self.log(f"Killing child process: {child.pid} ({child.name()})", "#ff8800")
                child.kill()
            parent.kill()
        except psutil.NoSuchProcess:
            pass

    def stop_process(self, name):
        if self.processes[name]:
            self.log(f"Sending termination signal to {name}...", "#ff8800")
            pid = self.processes[name].pid
            self.kill_process_tree(pid)
            self.processes[name] = None
            self.update_btn_state(name, False)
            self.log(f"{name.upper()} SHUTDOWN COMPLETE.", COLOR_DANGER)

    def update_btn_state(self, name, is_running):
        btn = getattr(self, f"btn_{name}")
        if is_running:
            btn.configure(fg_color=COLOR_SUCCESS, text_color="black", text=f"STOP {name.upper()}")
        else:
            btn.configure(fg_color="transparent", text_color=COLOR_TEXT, text=f"START {name.upper()}")

    def toggle_process(self, name):
        # Prevent rapid double-clicks from toggling twice
        current_time = time.time()
        if hasattr(self, '_last_click') and (current_time - self._last_click < 0.8):
            return
        self._last_click = current_time

        if self.processes[name]:
            self.stop_process(name)
        else:
            self.start_process(name)

    def stream_output(self, process, name, color):
        for line in iter(process.stdout.readline, b''):
            decoded = line.decode('utf-8', errors='replace').strip()
            if decoded:
                self.log(f"[{name.upper()}] {decoded}", color)
        # End of stream
        process.stdout.close()
        process.wait()
        
        if self.processes.get(name) == process:
            self.processes[name] = None
            self.update_btn_state(name, False)
            self.log(f"{name.upper()} Process Exited.", COLOR_DANGER)

    def start_process(self, name):
        cmd = []
        cwd = self.ROOT_DIR
        color = "#ffffff"

        if name == "backend":
            cmd = ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
            cwd = self.BACKEND_DIR
            color = "#00ffff" # Cyan
        elif name == "frontend":
            cmd = ["npm", "run", "dev"]
            cwd = self.FRONTEND_DIR
            color = "#ff00ff" # Magenta
        elif name == "tunnel":
            cmd = ["npx", "localtunnel", "--port", "8000", "--subdomain", "plimsoll-official-hub"]
            cwd = self.ROOT_DIR
            color = "#ffff00" # Yellow
        elif name == "audit":
            cmd = ["pytest", "backend/tests/test_sovereign_audit.py", "-v"]
            cwd = self.ROOT_DIR
            color = COLOR_ACCENT

        # Windows-specific process flags for better control
        creationflags = 0
        if os.name == 'nt':
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP
            # Always use shell=True on Windows to resolve aliases/scripts correctly
            use_shell = True
        else:
            use_shell = False

        self.log(f"INITIATING {name.upper()}...", "#ffffff")
        
        try:
            proc = subprocess.Popen(
                cmd,
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                shell=use_shell,
                creationflags=creationflags
            )
            self.processes[name] = proc
            if name != "audit":
                self.update_btn_state(name, True)
            
            thread = threading.Thread(target=self.stream_output, args=(proc, name, color), daemon=True)
            thread.start()
            
        except Exception as e:
            self.log(f"Error starting {name}: {str(e)}", COLOR_DANGER)

    def toggle_process(self, name):
        if self.processes[name]:
            self.stop_process(name)
        else:
            self.start_process(name)

    def run_audit(self):
        if self.processes["audit"]:
            self.log("Audit is already running.", COLOR_DANGER)
            return
        self.textbox.configure(state="normal")
        self.textbox._textbox.insert("end", "\n" + "="*50 + "\nSOVEREIGN SYSTEM AUDIT DIRECTIVE\n" + "="*50 + "\n\n", "color_#e9c349")
        self.textbox.configure(state="disabled")
        self.start_process("audit")

    def kill_all(self):
        self.log("INITIATING EMERGENCY ORBITAL STRIKE (KILL ALL)...", COLOR_DANGER)
        for name in list(self.processes.keys()):
            if self.processes[name]:
                self.stop_process(name)
        self.log("ALL SYSTEMS SILENCED.", COLOR_DANGER)

    def on_closing(self):
        self.kill_all()
        self.destroy()
        sys.exit(0)

if __name__ == "__main__":
    app = PlimsollOverseer()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
