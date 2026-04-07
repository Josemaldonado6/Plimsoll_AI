import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { styled } from "nativewind";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTelemetry } from '../services/telemetry';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(TouchableOpacity);

const { width } = Dimensions.get('window');

export default function AutomationScreen() {
    const { data: telemetry, connected } = useTelemetry();
    const [activeMission, setActiveMission] = useState<string | null>(null);

    const MissionCard = ({ title, icon, description, type }: any) => (
        <Animated.View entering={FadeInUp.delay(200)}>
            <StyledButton
                onPress={() => setActiveMission(type)}
                className={`p-6 rounded-3xl mb-4 border ${activeMission === type ? 'bg-plimsoll-cyan/20 border-plimsoll-cyan' : 'bg-plimsoll-lightnavy border-white/10'}`}
            >
                <StyledView className="flex-row items-center justify-between mb-4">
                    <StyledView className={`p-3 rounded-2xl ${activeMission === type ? 'bg-plimsoll-cyan' : 'bg-plimsoll-navy'}`}>
                        <MaterialCommunityIcons name={icon} size={28} color={activeMission === type ? '#001A2C' : '#00E5FF'} />
                    </StyledView>
                    {activeMission === type && (
                        <StyledView className="bg-plimsoll-cyan px-3 py-1 rounded-full">
                            <StyledText className="text-plimsoll-navy text-[10px] font-bold">ACTIVE</StyledText>
                        </StyledView>
                    )}
                </StyledView>
                <StyledText className="text-white text-xl font-bold mb-1">{title}</StyledText>
                <StyledText className="text-plimsoll-slate text-xs leading-5">{description}</StyledText>
            </StyledButton>
        </Animated.View>
    );

    const StatItem = ({ label, value, unit, icon }: any) => (
        <StyledView className="bg-plimsoll-lightnavy border border-white/5 p-4 rounded-2xl w-[48%] mb-4">
            <StyledView className="flex-row items-center space-x-2 mb-2">
                <Ionicons name={icon} size={14} color="#64748B" />
                <StyledText className="text-plimsoll-slate text-[10px] font-bold uppercase tracking-widest">{label}</StyledText>
            </StyledView>
            <StyledView className="flex-row items-baseline space-x-1">
                <StyledText className="text-white text-2xl font-mono font-bold">{value}</StyledText>
                <StyledText className="text-plimsoll-cyan text-xs font-bold">{unit}</StyledText>
            </StyledView>
        </StyledView>
    );

    return (
        <StyledView className="flex-1 bg-plimsoll-navy">
            <Stack.Screen options={{
                title: "Mission Control",
                headerTransparent: true,
                headerTitleStyle: { color: 'white', fontWeight: 'bold' },
            }} />

            <ScrollView className="flex-1 pt-24 px-6" showsVerticalScrollIndicator={false}>

                {/* Drone Status Banner */}
                <Animated.View entering={FadeInUp} className="bg-plimsoll-lightnavy/50 p-6 rounded-3xl border border-white/10 mb-8 overflow-hidden">
                    <StyledView className="flex-row justify-between items-center mb-6">
                        <StyledView>
                            <StyledText className="text-plimsoll-slate text-xs font-bold uppercase tracking-widest mb-1">Vehicle Status</StyledText>
                            <StyledText className="text-white text-2xl font-bold">DJI M350 RTK</StyledText>
                        </StyledView>
                        <StyledView className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-500'}`} />
                    </StyledView>

                    <StyledView className="flex-row flex-wrap justify-between">
                        <StatItem label="Altitude" value={telemetry?.altitude?.toFixed(1) || "0.0"} unit="M" icon="airplane" />
                        <StatItem label="Battery" value={telemetry?.battery || "0"} unit="%" icon="battery-charging" />
                        <StatItem label="Satellites" value="18" unit="GNSS" icon="planet" />
                        <StatItem label="Distance" value="124" unit="M" icon="map" />
                    </StyledView>
                </Animated.View>

                {/* Mission Selection */}
                <StyledText className="text-plimsoll-cyan text-xs font-bold uppercase tracking-widest mb-4">Autonomous Protocols</StyledText>

                <MissionCard
                    title="Full Hull Orbit"
                    icon="ship-wheel"
                    type="ORBIT"
                    description="Autonomous 360° circumnavigation to detect all draft marks (FWD, MID, AFT) in a single flight spree."
                />

                <MissionCard
                    title="Precision Station"
                    icon="target"
                    type="STATION"
                    description="High-stability hover over a single marker for high-precision density-corrected visual analysis."
                />

                <MissionCard
                    title="Safety Sentinel Scan"
                    icon="shield-check"
                    type="SENTINEL"
                    description="Computer Vision sweep of the deck to detect HSE violations and obstacle hazards."
                />

                {/* Control Actions */}
                <StyledView className="flex-row space-x-4 mb-10 pt-4">
                    <StyledButton className="flex-1 bg-red-500/10 border border-red-500/30 py-4 rounded-2xl items-center flex-row justify-center space-x-2">
                        <Ionicons name="stop-circle" size={20} color="#ef4444" />
                        <StyledText className="text-red-500 font-bold">ABORT</StyledText>
                    </StyledButton>

                    <StyledButton
                        disabled={!activeMission || !connected}
                        className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center space-x-2 ${activeMission && connected ? 'bg-plimsoll-cyan' : 'bg-plimsoll-slate/20'}`}
                    >
                        <Ionicons name="play" size={20} color={activeMission && connected ? '#001A2C' : '#64748B'} />
                        <StyledText className={`font-bold ${activeMission && connected ? 'text-plimsoll-navy' : 'text-plimsoll-slate'}`}>
                            INITIALIZE
                        </StyledText>
                    </StyledButton>
                </StyledView>

            </ScrollView>
        </StyledView>
    );
}
