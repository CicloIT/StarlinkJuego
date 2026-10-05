import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'

const SATELLITE_DURATION = 2500
const SATELLITE_WIDTH = 100
const ANTENNA_WIDTH = Math.round(Math.min(window.innerWidth * 0.28, 220))

const THRESHOLDS = { great: 80, weak: 180, bad: 320 }

function getSatPos(t, W, H) {
  const x = -SATELLITE_WIDTH + t * (W + SATELLITE_WIDTH * 2)
  const yLow = H * 0.60
  const yHigh = H * 0.06
  const y = yLow - 4 * (yLow - yHigh) * t * (1 - t)
  return { x, y }
}

function getSignalResult(distance) {
  if (distance <= THRESHOLDS.great) return { label: '¡Starlink conectado!', sub: 'Señal perfecta', color: 'text-green-400', border: 'border-green-400', glow: true }
  if (distance <= THRESHOLDS.weak) return { label: 'Starlink conectado', sub: 'Señal débil — internet lento', color: 'text-yellow-400', border: 'border-yellow-400', glow: false }
  if (distance <= THRESHOLDS.bad) return { label: 'Conexión fallida', sub: 'Señal muy mala', color: 'text-orange-400', border: 'border-orange-400', glow: false }
  return { label: 'Sin cobertura', sub: 'El satélite pasó lejos', color: 'text-red-500', border: 'border-red-500', glow: false }
}

function SignalCone({ apexX, apexY }) {
  const topY = 0
  const scale = (apexY - topY) / apexY
  const half = THRESHOLDS.bad * scale
  const points = `${apexX},${apexY} ${apexX - half},${topY} ${apexX + half},${topY}`

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <polygon points={points} fill="rgba(125,211,252,0.08)" stroke="rgba(125,211,252,0.4)" strokeWidth="1.5" />
    </svg>
  )
}

function StartScreen({ onStart }) {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/Fondo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        {/* satellite icon */}
        <div className="text-6xl mb-2" style={{ filter: 'drop-shadow(0 0 18px #22d3ee)' }}>🛰️</div>

        <h1
          className="text-5xl sm:text-6xl font-extrabold text-white text-center leading-tight tracking-tight"
          style={{ textShadow: '0 0 40px rgba(34,211,238,0.8), 0 2px 8px rgba(0,0,0,0.9)' }}
        >
          ¿Podés conectar<br />
          <span style={{ color: '#67e8f9', textShadow: '0 0 30px rgba(34,211,238,1), 0 0 60px rgba(34,211,238,0.5)' }}>
            Starlink?
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl text-center font-medium tracking-wide"
          style={{ color: 'rgba(186,230,253,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
        >
          Internet donde no llega nadie
        </p>

        <button className="btn-jugar mt-4" onClick={onStart}>
          Jugar
        </button>
      </div>

      <p
        className="absolute bottom-6 text-xs tracking-[0.3em] uppercase"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        CicloIT
      </p>
    </div>
  )
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [satPos, setSatPos] = useState({ x: -SATELLITE_WIDTH, y: 0 })
  const [apex, setApex] = useState({ x: window.innerWidth / 2, y: window.innerHeight })
  const [laser, setLaser] = useState(null)
  const [result, setResult] = useState(null)
  const [fired, setFired] = useState(false)

  const satPosRef = useRef(satPos)
  const firedRef = useRef(false)
  const antennaRef = useRef(null)
  const startTimeRef = useRef(null)

  const measureApex = useCallback(() => {
    if (!antennaRef.current) return
    const rect = antennaRef.current.getBoundingClientRect()
    setApex({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 })
  }, [])

  useEffect(() => { firedRef.current = fired }, [fired])

  useLayoutEffect(() => { measureApex() }, [measureApex])

  useEffect(() => {
    const animate = (ts) => {
      if (!firedRef.current) {
        if (!startTimeRef.current) startTimeRef.current = ts
        const t = ((ts - startTimeRef.current) % SATELLITE_DURATION) / SATELLITE_DURATION
        const pos = getSatPos(t, window.innerWidth, window.innerHeight)
        satPosRef.current = pos
        setSatPos(pos)
      }
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [])

  const handleClick = useCallback(() => {
    if (fired) return

    const antRect = antennaRef.current.getBoundingClientRect()
    const antCenterX = antRect.left + antRect.width / 2
    const satCenterX = satPosRef.current.x + SATELLITE_WIDTH / 2

    const distance = Math.abs(satCenterX - antCenterX)
    const signal = getSignalResult(distance)

    setFired(true)
    setLaser({ x: antCenterX })
    setResult(signal)

    setTimeout(() => setLaser(null), 700)
  }, [fired])

  const handleRestart = useCallback(() => {
    setFired(false)
    setResult(null)
    setLaser(null)
    startTimeRef.current = null
  }, [])

  if (!gameStarted) return <StartScreen onStart={() => setGameStarted(true)} />

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onClick={!fired ? handleClick : undefined}
      style={{ backgroundImage: 'url(/Fondo.png)', backgroundSize: 'cover' }}
    >

      <SignalCone apexX={apex.x} apexY={apex.y} />

      {/* Satélite */}
      <div
        className="absolute"
        style={{ left: satPos.x, top: satPos.y, width: SATELLITE_WIDTH }}
      >
        <img
          src="/Satelite.png"
          alt="satelite"
          width={SATELLITE_WIDTH}
          draggable={false}
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Laser */}
      {laser && (
        <div
          className="absolute w-1 bg-gradient-to-t from-cyan-400 to-transparent rounded-full animate-pulse"
          style={{ left: laser.x - 2, bottom: 120, height: '60vh' }}
        />
      )}

      {/* Resultado */}
      {result && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center">
          <div className={`px-8 py-4 rounded-2xl border-2 backdrop-blur-md ${result.color} ${result.border} bg-black/70`}>
            <h2 className="text-2xl font-bold">{result.label}</h2>
            <p className="text-sm opacity-70">{result.sub}</p>
          </div>
        </div>
      )}

      {/* Antena */}
      <div ref={antennaRef} className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <img src="/Starlink_estandar.png" width={ANTENNA_WIDTH} onLoad={measureApex} />
      </div>

      {/* Botón reset — solo aparece después del disparo */}
      {fired && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ bottom: 30 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleRestart() }}
            className="p-3 rounded-full 
      bg-black/50 backdrop-blur-md 
      border border-cyan-400/40 
      hover:border-cyan-300 
      hover:shadow-[0_0_15px_rgba(34,211,238,0.7)] 
      hover:rotate-180 
      transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 text-cyan-300" />
          </button>
        </div>
      )}
      {!fired && (
        <p className="absolute bottom-4 w-full text-center text-white/50">
          Click para disparar
        </p>
      )}
    </div>
  )
}