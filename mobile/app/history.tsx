import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { styled } from "nativewind";
import { useState, useCallback } from 'react';
import { getLocalSurveys, SurveyRecord } from '../db';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledButton = styled(TouchableOpacity);

export default function HistoryScreen() {
    const router = useRouter();
    const [surveys, setSurveys] = useState<SurveyRecord[]>([]);

    const loadData = async () => {
        const data = await getLocalSurveys();
        setSurveys(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const renderItem = ({ item }: { item: SurveyRecord }) => (
        <StyledView className="bg-plimsoll-lightnavy p-4 rounded-xl mb-3 border border-plimsoll-slate/10 flex-row justify-between items-center">
            <View>
                <StyledText className="text-white font-bold text-lg">{item.vessel_imo || "Unknown Vessel"}</StyledText>
                <StyledText className="text-plimsoll-slate text-xs font-mono">{item.timestamp}</StyledText>
            </View>
            <View className="items-end">
                <StyledText className="text-plimsoll-cyan font-bold font-mono text-xl">{item.draft_mean ? item.draft_mean.toFixed(2) : "0.00"}m</StyledText>
                <StyledView className={`flex-row items-center space-x-1 ${item.is_synced ? 'opacity-50' : ''}`}>
                    <Ionicons name={item.is_synced ? "checkmark-circle" : "cloud-upload"} size={14} color={item.is_synced ? "#64ffda" : "#facc15"} />
                    <StyledText className={`text-[10px] ${item.is_synced ? 'text-plimsoll-cyan' : 'text-yellow-400'}`}>
                        {item.is_synced ? "SYNCED" : "PENDING"}
                    </StyledText>
                </StyledView>
            </View>
        </StyledView>
    );

    return (
        <StyledView className="flex-1 bg-plimsoll-navy p-4">
            <Stack.Screen options={{ title: "Survey Logs" }} />

            {surveys.length === 0 ? (
                <StyledView className="flex-1 items-center justify-center">
                    <Ionicons name="documents-outline" size={64} color="#8892b0" />
                    <StyledText className="text-plimsoll-slate mt-4">No surveys recorded locally.</StyledText>
                </StyledView>
            ) : (
                <FlatList
                    data={surveys}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </StyledView>
    );
}
