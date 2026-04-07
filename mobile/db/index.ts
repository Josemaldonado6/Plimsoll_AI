import * as SQLite from 'expo-sqlite';

// Initialize Database
export const db = SQLite.openDatabaseSync('plimsoll.db');

// Schema Migration
export const initDatabase = async () => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            
            -- Vessels Table (Cached OSINT Data)
            CREATE TABLE IF NOT EXISTS vessels (
                imo TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT,
                flag TEXT,
                loa REAL,
                beam REAL,
                last_updated TEXT
            );

            -- Surveys Table (Draft Readings)
            CREATE TABLE IF NOT EXISTS surveys (
                id TEXT PRIMARY KEY, -- UUID
                vessel_imo TEXT,
                location_name TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                
                -- Draft Readings
                draft_fwd_port REAL,
                draft_fwd_stbd REAL,
                draft_aft_port REAL,
                draft_aft_stbd REAL,
                draft_mid_port REAL,
                draft_mid_stbd REAL,
                
                -- Environment
                water_density REAL DEFAULT 1.025,
                
                -- Sync Status (0=Pending, 1=Synced)
                is_synced INTEGER DEFAULT 0,
                server_id INTEGER -- ID on the backend after sync
            );
        `);
    } catch (e) {
        console.error("Database Init Failed", e);
    }
};

// CRUD Operations

export interface SurveyRecord {
    id: string;
    vessel_imo: string;
    timestamp: string;
    draft_mean: number; // calculated
    is_synced: number;
}

export const saveSurvey = async (
    id: string,
    imo: string,
    drafts: { fwd: number, mid: number, aft: number },
    density: number
) => {
    try {
        const mean = (drafts.fwd + 6 * drafts.mid + drafts.aft) / 8; // Quarter Mean
        await db.runAsync(
            `INSERT INTO surveys (id, vessel_imo, draft_fwd_port, draft_mid_port, draft_aft_port, water_density, is_synced) 
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [id, imo, drafts.fwd, drafts.mid, drafts.aft, density]
        );
        console.log("Survey Saved Locally:", id);
        return true;
    } catch (e) {
        console.error("Save Failed:", e);
        return false;
    }
};

export const getLocalSurveys = async (): Promise<SurveyRecord[]> => {
    try {
        const result = await db.getAllAsync(
            `SELECT * FROM surveys ORDER BY timestamp DESC`
        );
        return result as SurveyRecord[];
    } catch (e) {
        console.error("Fetch Failed:", e);
        return [];
    }
};
