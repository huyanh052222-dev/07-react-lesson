import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Virtual scroll for a list inside the normal page (window scroll), fixed row height.
 *
 * Idea: the container gets the height of the *whole* list (count * pitch) so the
 * scrollbar behaves as if every row existed, but only the rows near the viewport
 * are rendered. We work out which rows those are from where the container sits
 * relative to the viewport:
 *
 *   top   = container.getBoundingClientRect().top      (negative once scrolled past it)
 *   first = floor(-top / pitch)                         (first row touching the viewport)
 *   last  = ceil((viewportHeight - top) / pitch)        (one past the last row touching it)
 *   range = [first - overscan, last + overscan)         (clamped to 0..count)
 *
 * @param {object}  options
 * @param {number}  options.count      total number of rows
 * @param {number}  options.pitch      row height + gap, in px
 * @param {number}  [options.overscan] extra rows kept above/below to avoid blank flashes
 * @param {{current: HTMLElement|null}} options.containerRef element holding the list
 * @returns {{start: number, end: number, totalHeight: number}}
 */
export function useVirtualWindow({ count, pitch, overscan = 5, containerRef }) {
  // Sensible first guess so the first paint is not empty
  const [range, setRange] = useState(() => ({
    start: 0,
    end: Math.ceil(window.innerHeight / pitch) + overscan,
  }))
  const frame = useRef(0)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const top = el.getBoundingClientRect().top
    const first = Math.floor(-top / pitch)
    const last = Math.ceil((window.innerHeight - top) / pitch)

    const start = Math.max(0, first - overscan)
    const end = Math.min(count, Math.max(start, last + overscan))

    // Same range => same object => React skips the re-render
    setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [count, pitch, overscan, containerRef])

  // Re-measure when the list changes size (more rows loaded, search, sort...)
  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    // Throttle to one measurement per animation frame
    const schedule = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        measure()
      })
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // Content above the list can change height without any scroll event
    // (e.g. a notice banner appears), which moves the list. Watch for that.
    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [measure])

  return {
    start: Math.min(range.start, count),
    end: Math.min(range.end, count),
    totalHeight: count * pitch,
  }
}
