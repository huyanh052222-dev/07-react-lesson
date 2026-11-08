import './Loading.css'

export default function Loading() {
  return (
    <div className="loadingOn" role="status">
      <span className="spinner" aria-hidden="true" />
      Đang tải...
    </div>
  )
}
