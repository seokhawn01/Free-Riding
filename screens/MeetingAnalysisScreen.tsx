import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

type Tab = 'file' | 'realtime';

const C = {
  main: '#7b2fbe',
  text: '#1c1a1c',
  grayText: '#989494',
  border: '#cbc7c7',
  uploadBg: '#f5f5f5',
  musicBg: '#e8f0fe',
  musicIcon: '#4285f4',
};

export default function MeetingAnalysisScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('file');

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회의 분석</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('file')}
        >
          <Text style={[styles.tabLabel, activeTab === 'file' && styles.tabLabelActive]}>
            파일첨부
          </Text>
          {activeTab === 'file' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>

        <View style={styles.tabDivider} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('realtime')}
        >
          <Text style={[styles.tabLabel, activeTab === 'realtime' && styles.tabLabelActive]}>
            실시간 녹음
          </Text>
          {activeTab === 'realtime' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 파일 업로드 영역 */}
        <View style={styles.uploadArea}>
          <Ionicons name="arrow-up" size={40} color={C.text} />
          <TouchableOpacity style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>파일 선택</Text>
          </TouchableOpacity>
        </View>

        {/* 선택된 파일 카드 */}
        <View style={styles.fileCard}>
          <View style={styles.musicIconBox}>
            <MaterialCommunityIcons name="music-note" size={26} color={C.musicIcon} />
          </View>
          <View>
            <Text style={styles.fileName}>meeting_0512.mp4</Text>
            <Text style={styles.fileMeta}>{'45분  124MB'}</Text>
          </View>
        </View>

        {/* AI 분석 시작 버튼 */}
        <TouchableOpacity style={styles.analyzeBtn}>
          <Text style={styles.analyzeBtnText}>AI 분석 시작</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeTab="recording" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: C.main,
  },
  backBtn: {
    padding: 4,
    width: 36,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: C.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.text,
  },
  tabLabelActive: {
    color: C.main,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: C.main,
  },
  tabDivider: {
    width: 1,
    backgroundColor: C.text,
    marginVertical: 8,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  uploadArea: {
    marginTop: 20,
    borderRadius: 11,
    backgroundColor: C.uploadBg,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 48,
  },
  selectBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.text,
    borderRadius: 10,
  },
  selectBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.text,
  },
  fileCard: {
    marginTop: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  musicIconBox: {
    width: 48,
    height: 48,
    backgroundColor: C.musicBg,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileName: {
    fontSize: 13,
    color: C.text,
  },
  fileMeta: {
    fontSize: 10,
    color: C.grayText,
    marginTop: 4,
  },
  analyzeBtn: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: C.text,
    borderRadius: 11,
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
