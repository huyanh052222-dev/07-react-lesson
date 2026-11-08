import './Form.css'

const FIELDS = [
  { name: 'name', label: 'Tên', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Điện thoại', type: 'tel' },
  { name: 'address', label: 'Địa chỉ' },
  { name: 'street', label: 'Đường' },
  { name: 'zipcode', label: 'Mã bưu điện' },
  { name: 'password', label: 'Mật khẩu', type: 'password', autoComplete: 'new-password' },
  { name: 'music', label: 'Âm nhạc' },
  { name: 'avatar', label: 'Link ảnh đại diện', type: 'url' },
]

export default function Form({
  form,
  editing,
  deleteMode,
  busy,
  notice,
  selectedCount,
  onChange,
  onSubmit,
  onCancelEdit,
  onToggleDelete,
  onDeleteSelected,
}) {
  return (
    <>
      {deleteMode ? (
        <div className="title_delete_mode">
          <p className="delete">Delete</p> Mode is Ready!
        </div>
      ) : editing ? (
        <div className="title_mode">
          <p className="ready">Edit</p> User
        </div>
      ) : (
        <div className="title_mode">
          <p className="ready">Tool</p> Ready!
        </div>
      )}

      <form className="form on" onSubmit={onSubmit} noValidate>
        {!deleteMode && (
          <>
            {FIELDS.map(({ name, label, type = 'text', required, autoComplete }) => (
              <input
                key={name}
                type={type}
                placeholder={required ? `${label} *` : label}
                aria-label={label}
                autoComplete={autoComplete}
                value={form[name]}
                onChange={(e) => onChange(name, e.target.value)}
              />
            ))}

            <select
              aria-label="Giới tính"
              value={form.genre}
              onChange={(e) => onChange('genre', e.target.value)}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>

            <button type="submit" disabled={busy}>
              {busy ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm user'}
            </button>

            {editing && (
              <button type="button" className="secondary_btn" onClick={onCancelEdit} disabled={busy}>
                Hủy sửa
              </button>
            )}
          </>
        )}

        {deleteMode ? (
          <>
            <button type="button" className="secondary_btn" onClick={onToggleDelete} disabled={busy}>
              Thoát chế độ xóa
            </button>
            <button
              className="delete_btn"
              type="button"
              disabled={selectedCount === 0 || busy}
              onClick={onDeleteSelected}
            >
              {busy ? 'Đang xóa...' : `Xóa đã chọn (${selectedCount})`}
            </button>
          </>
        ) : (
          !editing && (
            <button type="button" className="delete_btn" onClick={onToggleDelete} disabled={busy}>
              Chế độ xóa
            </button>
          )
        )}

        {notice && (
          <p className={`notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
            {notice.text}
          </p>
        )}
      </form>
    </>
  )
}
