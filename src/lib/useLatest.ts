import { useRef } from 'react'

/** Ref that always holds the latest value — avoids stale closures in callbacks. */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
