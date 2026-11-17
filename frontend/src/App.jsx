import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import DSAPreparation from './pages/DSAPreparation'
import DSAPractice from './pages/DSAPractice'
import AptitudeMain from './pages/AptitudeMain'
import AptitudePractice from './pages/AptitudePractice'
import AptitudeTest from './pages/AptitudeTest'
import AptitudeAdmin from './pages/AptitudeAdmin'
import CoreCSMain from './pages/CoreCSMain'
import CoreCSSubject from './pages/CoreCSSubject'
import CoreCSTheoryDetail from './pages/CoreCSTheoryDetail'
import CoreCSPractice from './pages/CoreCSPractice'
import CoreCSTest from './pages/CoreCSTest'
import CoreCSTestResult from './pages/CoreCSTestResult'
import CoreCSProgress from './pages/CoreCSProgress'
import CoreCSAdmin from './pages/CoreCSAdmin'
import AdminPanel from './pages/AdminPanel'
import MockInterview from './pages/MockInterview'
import MockInterviewEnvCheck from './pages/MockInterviewEnvCheck'
import MockInterviewSession from './pages/MockInterviewSession'
import MockInterviewResult from './pages/MockInterviewResult'
import MockInterviewHistory from './pages/MockInterviewHistory'
import MockInterviewProgress from './pages/MockInterviewProgress'
import Navbar from './components/landing/Navbar'
import Hero from './components/landing/Hero'
import QuickStats from './components/landing/QuickStats'
import Features from './components/landing/Features'
import HowItWorks from './components/landing/HowItWorks'
import AISection from './components/landing/AISection'
import DashboardPreview from './components/landing/DashboardPreview'
import PreparationCategories from './components/landing/PreparationCategories'
import FinalCTA from './components/landing/FinalCTA'
import Footer from './components/landing/Footer'

function App() {
  if (window.location.pathname === '/login') {
    return <Login />
  }

  if (window.location.pathname === '/signup') {
    return <Signup />
  }

  if (window.location.pathname === '/forgot-password') {
    return <ForgotPassword />
  }

  if (window.location.pathname === '/verify-otp') {
    return <VerifyOTP />
  }

  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }

  if (window.location.pathname === '/dashboard') {
    return <Dashboard />
  }

  if (window.location.pathname.startsWith('/dsa/problem/')) {
    return <DSAPractice />
  }

  if (window.location.pathname === '/dsa') {
    return <DSAPreparation />
  }

  if (window.location.pathname === '/aptitude/practice') {
    return <AptitudePractice />
  }

  if (window.location.pathname === '/aptitude/test') {
    return <AptitudeTest />
  }

  if (window.location.pathname === '/aptitude/admin') {
    return <AptitudeAdmin />
  }

  // Central Admin Panel — covers /admin and all /admin/* sub-paths
  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
    return <AdminPanel />
  }

  // Full Core CS Admin (dedicated page, accessible from Central Admin → Core CS)
  if (window.location.pathname === '/core-cs-admin') {
    return <CoreCSAdmin />
  }

  if (window.location.pathname === '/aptitude' || window.location.pathname.startsWith('/aptitude/')) {
    return <AptitudeMain />
  }

  // Core CS Theory Detail
  if (window.location.pathname.startsWith('/core-cs/theory/')) {
    return <CoreCSTheoryDetail />
  }

  // Core CS Test Result
  if (window.location.pathname.startsWith('/core-cs/test/') && window.location.pathname.endsWith('/result')) {
    return <CoreCSTestResult />
  }

  // Core CS Full Test Simulator
  if (window.location.pathname === '/core-cs/test' || window.location.pathname.startsWith('/core-cs/test/')) {
    return <CoreCSTest />
  }

  // Core CS Practice Drill
  if (window.location.pathname === '/core-cs/practice') {
    return <CoreCSPractice />
  }

  // Core CS User Progress
  if (window.location.pathname === '/core-cs/progress') {
    return <CoreCSProgress />
  }

  // Core CS Individual Subject Page
  if (window.location.pathname.startsWith('/core-cs/') && window.location.pathname !== '/core-cs') {
    return <CoreCSSubject />
  }

  // Core CS Main Landing Page
  if (window.location.pathname === '/core-cs') {
    return <CoreCSMain />
  }

  // Mock Interview Environment Check Page
  if (window.location.pathname.startsWith('/mock-interview/session/') && window.location.pathname.endsWith('/check')) {
    return <MockInterviewEnvCheck />
  }

  // Mock Interview Result Page (Phase 2D)
  if (window.location.pathname.startsWith('/mock-interview/session/') && window.location.pathname.endsWith('/result')) {
    return <MockInterviewResult />
  }

  // Mock Interview Active Session Page
  if (window.location.pathname.startsWith('/mock-interview/session/')) {
    return <MockInterviewSession />
  }

  // Mock Interview History Page (Phase 2E)
  if (window.location.pathname === '/mock-interview/history') {
    return <MockInterviewHistory />
  }

  // Mock Interview Progress Page (Phase 2E)
  if (window.location.pathname === '/mock-interview/progress') {
    return <MockInterviewProgress />
  }

  // Mock Interview Setup & Landing Page
  if (window.location.pathname === '/mock-interview' || window.location.pathname.startsWith('/mock-interview')) {
    return <MockInterview />
  }

  return (
    <main id="top" className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <QuickStats />
      <Features />
      <HowItWorks />
      <AISection />
      <DashboardPreview />
      <PreparationCategories />
      <FinalCTA />
      <Footer />
    </main>
  )
}

export default App
