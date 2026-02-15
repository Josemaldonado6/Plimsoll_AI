import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTranslation } from 'react-i18next';

export default function OnboardingTour() {
    const { t } = useTranslation();
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Check if tour has been completed
        const tourCompleted = localStorage.getItem('plimsoll_tour_completed');
        if (!tourCompleted) {
            setRun(true);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('plimsoll_tour_completed', 'true');
        }
    };

    const steps: Step[] = [
        {
            target: '.tour-upload-zone',
            content: 'Start here! Drag and drop your drone footage to begin the AI analysis.',
            disableBeacon: true,
        },
        {
            target: '.tour-telemetry-panel',
            content: 'Monitor live drone telemetry and sea state conditions here.',
        },
        {
            target: '.tour-history-tab',
            content: 'Access your previous surveys and download legal PDF reports.',
        },
        {
            target: '.tour-system-status',
            content: 'Check system health and connected modules.',
        }
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            styles={{
                options: {
                    primaryColor: '#64ffda',
                    textColor: '#112240',
                    backgroundColor: '#e6f1ff',
                    overlayColor: 'rgba(2, 12, 27, 0.85)',
                },
                buttonNext: {
                    backgroundColor: '#64ffda',
                    color: '#0a192f',
                    fontWeight: 'bold',
                },
                buttonBack: {
                    color: '#112240',
                }
            }}
            callback={handleJoyrideCallback}
        />
    );
}
