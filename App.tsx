import './global.css';
import { StatusBar } from 'expo-status-bar';
import MeetingAnalysisScreen from './screens/MeetingAnalysisScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <MeetingAnalysisScreen />
    </>
  );
}
