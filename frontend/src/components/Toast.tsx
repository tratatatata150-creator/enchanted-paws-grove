import { useStore } from '../store'

export default function Toast() {
  const toastMessage = useStore(s => s.toastMessage)

  if (!toastMessage) return null

  return (
    <div className="toast-container">
      <div className="toast">{toastMessage}</div>
    </div>
  )
}
