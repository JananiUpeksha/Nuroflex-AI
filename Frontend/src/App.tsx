import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudyPlanPage from './pages/StudyPlanPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentProgressPage from './pages/StudentProgressPage';

type View = 'login' | 'register' | 'forgot' | 'student-dash' | 'instructor-dash' | 'study-plan' | 'student-progress';

function App() {
  const [view, setView] = useState<View>('login');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [userName, setUserName] = useState('');

  const handleLogin = (name: string) => {
    setUserName(name || 'User');
    if (role === 'student') setView('student-dash');
    else setView('instructor-dash');
  };

  const handleLogout = () => setView('login');

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC]">
      {view === 'login' && <LoginPage onLogin={handleLogin} onRegister={() => setView('register')} onForgot={() => setView('forgot')} role={role} setRole={setRole} />}
      {view === 'register' && <RegisterPage onBack={handleLogout} />}
      {view === 'forgot' && <ForgotPasswordPage onBack={handleLogout} />}
      {view === 'student-dash' && <StudentDashboard userName={userName} onLogout={handleLogout} onNavigateToPlan={() => setView('study-plan')} />}
      {view === 'study-plan' && <StudyPlanPage userName={userName} onBack={() => setView('student-dash')} />}
      {view === 'instructor-dash' && <InstructorDashboard userName={userName} onLogout={handleLogout} onNavigateToReports={() => setView('student-progress')} />}
      {view === 'student-progress' && <StudentProgressPage onBack={() => setView('instructor-dash')} />}
    </div>
  );
}

export default App;
