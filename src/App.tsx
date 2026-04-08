import { useState } from 'react'
import { Game } from '@modules/game'
import { Playground } from '@modules/playground'

type Mode = 'game' | 'playground'

export default function App() {
  const [mode, setMode] = useState<Mode>('game')

  return (
    <>
      {mode === 'game' && <Game />}
      {mode === 'playground' && <Playground activeModule="map" showEventLog />}

      {/* Mode toggle — bottom-right corner */}
      <button
        onClick={() => setMode(m => m === 'game' ? 'playground' : 'game')}
        className="fixed bottom-3 right-3 z-50 px-3 py-1.5 rounded text-[10px] transition-all"
        style={{
          background: 'rgba(232,213,176,0.08)',
          border: '1px solid rgba(232,213,176,0.15)',
          color: 'rgba(232,213,176,0.35)',
        }}>
        {mode === 'game' ? 'Dev Playground' : 'Back to Game'}
      </button>
    </>
  )
}
