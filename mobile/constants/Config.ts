import Constants from "expo-constants";

const getBackendUrl = () => {
    // 1. Host Machine IP (Robust Discovery)
    const hostUri = Constants.expoConfig?.hostUri || "";
    // On physical devices, hostUri often contains the IP:Port of the Metro server
    const manifestIp = hostUri.split(":")[0];

    // Priority: Expo Manifest IP > Verified LAN Fallback
    const DEV_IP = manifestIp || "192.168.1.160";

    // 2. Determine Environment
    const isDev = __DEV__;

    // 3. Construct URLs (Uvicorn sits on 8000)
    const host = isDev ? `${DEV_IP}:8000` : "api.plimsoll.ai";

    if (isDev) {
        console.log(`[CONFIG] Resolved DEV_IP: ${DEV_IP} (Source: ${manifestIp ? 'Expo' : 'Fallback'})`);
        console.log(`[CONFIG] WS_URL: ws://${host}/api/ws/drone`);
    }

    return {
        API_URL: `http://${host}/api`,
        WS_URL: `ws://${host}/api/ws/drone`,
    };
};

export const Config = getBackendUrl();
