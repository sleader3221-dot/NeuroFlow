import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Notes from './pages/Notes';
import Timer from './pages/Timer';
import Analytics from './pages/Analytics';
import AITutor from './pages/AITutor';
import StudyPlan from './pages/StudyPlan';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="notes" element={<Notes />} />
            <Route path="timer" element={<Timer />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="study-plan" element={<StudyPlan />} />
            <Route path="knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
