import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'

const SATELLITE_DURATION = 12000
const SATELLITE_WIDTH = 100
const ANTENNA_WIDTH = 120

const THRESHOLDS = { great: 80, weak: 180, bad: 320 }

function getSatPos(t, W, H) {
  const x = -SATELLITE_WIDTH + t * (W + SATELLITE_WIDTH * 2)
  const yLow = H * 0.60
  const yHigh = H * 0.06
  const y = yLow - 4 * (yLow - yHigh) * t * (1 - t)
  return { x, y }
}

function getSignalResult(distance) {
  if (distance <= THRESHOLDS.great) return { label: '✅ Buena señal', color: 'text-green-400', border: 'border-green-400', glow: true }
  if (distance <= THRESHOLDS.weak) return { label: '🟡 Señal débil', color: 'text-yellow-400', border: 'border-yellow-400', glow: false }
  if (distance <= THRESHOLDS.bad) return { label: '🟠 Mala señal', color: 'text-orange-400', border: 'border-orange-400', glow: false }
  return { label: '❌ Sin señal', color: 'text-red-500', border: 'border-red-500', glow: false }
}

function SignalCone({ apexX, apexY }) {
  // extend lines beyond top of screen so cone looks open-ended
  const topY = 0
  const scale = (apexY - topY) / apexY
  const half = THRESHOLDS.bad * scale
  const points = `${apexX},${apexY} ${apexX - half},${topY} ${apexX + half},${topY}`

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <polygon points={points} fill="rgba(125,211,252,0.10)" stroke="rgba(125,211,252,0.55)" strokeWidth="1.5" />
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
  const [dims, setDims] = useState({ W: window.innerWidth, H: window.innerHeight })
  const [apex, setApex] = useState({ x: window.innerWidth / 2, y: window.innerHeight })
  const [laser, setLaser] = useState(null)
  const [result, setResult] = useState(null)
  const [fired, setFired] = useState(false)

  const satPosRef = useRef(satPos)
  const antennaRef = useRef(null)
  const laserIdRef = useRef(0)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  const measureApex = useCallback(() => {
    if (!antennaRef.current) return
    const rect = antennaRef.current.getBoundingClientRect()
    setApex({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.4 })
  }, [])

  useLayoutEffect(() => { measureApex() }, [measureApex])

  useEffect(() => {
    const onResize = () => {
      setDims({ W: window.innerWidth, H: window.innerHeight })
      measureApex()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measureApex])

  useEffect(() => {
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const t = ((ts - startTimeRef.current) % SATELLITE_DURATION) / SATELLITE_DURATION
      const pos = getSatPos(t, window.innerWidth, window.innerHeight)
      satPosRef.current = pos
      setSatPos(pos)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleClick = useCallback(() => {
    if (fired || !antennaRef.current) return

    const antRect = antennaRef.current.getBoundingClientRect()
    const antCenterX = antRect.left + antRect.width / 2
    const satCenterX = satPosRef.current.x + SATELLITE_WIDTH / 2

    const distance = Math.abs(satCenterX - antCenterX)
    const signal = getSignalResult(distance)
    const id = laserIdRef.current++

    setFired(true)
    setLaser({ id, x: antCenterX })
    setResult(signal)

    setTimeout(() => setLaser(null), 700)
  }, [fired])

  const handleRestart = useCallback(() => {
    setFired(false)
    setResult(null)
    setLaser(null)
  }, [])

  if (!gameStarted) return <StartScreen onStart={() => setGameStarted(true)} />

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      onClick={!fired ? handleClick : undefined}
      style={{
        backgroundImage: 'url(/Fondo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: fired ? 'default' : 'crosshair',
      }}
    >
      {/* Detection cone */}
      <SignalCone apexX={apex.x} apexY={apex.y} />

      {/* Satellite */}
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
          className="laser-animate absolute w-1 bg-gradient-to-t from-cyan-400 to-transparent rounded-full"
          style={{ left: laser.x - 2, bottom: 120 }}
        />
      )}

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
          <div
            className={`
              text-3xl font-bold px-8 py-4 rounded-xl shadow-lg border-2
              ${result.color} ${result.border}
              bg-black/70 backdrop-blur-sm
              ${result.glow ? 'glow-green' : ''}
            `}
          >
            {result.label}
          </div>
          <button
            className="pointer-events-auto px-6 py-3 rounded-lg bg-white/10 border border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); handleRestart() }}
          >
            Reiniciar
          </button>
        </div>
      )}

      {/* Antenna */}
      <div
        ref={antennaRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: ANTENNA_WIDTH }}
      >
        <img src="/Starlink_estandar.png" alt="antena" width={ANTENNA_WIDTH} draggable={false} onLoad={measureApex} />
      </div>

      {/* Hint */}
      {!fired && (
        <p className="absolute bottom-4 w-full text-center text-white/50 text-sm pointer-events-none">
          Hacé click para disparar
        </p>
      )}
    </div>
  )
}
