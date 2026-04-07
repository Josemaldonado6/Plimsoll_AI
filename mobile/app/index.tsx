import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, ViewStyle, TextStyle } from 'react-native';
import { Stack, useRouter } from "expo-router";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTelemetry } from '@/services/telemetry';
import { flightPlanner, Waypoint } from '@/services/FlightPlanner';
import { Ship, Battery, Compass, Zap, ShieldAlert, CircleCheck, ChevronRight, PlaneTakeoff, PlaneLanding, Map, Database, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { connected, data, connect } = useTelemetry();
    const [missionPlanned, setMissionPlanned] = useState(false);
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

    useEffect(() => {
        connect();
    }, []);

    const handleTakeoff = async () => {
        const success = await flightPlanner.takeoff();
        if (success) alert("Drone taking off...");
    };

    const handleLand = async () => {
        const success = await flightPlanner.land();
        if (success) alert("Drone landing...");
    };

    const planMission = async () => {
        try {
            const plan = await flightPlanner.generateHullOrbitPlan(229.0);
            setWaypoints(plan.waypoints);
            setMissionPlanned(true);
            alert("Hull-Orbit Mission Planned (6 Waypoints)");
        } catch (err) {
            alert("Failed to plan mission: Check connection");
        }
    };

    const startMission = async () => {
        const success = await flightPlanner.startMission();
        if (success) alert("Mission execution started!");
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Connection Status */}
            <View style={styles.header}>
                <View>
                    <ThemedText type="title" style={styles.brandText}>PLIMSOLL <ThemedText style={styles.accentText}>PILOT</ThemedText></ThemedText>
                    <ThemedText style={styles.versionText}>MISSION CONTROL v3.0</ThemedText>
                </View>
                <TouchableOpacity
                    onPress={() => connect()}
                    style={[styles.statusBadge, connected ? styles.statusActive : styles.statusInactive]}
                >
                    <ThemedText style={styles.statusText}>{connected ? 'LINK ACTIVE' : 'RECONNECT'}</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Main Actions Layer - Quick Access to Draft Survey */}
            <View style={styles.mainActions}>
                <TouchableOpacity
                    onPress={() => router.push("/draft")}
                    style={styles.actionCard}
                >
                    <View style={styles.actionIcon}>
                        <Ship color="#fde047" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <ThemedText style={styles.actionTitle}>START DRAFT SURVEY</ThemedText>
                        <ThemedText style={styles.actionSub}>Direct Physical Reading</ThemedText>
                    </View>
                    <ArrowRight color="#475569" size={20} />
                </TouchableOpacity>
            </View>

            {/* Telemetry Grid */}
            <View style={styles.telemetryGrid}>
                <TelemetryCard
                    icon={<Zap size={20} color="#fde047" />}
                    label="BATTERY"
                    value={data ? `${Math.round(data.battery)}%` : '--'}
                    unit=""
                />
                <TelemetryCard
                    icon={<Compass size={20} color="#3b82f6" />}
                    label="POSITION"
                    value={data ? `X:${data.x.toFixed(1)} Y:${data.y.toFixed(1)}` : '--'}
                    unit=""
                />
                <TelemetryCard
                    icon={<Map size={20} color="#10b981" />}
                    label="ALTITUDE"
                    value={data ? data.altitude.toFixed(1) : '--'}
                    unit="M"
                />
                <TelemetryCard
                    icon={<ShieldAlert size={20} color="#ef4444" />}
                    label="STATE"
                    value={data ? data.status : 'OFFLINE'}
                    unit=""
                />
            </View>

            {/* Operations Panel */}
            <ThemedView style={styles.opsPanel}>
                <ThemedText type="subtitle" style={styles.panelTitle}>DRONE OPERATIONS</ThemedText>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        onPress={handleTakeoff}
                        style={[styles.bigButton, { backgroundColor: '#1e293b' }]}
                    >
                        <PlaneTakeoff color="#3b82f6" size={24} />
                        <ThemedText style={styles.buttonLabel}>TAKEOFF</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLand}
                        style={[styles.bigButton, { backgroundColor: '#1e293b' }]}
                    >
                        <PlaneLanding color="#ef4444" size={24} />
                        <ThemedText style={styles.buttonLabel}>LAND</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>

            {/* Mission Planner */}
            <ThemedView style={styles.missionPanel}>
                <View style={styles.missionHeader}>
                    <ThemedText type="subtitle" style={styles.panelTitle}>HULL-ORBIT MISSION</ThemedText>
                    <View style={styles.aiBadge}>
                        <ThemedText style={styles.aiBadgeText}>AI AUTONOMOUS</ThemedText>
                    </View>
                </View>

                {missionPlanned ? (
                    <View style={styles.waypointList}>
                        {data?.mission === "EXECUTING" && (
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { width: `${data.mission_progress}%` }]} />
                                <ThemedText style={styles.progressText}>PROGRESS: {data.mission_progress}%</ThemedText>
                            </View>
                        )}
                        {waypoints.map((wp: Waypoint, i: number) => (
                            <View key={wp.id} style={styles.waypointItem}>
                                <ThemedText style={styles.wpId}>{wp.id}</ThemedText>
                                <ThemedText style={styles.wpCoords}>X:{wp.x.toFixed(1)} Y:{wp.y.toFixed(1)}</ThemedText>
                                {data?.current_waypoint_id === wp.id && (
                                    <CircleCheck size={16} color="#fde047" />
                                )}
                            </View>
                        ))}
                        <TouchableOpacity onPress={startMission} style={styles.executeButton}>
                            <ThemedText style={styles.executeButtonText}>EXECUTE FULL SURVEY</ThemedText>
                            <ChevronRight color="black" size={20} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.placeholderBox}>
                        <ThemedText style={styles.placeholderText}>Target Vessel: V LOCUS (229m)</ThemedText>
                        <TouchableOpacity onPress={planMission} style={styles.planButton}>
                            <ThemedText style={styles.planButtonText}>PLAN MISSION</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}
            </ThemedView>

            {/* Sync Footer */}
            <TouchableOpacity
                onPress={() => router.push("/history")}
                style={styles.syncButton}
            >
                <Database color="#94a3b8" size={16} />
                <ThemedText style={styles.syncText}>DATA SYNC / HISTORY</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}

