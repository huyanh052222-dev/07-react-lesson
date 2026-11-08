import './Card.css'

const GENRE_LABEL = { male: 'Nam', female: 'Nữ', other: 'Khác' }

function formatDate(value) {
  if (!value) return ''
  // mockapi returns unix seconds; accept ISO strings too
  const date = new Date(typeof value === 'number' && value < 1e12 ? value * 1000 : value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN')
}

export default function Card({ user, deleteMode, selected, onToggleSelected, onEdit }) {
  return (
    <div className={`userCard${selected ? ' selected' : ''}`}>
      <p>{user.id}</p>
      <div className="avt">{user.avatar && <img src={user.avatar} alt="" loading="lazy" />}</div>
      <p>{user.name}</p>
      <p>{GENRE_LABEL[user.genre] ?? user.genre}</p>
      <p>{user.address}</p>
      <p>{formatDate(user.createdAt)}</p>

      {deleteMode ? (
        <input
          type="checkbox"
          aria-label={`Chọn ${user.name}`}
          checked={selected}
          onChange={onToggleSelected}
        />
      ) : (
        <button type="button" className="editBtn" onClick={() => onEdit(user)}>
          Sửa
        </button>
      )}
    </div>
  )
}
