import { useCallback, useEffect, useRef } from 'react'

interface PressAndHoldOptions {
  // Wait before the held action starts repeating, so a quick tap fires only once.
  initialDelay?: number
  // Starting gap between repeats; shrinks toward minInterval as the hold continues.
  interval?: number
  minInterval?: number
  acceleration?: number
}

export function usePressAndHold(
  action: () => void,
  { initialDelay = 350, interval = 130, minInterval = 40, acceleration = 6 }: PressAndHoldOptions = {}
) {
  const actionRef = useRef(action)
  actionRef.current = action

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const currentIntervalRef = useRef(interval)

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    currentIntervalRef.current = interval
  }, [interval])

  const start = useCallback(() => {
    stop()
    actionRef.current()
    timeoutRef.current = setTimeout(function repeat() {
      actionRef.current()
      currentIntervalRef.current = Math.max(minInterval, currentIntervalRef.current - acceleration)
      timeoutRef.current = setTimeout(repeat, currentIntervalRef.current)
    }, initialDelay)
  }, [stop, initialDelay, minInterval, acceleration])

  useEffect(() => stop, [stop])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Keep receiving events if the finger drifts off the button mid-hold.
      e.currentTarget.setPointerCapture?.(e.pointerId)
      start()
    },
    [start]
  )

  // Pointer interactions are already handled by onPointerDown; only let
  // keyboard activation (Enter/Space, which reports detail === 0) through.
  const onClick = useCallback((e: React.MouseEvent) => {
    if (e.detail === 0) {
      actionRef.current()
    }
  }, [])

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerCancel: stop,
    onClick,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