function TelemetryCard({ icon, label, value, unit }: any) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {icon}
                <ThemedText style={styles.cardLabel}>{label}</ThemedText>
            </View>
            <View style={styles.cardValueRow}>
                <ThemedText style={styles.cardValue}>{value}</ThemedText>
                <ThemedText style={styles.cardUnit}>{unit}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    } as ViewStyle,
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    } as ViewStyle,
    brandText: {
        fontSize: 24,
        color: 'white',
        fontWeight: '900',
        letterSpacing: -1,
    } as TextStyle,
    accentText: {
        color: '#fde047',
    } as TextStyle,
    versionText: {
        fontSize: 10,
        color: '#475569',
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 4,
    } as TextStyle,
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    } as ViewStyle,
    statusActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    } as ViewStyle,
    statusInactive: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
    } as ViewStyle,
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        color: 'white',
    } as TextStyle,
    mainActions: {
        marginBottom: 20,
    } as ViewStyle,
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
        gap: 16,
    } as ViewStyle,
    actionIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(253, 224, 71, 0.1)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    actionInfo: {
        flex: 1,
    } as ViewStyle,
    actionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 1,
    } as TextStyle,
    actionSub: {
        fontSize: 10,
        color: '#475569',
        fontWeight: 'bold',
    } as TextStyle,
    telemetryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    } as ViewStyle,
    card: {
        width: (width - 52) / 2,
        backgroundColor: '#0f172a',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1e293b',
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    } as ViewStyle,
    cardLabel: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1,
    } as TextStyle,
    cardValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    } as ViewStyle,
    cardValue: {
        fontSize: 20,
        color: 'white',
        fontWeight: '900',
    } as TextStyle,
    cardUnit: {
        fontSize: 12,
        color: '#475569',
        fontWeight: 'bold',
    } as TextStyle,
    opsPanel: {
        backgroundColor: '#0f172a',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 20,
    } as ViewStyle,
    panelTitle: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
    } as TextStyle,
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    } as ViewStyle,
    bigButton: {
        flex: 1,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    } as ViewStyle,
    buttonLabel: {
        fontSize: 12,
        color: 'white',
        fontWeight: '900',
    } as TextStyle,
    missionPanel: {
        backgroundColor: '#0f172a',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
    } as ViewStyle,
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    } as ViewStyle,
    aiBadge: {
        backgroundColor: 'rgba(253, 224, 71, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(253, 224, 71, 0.2)',
    } as ViewStyle,
    aiBadgeText: {
        fontSize: 8,
        color: '#fde047',
        fontWeight: '900',
    } as TextStyle,
    placeholderBox: {
        padding: 20,
        backgroundColor: 'rgba(2, 6, 23, 0.5)',
        borderRadius: 16,
        alignItems: 'center',
    } as ViewStyle,
    placeholderText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
        fontWeight: 'bold',
    } as TextStyle,
    planButton: {
        backgroundColor: '#fde047',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
    } as ViewStyle,
    planButtonText: {
        fontSize: 10,
        color: 'black',
        fontWeight: '900',
        letterSpacing: 1,
    } as TextStyle,
    waypointList: {
        gap: 8,
    } as ViewStyle,
    progressContainer: {
        height: 30,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        justifyContent: 'center',
    } as ViewStyle,
    progressBar: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(253, 224, 71, 0.3)',
    } as ViewStyle,
    progressText: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '900',
        color: '#fde047',
    } as TextStyle,
    waypointItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(2, 6, 23, 0.5)',
        borderRadius: 12,
    } as ViewStyle,
    wpId: {
        fontSize: 10,
        color: '#fde047',
        fontWeight: '900',
        width: 60,
    } as TextStyle,
    wpCoords: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    } as TextStyle,
    executeButton: {
        backgroundColor: '#fde047',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 12,
        gap: 8,
    } as ViewStyle,
    executeButtonText: {
        fontSize: 12,
        color: 'black',
        fontWeight: '900',
        letterSpacing: 1,
    } as TextStyle,
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 30,
    } as ViewStyle,
    syncText: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '900',
        letterSpacing: 1,
    } as TextStyle,
});
