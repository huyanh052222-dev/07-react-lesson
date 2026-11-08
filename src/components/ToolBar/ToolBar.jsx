import { memo } from 'react'
import './ToolBar.css'

function ToolBar({ query, sort, shown, hasMore, onQuery, onSort }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="searchBar"
        placeholder="Tìm theo tên, email, địa chỉ, điện thoại..."
        aria-label="Tìm kiếm"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />

      <select className="sortBtn" aria-label="Sắp xếp" value={sort} onChange={(e) => onSort(e.target.value)}>
        <option value="default">Mặc định</option>
        <option value="id_asc">ID tăng dần</option>
        <option value="id_desc">ID giảm dần</option>
        <option value="name_asc">Tên A → Z</option>
        <option value="name_desc">Tên Z → A</option>
      </select>

      <span className="count">
        Hiển thị {shown}{hasMore ? '+' : ''}
      </span>
    </div>
  )
}

export default memo(ToolBar)
