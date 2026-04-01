import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTranslation } from 'react-i18next';


export default function OnboardingTour() {
    const [run, setRun] = useState(false);
    const { t } = useTranslation();

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
            content: t('onboarding.step_1'),
            disableBeacon: true,
        },
        {
            target: '.tour-telemetry-panel',
            content: t('onboarding.step_2'),
        },
        {
            target: '.tour-history-tab',
            content: t('onboarding.step_3'),
        },
        {
            target: '.tour-system-status',
            content: t('onboarding.step_4'),
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
                    primaryColor: '#fde047',
                    textColor: '#ffffff',
                    backgroundColor: '#0f172a',
                    overlayColor: 'rgba(2, 6, 23, 0.85)',
                    arrowColor: '#0f172a',
                },
                buttonNext: {
                    backgroundColor: '#fde047',
                    color: '#000000',
                    fontWeight: '900',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '1px',
                },
                buttonBack: {
                    color: '#fde047',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                },
                buttonSkip: {
                    color: '#94a3b8',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                }
            }}
            callback={handleJoyrideCallback}
        />
    );
}
