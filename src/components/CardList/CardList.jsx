import '../Loading/Loading.css'
import { memo, useEffect, useRef } from 'react'
import { ITEM_GAP, ITEM_HEIGHT, OVERSCAN } from '../../config'
import Card from '../Card/Card'
import VirtualList from '../VirtualList/VirtualList'
import './CardList.css'

function CardList({
  users,
  deleteMode,
  selectedIds,
  hasMore,
  loadingMore,
  onLoadMore,
  onToggleSelected,
  onEdit,
}) {
  const sentinelRef = useRef(null)

  // Fires when the bottom marker scrolls into view. The observer is rebuilt after
  // every page so that, if the marker is still visible, the next page keeps loading.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || loadingMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, users.length, onLoadMore])

  return (
    <div>
      {users.length === 0 && <p className="empty">Không có user nào.</p>}

      <VirtualList
        items={users}
        itemHeight={ITEM_HEIGHT}
        gap={ITEM_GAP}
        overscan={OVERSCAN}
        getKey={(user) => user.id}
        renderItem={(user) => (
          <Card
            user={user}
            deleteMode={deleteMode}
            selected={selectedIds.includes(user.id)}
            onToggleSelected={onToggleSelected}
            onEdit={onEdit}
          />
        )}
      />

      {loadingMore && (
        <div className="loadingMore" role="status">
          <span className="spinner" aria-hidden="true" />
          Đang tải thêm...
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="sentinel" aria-hidden="true" />}
    </div>
  )
}

export default memo(CardList)
