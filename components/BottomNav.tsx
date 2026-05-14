import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type TabName = 'home' | 'recording' | 'card' | 'report';

interface BottomNavProps {
  activeTab: TabName;
  onTabPress?: (tab: TabName) => void;
}

const MAIN = '#7b2fbe';
const INACTIVE = '#1c1a1c';

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const color = (tab: TabName) => (activeTab === tab ? MAIN : INACTIVE);

  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress?.('home')}>
        <Ionicons name="home-outline" size={28} color={color('home')} />
        <Text style={[styles.label, { color: color('home') }]}>홈</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabPress?.('recording')}>
        <Ionicons name="add-circle" size={28} color={color('recording')} />
        <Text style={[styles.label, { color: color('recording') }]}>녹음</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabPress?.('card')}>
        <MaterialCommunityIcons name="card-account-details-outline" size={28} color={color('card')} />
        <Text style={[styles.label, { color: color('card') }]}>카드</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabPress?.('report')}>
        <MaterialCommunityIcons name="file-chart-outline" size={28} color={color('report')} />
        <Text style={[styles.label, { color: color('report') }]}>리포트</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#7b2fbe',
    height: 82,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
