import { useEffect, useRef, useState } from 'react'

export function InterviewMonitor({
  cameraStream,
  micStream,
  screenStream,
  onCameraLost,
  onMicLost,
  onScreenLost,
  onStartScreenShare,
}) {
  const videoRef = useRef(null)
  const animFrameRef = useRef(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const [screenActive, setScreenActive] = useState(false)
  const [micLevel, setMicLevel] = useState(0)

  // Camera stream monitoring
  useEffect(() => {
    if (!cameraStream) {
      setCameraActive(false)
      return
    }

    const videoTrack = cameraStream.getVideoTracks()[0]
    if (!videoTrack || videoTrack.readyState === 'ended') {
      setCameraActive(false)
      return
    }

    setCameraActive(true)

    const handleEnded = () => {
      setCameraActive(false)
      if (onCameraLost) onCameraLost()
    }

    videoTrack.addEventListener('ended', handleEnded)

    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch(() => {})
    }

    return () => {
      videoTrack.removeEventListener('ended', handleEnded)
    }
  }, [cameraStream, onCameraLost])

  // Microphone stream monitoring with audio level visualization
  useEffect(() => {
    if (!micStream) {
      setMicActive(false)
      setMicLevel(0)
      return
    }

    const audioTrack = micStream.getAudioTracks()[0]
    if (!audioTrack || audioTrack.readyState === 'ended') {
      setMicActive(false)
      setMicLevel(0)
      return
    }

    setMicActive(true)

    const handleEnded = () => {
      setMicActive(false)
      setMicLevel(0)
      if (onMicLost) onMicLost()
    }

    audioTrack.addEventListener('ended', handleEnded)

    // Audio level analysis
    let audioCtx
    let analyser
    let source
    let dataArray

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source = audioCtx.createMediaStreamSource(micStream)
      source.connect(analyser)
      dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch {
      // AudioContext not supported
    }

    return () => {
      audioTrack.removeEventListener('ended', handleEnded)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {})
      }
    }
  }, [micStream, onMicLost])

  // Screen share monitoring
  useEffect(() => {
    if (!screenStream) {
      setScreenActive(false)
      return
    }

    const displayTrack = screenStream.getVideoTracks()[0]
    if (!displayTrack || displayTrack.readyState === 'ended') {
      setScreenActive(false)
      return
    }

    setScreenActive(true)

    const handleEnded = () => {
      setScreenActive(false)
      if (onScreenLost) onScreenLost()
    }

    displayTrack.addEventListener('ended', handleEnded)

    return () => {
      displayTrack.removeEventListener('ended', handleEnded)
    }
  }, [screenStream, onScreenLost])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <h3 className="text-xs font-bold text-slate-950">Monitoring</h3>

      {/* Camera Preview */}
      <div className="space-y-2">
        <div className="relative aspect-video w-full max-w-full rounded-lg bg-slate-950 overflow-hidden border border-slate-800">
          {cameraActive && cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-3 text-center min-h-[80px]">
              <svg className="w-5 h-5 text-slate-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-2xs text-slate-400 font-medium">Camera disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Rows */}
      <div className="space-y-2.5">
        {/* Camera status */}
        <StatusRow
          active={cameraActive}
          activeText="Camera ready"
          inactiveText="Camera disconnected"
        />

        {/* Microphone status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${micActive ? 'bg-slate-950' : 'bg-slate-400'}`} />
            <span className="text-2xs font-medium text-slate-700">
              {micActive ? 'Microphone ready' : 'Microphone disconnected'}
            </span>
          </div>
          {/* Audio level bar */}
          {micActive && (
            <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all duration-75"
                style={{ width: `${micLevel}%` }}
              />
            </div>
          )}
        </div>

        {/* Screen share status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${screenActive ? 'bg-slate-950' : 'bg-slate-400'}`} />
            <span className="text-2xs font-medium text-slate-700">
              {screenActive ? 'Screen sharing active' : 'Screen sharing stopped'}
            </span>
          </div>
          {!screenActive && onStartScreenShare && (
            <button
              type="button"
              onClick={onStartScreenShare}
              className="text-2xs font-semibold text-slate-800 underline hover:text-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ active, activeText, inactiveText }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-slate-950' : 'bg-slate-400'}`} />
      <span className="text-2xs font-medium text-slate-700">
        {active ? activeText : inactiveText}
      </span>
    </div>
  )
}

export default InterviewMonitor

