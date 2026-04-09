/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: App.tsx (V5 EDITION)
 * -----------------------------------------------------------------------------
 */
import { useEffect } from 'react'
import { useStore } from './store/useStore';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// V5 COMPONENTS
import LayoutV5 from './components/LayoutV5';
import Step1Identity from './components/V5/Step1Identity';
import Step2Capture from './components/V5/Step2Capture';
import Step3Analysis from './components/V5/Step3Analysis';
import Step4Certify from './components/V5/Step4Certify';

// CORE COMPONENTS
import LandingPage from './components/LandingPage'
import { Login } from './components/Login';
import { getApiUrl } from './store/useStore';

// GLOBAL TUNNEL BYPASS: Ensures localtunnel/ngrok APIs return JSON instead of a warning HTML page
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

export default function App() {
    const { t } = useTranslation();
    const {
        showLanding, setShowLanding,
        activeTab, setActiveTab,
        isOnline, setIsOnline,
        currentResult, setCurrentResult,
        isAnalyzing, setIsAnalyzing,
        user, token,
        syncDrafts,
        vesselInfo,
        resetState
    } = useStore();

    // HANDSHAKE & SYNC LOGIC
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncDrafts();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setIsOnline, syncDrafts]);

    // MISSION CORE: ANALYSIS ENGINE
    const handleAnalyze = async (file: File, phase: 'INITIAL' | 'INTERIM' | 'FINAL') => {
        if (!file || !token) return;

        setIsAnalyzing(true);
        setCurrentResult(null); 
        
        const formData = new FormData();
        formData.append("video", file);
        if (vesselInfo?.imo) {
            formData.append("imo", vesselInfo.imo);
        }

        try {
            const response = await axios.post(getApiUrl("/api/analyze"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            })

            // SIMULATING PHYSICS CONVERGENCE (Visual Effect for Step 3)
            setTimeout(() => {
                const finalResult = { ...response.data };
                setCurrentResult(finalResult);
                
                // Persist to operation
                const activeOp = useStore.getState().activeOperationId;
                if (activeOp) {
                    useStore.getState().addScanToOperation(activeOp, {
                        id: finalResult.id || Date.now(),
                        phase: phase,
                        filename: file.name,
                        draft_mean: finalResult.draft_mean,
                        data_reliability: finalResult.confidence,
                        sea_state: finalResult.sea_state,
                        timestamp: new Date().toISOString(),
                        is_synced: isOnline ? 1 : 0
                    });
                }

                if (isOnline) syncDrafts();
                setActiveTab('Analysis'); // Move to Step 3 automatically after processing
            }, 2000);

        } catch (error: any) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Ensure Cortex Hub is online.");
        } finally {
            setIsAnalyzing(false);
        }
    }

    // MISSION CORE: EXPORT ENGINE
    const handleDownload = async (id: number, netCargo?: number) => {
        if (!token) return;
        try {
            const { i18n } = useTranslation();
            const lang = i18n.language || 'en';
            let urlStr = `/api/surveys/${id}/pdf?lang=${lang}`;
            if (netCargo !== undefined) {
                urlStr += `&net_cargo=${netCargo}`;
            }

            const response = await axios.get(getApiUrl(urlStr), {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    Authorization: `Bearer ${token}`
                }
            })

            const url = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `PLIMSOLL_CERT_ID${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            setTimeout(() => {
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }, 100)
        } catch (error) {
            console.error("Download failed", error)
            alert("Certification export failed. Retrying logic...")
        }
    }

    // FLOW CONTROL
    if (showLanding) {
        return <LandingPage onEnterApp={() => setShowLanding(false)} />
    }

    if (!user) {
        return <Login />
    }

    return (
        <LayoutV5>
            {activeTab === 'Identity' && <Step1Identity />}
            
            {activeTab === 'Capture' && (
                <Step2Capture onAnalyze={handleAnalyze} />
            )}
            
            {activeTab === 'Analysis' && (
                <Step3Analysis onNext={() => setActiveTab('Certify')} />
            )}
            
            {activeTab === 'Certify' && (
                <Step4Certify onExport={handleDownload} onReset={resetState} />
            )}
        </LayoutV5>
    )
}
