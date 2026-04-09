// =============================================================================
// GameStateContext — provides game state + dispatch to all modules.
// Wrap the Game component in <GameStateProvider> and useGameState() anywhere.
// =============================================================================

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { type GameState, type GameAction, gameReducer, createInitialGameState } from './gameState'

interface GameStateContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameStateCtx = createContext<GameStateContextValue | null>(null)

export function GameStateProvider({ children, initialState }: { children: ReactNode; initialState?: Partial<GameState> }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => createInitialGameState(init))
  return (
    <GameStateCtx.Provider value={{ state, dispatch }}>
      {children}
    </GameStateCtx.Provider>
  )
}

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateCtx)
  if (!ctx) throw new Error('useGameState must be used within <GameStateProvider>')
  return ctx
}

export function useGameDispatch(): Dispatch<GameAction> {
  return useGameState().dispatch
}

export function useGameSelector<T>(selector: (state: GameState) => T): T {
  return selector(useGameState().state)
}
