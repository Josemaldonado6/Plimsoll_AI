import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { cn } from '../lib/utils';
import { useStore, getApiUrl } from '../store/useStore';

export default function HistoryLog() {
    const { t, i18n } = useTranslation();
    const { theme, history, setHistory, user, token } = useStore();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;
            try {
                const response = await axios.get(getApiUrl("/api/history"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user, token, setHistory]);

    const handleDownload = async (id: number) => {
        if (!token) return;
        try {
            const currentLang = i18n.language.split('-')[0];
            const response = await axios.get(getApiUrl(`/api/surveys/${id}/pdf?lang=${currentLang}`), {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.type !== 'application/pdf') {
                console.error("Wrong content type:", response.data.type);
                alert("The server returned an invalid file format. Please try again.");
                return;
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PLIMSOLL_Report_ID${id}.pdf`);
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download report. The analysis might still be processing.");
        }
    };

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center text-[#8892b0] py-20">{t('dashboard.no_history')}</div>
                ) : (
                    history.map((survey) => (
                        <div key={survey.id} className={cn(
                            "p-6 rounded-xl border transition-all flex items-center justify-between group",
                            theme === 'dark' ? "bg-[#112240] border-[#8892b0]/10 hover:border-[#64ffda]/30" : "bg-white border-gray-200 hover:border-blue-400 shadow-sm"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-[#64ffda]/10 flex items-center justify-center text-[#64ffda] font-mono font-bold">
                                    {survey.draft_mean.toFixed(2)}
                                </div>
                                <div>
                                    <h3 className={cn("font-semibold", theme === 'light' && "text-gray-900")}>
                                        {new Date(survey.timestamp).toLocaleString(i18n.language)}
                                    </h3>
                                    <p className="text-sm text-[#8892b0] font-mono mt-1">
                                        {survey.filename.substring(0, 8)}...mp4
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(survey.id)}
                                className={cn(
                                    "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                    theme === 'dark' ? "hover:bg-[#64ffda]/20 text-[#64ffda]" : "hover:bg-blue-100 text-blue-600"
                                )}
                                title="Download PDF"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
