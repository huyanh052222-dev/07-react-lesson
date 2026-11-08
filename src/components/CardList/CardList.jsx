import '../Loading/Loading.css'
import { useEffect, useRef } from 'react'
import Card from '../Card/Card'
import './CardList.css'

export default function CardList({
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
    <div className="list">
      {users.length === 0 && <p className="empty">Không có user nào.</p>}

      {users.map((user) => (
        <Card
          key={user.id}
          user={user}
          deleteMode={deleteMode}
          selected={selectedIds.includes(user.id)}
          onToggleSelected={() => onToggleSelected(user.id)}
          onEdit={onEdit}
        />
      ))}

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
