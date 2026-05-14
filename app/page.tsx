import MeetingAnalysisScreen from '@/components/MeetingAnalysisScreen';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[402px] min-h-screen bg-white flex flex-col shadow-xl">
        <MeetingAnalysisScreen />
      </div>
    </div>
  );
}
