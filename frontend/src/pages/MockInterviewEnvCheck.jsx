import { useState, useEffect, useRef } from 'react'
import useAuth from '../hooks/useAuth'
import MockInterviewHeader from '../components/mockInterview/MockInterviewHeader'
import CameraCheckCard from '../components/mockInterview/envCheck/CameraCheckCard'
import MicrophoneCheckCard from '../components/mockInterview/envCheck/MicrophoneCheckCard'
import ScreenShareCheckCard from '../components/mockInterview/envCheck/ScreenShareCheckCard'
import EnvCheckSummary from '../components/mockInterview/envCheck/EnvCheckSummary'

export function MockInterviewEnvCheck() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth()

  // Extract Session ID from pathname (/mock-interview/session/:id/check)
  const pathname = window.location.pathname
  const pathParts = pathname.split('/')
  const sessionIndex = pathParts.indexOf('session')
  const sessionId = sessionIndex !== -1 && pathParts[sessionIndex + 1] ? pathParts[sessionIndex + 1] : ''

  // Camera State
  const [cameraStatus, setCameraStatus] = useState('idle') // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed'
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)

  // Microphone State
  const [micStatus, setMicStatus] = useState('idle') // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed'
  const [micStream, setMicStream] = useState(null)
  const [micError, setMicError] = useState(null)

  // Screen Share State (Strictly on user manual action)
  const [screenStatus, setScreenStatus] = useState('idle') // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed' | 'stopped'
  const [screenStream, setScreenStream] = useState(null)
  const [screenError, setScreenError] = useState(null)

  // Navigation transition flag to distinguish between unmount-leaving vs entering interview
  const isEnteringInterviewRef = useRef(false)

  // Clean stream cleanup on component unmount
  useEffect(() => {
    return () => {
      if (!isEnteringInterviewRef.current) {
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop())
        }
        if (micStream) {
          micStream.getTracks().forEach((t) => t.stop())
        }
        if (screenStream) {
          screenStream.getTracks().forEach((t) => t.stop())
        }
      }
    }
  }, [cameraStream, micStream, screenStream])

  // Camera Check Request
  const handleCheckCamera = async () => {
    setCameraStatus('checking')
    setCameraError(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('failed')
      setCameraError('Camera API is not supported on this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraStatus('failed')
          setCameraError('Camera track was disconnected.')
          setCameraStream(null)
        }
      }

      setCameraStream(stream)
      setCameraStatus('ready')
    } catch (err) {
      console.warn('Camera permission check error:', err)
      setCameraStatus('blocked')
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your system.')
      } else {
        setCameraError('Unable to connect to camera. Please check your device settings.')
      }
    }
  }

  // Microphone Check Request
  const handleCheckMic = async () => {
    setMicStatus('checking')
    setMicError(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('failed')
      setMicError('Microphone API is not supported on this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.onended = () => {
          setMicStatus('failed')
          setMicError('Microphone track was disconnected.')
          setMicStream(null)
        }
      }

      setMicStream(stream)
      setMicStatus('ready')
    } catch (err) {
      console.warn('Microphone permission check error:', err)
      setMicStatus('blocked')
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone access was denied. Please allow microphone permissions.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No microphone device was detected on your system.')
      } else {
        setMicError('Unable to connect to microphone. Please check your device settings.')
      }
    }
  }

  // Screen Share Check Request (Manual Trigger ONLY)
  const handleCheckScreenShare = async () => {
    setScreenStatus('checking')
    setScreenError(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setScreenStatus('failed')
      setScreenError('Screen sharing is not supported by your browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })

      const displayTrack = stream.getVideoTracks()[0]
      if (displayTrack) {
        displayTrack.onended = () => {
          setScreenStatus('stopped')
          setScreenError('Screen sharing was stopped. Please re-share your screen to proceed.')
          setScreenStream(null)
        }
      }

      setScreenStream(stream)
      setScreenStatus('ready')
    } catch (err) {
      console.warn('Screen share check error:', err)
      setScreenStatus('blocked')
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScreenError('Screen sharing was cancelled or denied.')
      } else {
        setScreenError('Screen sharing is required to start this interview.')
      }
    }
  }

  // Auto-initiate Camera & Mic prompt on first load for convenience, leaving screen share to user
  useEffect(() => {
    handleCheckCamera()
    handleCheckMic()
  }, [])

  // Start Interview action
  const handleStartInterview = () => {
    isEnteringInterviewRef.current = true
    window.location.href = `/mock-interview/session/${sessionId}`
  }

  // Auth loading guard
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5 animate-pulse">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Verifying session...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <MockInterviewHeader user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-6 sm:px-6 space-y-5">
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            Before you start
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Check your camera, microphone and screen sharing before entering the interview.
          </p>
        </div>

        {/* 3 Environment Checks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Camera Card */}
          <CameraCheckCard
            status={cameraStatus}
            stream={cameraStream}
            errorMessage={cameraError}
            onStartCheck={handleCheckCamera}
          />

          {/* Microphone Card */}
          <MicrophoneCheckCard
            status={micStatus}
            stream={micStream}
            errorMessage={micError}
            onStartCheck={handleCheckMic}
          />
        </div>

        {/* Screen Share Card */}
        <ScreenShareCheckCard
          status={screenStatus}
          errorMessage={screenError}
          onStartCheck={handleCheckScreenShare}
        />

        {/* Requirements Summary Checklist & Start Action */}
        <EnvCheckSummary
          cameraReady={cameraStatus === 'ready'}
          micReady={micStatus === 'ready'}
          screenReady={screenStatus === 'ready'}
          onStartInterview={handleStartInterview}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-2xs text-slate-500">
        PrepMate Placement Preparation Platform · Environment Verification
      </footer>
    </div>
  )
}

export default MockInterviewEnvCheck
