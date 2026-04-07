import { View, Text, TextInput, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { styled } from "nativewind";
import { useDraftStore } from '../store/draftStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledButton = styled(TouchableOpacity);

import { saveSurvey } from '../db';
import * as Crypto from 'expo-crypto';
import { useTelemetry } from '../services/telemetry';
import { calculateCorrectedDisplacement, CorrectedDraftResult } from '../services/physics_bridge';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function DraftScreen() {
    const router = useRouter();
    const { drafts, updateDraft, density, setDensity, imo, vesselName } = useDraftStore();
    const { data: telemetry, connected, connect } = useTelemetry();
    const [result, setResult] = useState<CorrectedDraftResult | null>(null);

    useEffect(() => {
        connect();
    }, []);

    // Auto-calculate every time drafts or density change
    useEffect(() => {
        const mockHydrostatics = Array.from({ length: 15 }, (_, i) => {
            const d = i * 1.0;
            return {
                draft: d, displacement: d * d * 380, tpc: 42 + d * 0.5,
                lcf: d * 0.08 - 0.5, mtc: 200 + d * 8
            };
        });
        const calc = calculateCorrectedDisplacement(drafts, mockHydrostatics, density);
        setResult(calc);
    }, [drafts, density]);

    const handleAutoFill = () => {
        if (!telemetry?.waterline_y) return;
        // Map pixel waterline to approximate draft (calibration: 1px ≈ 0.0025m from EDGE_AI_OPTIMIZATION)
        const estimatedDraft = telemetry.waterline_y * 0.0025;
        const rounded = parseFloat(estimatedDraft.toFixed(2));
        ['mid_port', 'mid_stbd'].forEach(k => updateDraft(k as any, rounded));
    };

    const handleSave = async () => {
        const id = Crypto.randomUUID();
        const success = await saveSurvey(
            id, imo || "UNKNOWN_VESSEL",
            { fwd: (drafts.fwd_port + drafts.fwd_stbd) / 2, mid: (drafts.mid_port + drafts.mid_stbd) / 2, aft: (drafts.aft_port + drafts.aft_stbd) / 2 },
            density
        );
        if (success) router.back();
        else alert("Failed to save locally.");
    };

    const ReadingInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <StyledView className="flex-row items-center justify-between bg-plimsoll-lightnavy p-4 rounded-2xl mb-3 border border-white/5">
            <StyledText className="text-plimsoll-slate font-bold text-sm">{label}</StyledText>
            <StyledView className="flex-row items-center space-x-3">
                <StyledButton onPress={() => onChange(parseFloat((value - 0.01).toFixed(3)))}
                    className="w-9 h-9 bg-plimsoll-navy rounded-full items-center justify-center border border-plimsoll-cyan/20">
                    <StyledText className="text-plimsoll-cyan text-xl font-bold">-</StyledText>
                </StyledButton>
                <StyledInput
                    keyboardType="numeric" value={value.toFixed(2)}
                    onChangeText={(t) => onChange(parseFloat(t) || 0)}
                    className="w-[72px] text-center text-white text-lg font-mono font-bold bg-plimsoll-navy py-2 rounded-xl border border-white/10"
                />
                <StyledButton onPress={() => onChange(parseFloat((value + 0.01).toFixed(3)))}
                    className="w-9 h-9 bg-plimsoll-navy rounded-full items-center justify-center border border-plimsoll-cyan/20">
                    <StyledText className="text-plimsoll-cyan text-xl font-bold">+</StyledText>
                </StyledButton>
            </StyledView>
        </StyledView>
    );

    const confColor = !result ? '#64748B' : result.confidence >= 90 ? '#22c55e' : result.confidence >= 75 ? '#f59e0b' : '#ef4444';

    return (
        <StyledView className="flex-1 bg-plimsoll-navy">
            <Stack.Screen options={{
                title: "Draft Survey",
                headerRight: () => (
                    <StyledView className="flex-row items-center space-x-2 mr-4">
                        <StyledView className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
                        <StyledText className="text-white text-[10px] font-mono">{connected ? 'LIVE' : 'OFFLINE'}</StyledText>
                    </StyledView>
                )
            }} />

            {/* Live Telemetry Auto-Fill Banner */}
            {connected && telemetry && (
                <Animated.View entering={FadeIn} className="bg-plimsoll-cyan/10 border-b border-plimsoll-cyan/20 p-3 flex-row justify-between items-center px-5">
                    <StyledView>
                        <StyledText className="text-plimsoll-cyan text-[10px] font-bold uppercase tracking-widest">Live Vision</StyledText>
                        <StyledText className="text-white font-bold text-sm">{telemetry.waterline_y ? `${(telemetry.waterline_y * 0.0025).toFixed(2)} M` : 'NO READING'}</StyledText>
                    </StyledView>
                    <StyledButton onPress={handleAutoFill} className="bg-plimsoll-cyan/20 px-4 py-2 rounded-full border border-plimsoll-cyan/40">
                        <StyledText className="text-plimsoll-cyan text-xs font-bold">✦ AUTO-FILL</StyledText>
                    </StyledButton>
                </Animated.View>
            )}

            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>

                {/* Physics Result Card */}
                {result && (
                    <Animated.View entering={FadeInDown} className="bg-plimsoll-lightnavy border border-white/10 rounded-3xl p-5 mb-6">
                        <StyledView className="flex-row justify-between items-start mb-4">
                            <StyledView>
                                <StyledText className="text-plimsoll-slate text-[10px] font-bold uppercase tracking-widest">Corrected Displacement</StyledText>
                                <StyledText className="text-white text-3xl font-bold font-mono">
                                    {result.final_displacement_mt.toFixed(0)} <StyledText className="text-plimsoll-cyan text-xl">MT</StyledText>
                                </StyledText>
                            </StyledView>
                            <StyledView className="items-end">
                                <StyledText className="text-plimsoll-slate text-[10px] font-bold uppercase tracking-widest mb-1">Confidence</StyledText>
                                <StyledText className="text-2xl font-bold" style={{ color: confColor }}>{result.confidence.toFixed(0)}%</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledView className="flex-row justify-around border-t border-white/10 pt-4">
                            <StyledView className="items-center">
                                <StyledText className="text-plimsoll-slate text-[10px] mb-1">QM Draft</StyledText>
                                <StyledText className="text-white font-mono font-bold">{result.quarter_mean_draft.toFixed(3)}m</StyledText>
                            </StyledView>
                            <StyledView className="items-center">
                                <StyledText className="text-plimsoll-slate text-[10px] mb-1">Trim</StyledText>
                                <StyledText className="text-white font-mono font-bold">{result.raw_trim.toFixed(3)}m</StyledText>
                            </StyledView>
                            <StyledView className="items-center">
                                <StyledText className="text-plimsoll-slate text-[10px] mb-1">FTC</StyledText>
                                <StyledText className="text-plimsoll-cyan font-mono font-bold">{result.ftc >= 0 ? '+' : ''}{result.ftc.toFixed(4)}</StyledText>
                            </StyledView>
                            <StyledView className="items-center">
                                <StyledText className="text-plimsoll-slate text-[10px] mb-1">DWA</StyledText>
                                <StyledText className="text-plimsoll-cyan font-mono font-bold">{result.dwa.toFixed(2)}</StyledText>
                            </StyledView>
                        </StyledView>
                    </Animated.View>
                )}

                {/* Environment */}
                <StyledText className="text-plimsoll-cyan text-[10px] font-bold uppercase tracking-widest mb-3">Environment</StyledText>
                <ReadingInput label="Water Density (t/m³)" value={density} onChange={setDensity} />

                {/* Draft Stations */}
                {[
                    { title: 'Forward', keys: ['fwd_port', 'fwd_stbd'] as const },
                    { title: 'Midship', keys: ['mid_port', 'mid_stbd'] as const },
                    { title: 'Aft', keys: ['aft_port', 'aft_stbd'] as const },
                ].map(({ title, keys }) => (
                    <StyledView key={title} className="mb-6">
                        <StyledText className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">{title} Drafts</StyledText>
                        <ReadingInput label={`${title.toUpperCase()} PORT`} value={drafts[keys[0]]} onChange={(v) => updateDraft(keys[0], v)} />
                        <ReadingInput label={`${title.toUpperCase()} STBD`} value={drafts[keys[1]]} onChange={(v) => updateDraft(keys[1], v)} />
                    </StyledView>
                ))}

                {/* Save */}
                <StyledButton onPress={handleSave} className="bg-plimsoll-cyan py-4 rounded-2xl items-center mb-12">
                    <StyledText className="text-plimsoll-navy font-bold text-lg uppercase tracking-widest">COMMIT SURVEY</StyledText>
                </StyledButton>

            </ScrollView>
        </StyledView>
    );
}
