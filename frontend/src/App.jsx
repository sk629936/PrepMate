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

  if (window.location.pathname === '/aptitude' || window.location.pathname.startsWith('/aptitude/')) {
    return <AptitudeMain />
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
