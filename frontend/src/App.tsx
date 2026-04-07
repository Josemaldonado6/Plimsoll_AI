/*
 * -----------------------------------------------------------------------------
 * PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
 * ARCHIVO: App.tsx
 *
 * DERECHOS DE AUTOR / COPYRIGHT:
 * (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
 *
 * PROPIEDAD INTELECTUAL:
 * Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
 * son propiedad exclusiva de su autor. Queda prohibida su reproducción,
 * distribución o uso sin una licencia otorgada por escrito.
 *
 * REGISTRO:
 * Protegido bajo la Ley Federal del Derecho de Autor (México) y
 * Tratados Internacionales de la OMPI.
 *
 * CONFIDENCIALIDAD:
 * Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
 * constituye un delito federal.
 * -----------------------------------------------------------------------------
 */
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

import DronePilot from './components/DronePilot'
import LandingPage from './components/LandingPage'
import DraftDashboard from './components/DraftDashboard';
import { useStore, getApiUrl } from './store/useStore';
import { Login } from './components/Login';
import SystemConfig from './components/SystemConfig';
import HistoryLog from './components/HistoryLog';
import Layout from './components/Layout';

export default function App() {
    const {
        showLanding, setShowLanding,
        activeTab,
        theme,
        isOnline, setIsOnline,
        currentResult, setCurrentResult,
        isAnalyzing, setIsAnalyzing,
        user, token,
        syncDrafts,
        vesselInfo
    } = useStore();

    const [file, setFile] = useState<File | null>(null)
    const [analysisStatus, setAnalysisStatus] = useState<string>('')
    const inputRef = useRef<HTMLInputElement>(null)


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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            handleAnalyze(selectedFile); // Trigger auto-analysis
        }
    }

    const handleAnalyze = async (fileToAnalyze?: File) => {
        const fileToUse = fileToAnalyze || file;
        if (!fileToUse || !token) return;

        setIsAnalyzing(true);
        setAnalysisStatus("Initializing Neural Pipeline...");
        setCurrentResult(null); // Clear previous results
        const formData = new FormData();
        formData.append("video", fileToUse);
        if (vesselInfo?.imo) {
            formData.append("imo", vesselInfo.imo);
        }

        try {
            setAnalysisStatus("Neural Networks Warming Up...");
            // Simultaneous wait for upload and small delay for UI effect
            const response = await axios.post(getApiUrl("/api/analyze"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    if (percentCompleted < 100) {
                        setAnalysisStatus(`Uploading Video Payload: ${percentCompleted}%`);
                    } else {
                        setAnalysisStatus("Cortex Engine: Processing Frames...");
                    }
                }
            })

            setAnalysisStatus("Running YOLOv8 + SAM Segmentation...");
            await new Promise(r => setTimeout(r, 800)); // Visual feedback for user

            setAnalysisStatus("Detecting Waterline & Draft Marks...");
            const vesselResponse = await axios.get(getApiUrl(`/api/ship/9406087`), {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAnalysisStatus("Physics Engine: Calculating Displacement...");
            const finalResult = {
                ...response.data,
                ...vesselResponse.data,
                vessel_name: vesselResponse.data.name,
                vessel_imo: vesselResponse.data.imo || "9406087",
                vessel_flag: vesselResponse.data.flag,
                vessel_type: vesselResponse.data.type,
                vessel_loa: vesselResponse.data.loa,
                vessel_beam: vesselResponse.data.beam,
                logistics: vesselResponse.data.logistics,
                risk_score: vesselResponse.data.risk_score
            };

            setCurrentResult(finalResult);

            // Add to persistent history
            useStore.getState().addSurvey({
                id: Date.now(),
                filename: fileToUse.name,
                draft_mean: finalResult.draft_mean,
                confidence: finalResult.confidence,
                sea_state: finalResult.sea_state,
                timestamp: new Date().toISOString(),
                is_synced: isOnline ? 0 : 0 // Mark for sync
            });

            if (isOnline) syncDrafts(); // Trigger immediate sync if online
            setAnalysisStatus("Analysis Complete.");

        } catch (error: any) {
            console.error("Analysis failed", error)
            const errorMsg = error.response?.status === 422
                ? `Analysis Rejected: ${error.response.data.detail || "Invalid video quality or no frames found."}`
                : "Analysis failed. Ensure backend is running.";
            alert(errorMsg);
        } finally {
            setIsAnalyzing(false);
            setAnalysisStatus("");
        }
    }



    const handleDownload = async (id: number) => {
        if (!token) return;
        try {
            // Temporarily default to 'en' until i18n is exposed to store or passed differently,
            // or we could skip language passing since the backend uses translation fallback.
            const response = await axios.get(getApiUrl(`/api/surveys/${id}/pdf?lang=en`), {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.type !== 'application/pdf') {
                console.error("Wrong content type:", response.data.type);
                alert("The server returned an invalid file format. Please try again.");
                return;
            }

            const url = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `PLIMSOLL_Report_ID${id}.pdf`)
            document.body.appendChild(link)
            link.click()

            setTimeout(() => {
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            }, 100)
        } catch (error) {
            console.error("Download failed", error)
            alert("Failed to download report. The analysis might still be processing.")
        }
    }



    if (showLanding) {
        return <LandingPage onEnterApp={() => setShowLanding(false)} />
    }

    if (!user) {
        return <Login />
    }

    return (
        <Layout>
            {activeTab === "Radar Survey" && (
                <div className="flex-1">
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleChange}
                    />
                    <DraftDashboard
                        data={currentResult}
                        onConfirm={() => console.log("Confirmed")}
                        onUpload={() => inputRef.current?.click()}
                        onExport={handleDownload}
                        onEnrich={(enrichedData) => {
                            setCurrentResult({
                                ...currentResult,
                                ...enrichedData,
                                vessel_name: enrichedData.name,
                                vessel_imo: enrichedData.imo,
                                vessel_flag: enrichedData.flag,
                                vessel_type: enrichedData.type,
                                vessel_loa: enrichedData.loa,
                                vessel_beam: enrichedData.beam,
                                logistics: enrichedData.logistics,
                                risk_score: enrichedData.risk_score
                            });
                        }}
                        theme={theme}
                        isAnalyzing={isAnalyzing}
                        analysisStatus={analysisStatus}
                    />
                </div>
            )}

            {activeTab === "Drone Pilot" && (
                <div className="w-full h-full">
                    <DronePilot theme={theme} />
                </div>
            )}

            {activeTab === "History Log" && (
                <HistoryLog />
            )}

            {activeTab === "System Config" && (
                <SystemConfig />
            )}
        </Layout>
    )
}
