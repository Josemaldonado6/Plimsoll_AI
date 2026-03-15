"""
PLIMSOLL AI - INDUSTRIAL PLC BRIDGE (MODBUS TCP)
-----------------------------------------------
This bridge interfaces the Neural Hydrostatic Field engine with 
physical ship ballast hardware.
"""

from pymodbus.client import AsyncModbusTcpClient
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BallastPLCBridge:
    def __init__(self, host='127.0.0.1', port=502):
        self.host = host
        self.port = port
        self.client = None
        self.is_connected = False

    async def connect(self):
        if not self.client:
            self.client = AsyncModbusTcpClient(self.host, port=self.port)
        self.is_connected = await self.client.connect()
        if self.is_connected:
            logger.info(f"Connected to PLC at {self.host}:{self.port}")
        else:
            logger.error(f"Failed to connect to PLC at {self.host}:{self.port}")
        return self.is_connected

    async def disconnect(self):
        await self.client.close()
        self.is_connected = False

    async def read_tank_levels(self) -> list:
        """Reads 32-bit float tank levels from holding registers 0x0100."""
        if not self.is_connected:
            return []
        
        # In a real PLC, floats are usually 2 registers (32-bit)
        # We'll read 8 registers to get 4 tank levels
        response = await self.client.read_holding_registers(0x0100, 8)
        if response.isError():
            logger.error("Error reading tank levels from PLC")
            return []
        
        # Decoding logic would go here (converting 16-bit regs to 32-bit floats)
        # For now, returning mock-parsed values
        return [float(val) / 100.0 for val in response.registers[::2]] 

    async def write_oed_suggestion(self, target_draft: float):
        """Writes the AI-suggested OED to the PLC buffer (0x0200)."""
        if not self.is_connected:
            return False
        
        # Multiplier to pass as integer (fixed point 2 decimals)
        val_to_write = int(target_draft * 100)
        response = await self.client.write_register(0x0200, val_to_write)
        
        if not response.isError():
            logger.info(f"OED Suggestion {target_draft}m written to PLC.")
            return True
        return False

    async def check_safety_interlock(self) -> bool:
        """Reads the hardware safety flag (0x0500)."""
        if not self.is_connected:
            return False
        
        response = await self.client.read_coils(0x0500, 1)
        if not response.isError():
            return response.bits[0]
        return False
