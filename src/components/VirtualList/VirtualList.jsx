import { useRef } from 'react'
import { useVirtualWindow } from '../../hooks/useVirtualWindow'
import './VirtualList.css'

/**
 * Renders only the rows near the viewport.
 *
 *  <div.virtualList  style="height: count * pitch">      <- fake full height (scrollbar)
 *     <div.virtualWindow  translateY(start * pitch)>      <- moved down to where the slice belongs
 *        row start ... row end-1                          <- the only DOM nodes that exist
 */
export default function VirtualList({
  items,
  itemHeight,
  gap = 10,
  overscan = 5,
  getKey,
  renderItem,
}) {
  const containerRef = useRef(null)
  const pitch = itemHeight + gap
  const { start, end, totalHeight } = useVirtualWindow({
    count: items.length,
    pitch,
    overscan,
    containerRef,
  })

  return (
    <div ref={containerRef} className="virtualList" role="list" style={{ height: totalHeight }}>
      <div className="virtualWindow" style={{ transform: `translateY(${start * pitch}px)` }}>
        {items.slice(start, end).map((item) => (
          <div
            key={getKey(item)}
            role="listitem"
            className="virtualRow"
            style={{ height: itemHeight, marginBottom: gap }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
