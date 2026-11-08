import './ErrorScreen.css'

export default function ErrorScreen({ onRetry }) {
  return (
    <div className="errorOn" role="alert">
      Không thể tải dữ liệu
      <button className="return-btn" type="button" onClick={onRetry}>
        Thử lại
      </button>
    </div>
  )
}
