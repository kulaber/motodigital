import { useEffect } from 'react'

/** Dispatches modal-open/modal-close events to hide the mobile bottom nav. */
export function useHideNavOnModal(open: boolean) {
  useEffect(() => {
    if (!open) return
    window.dispatchEvent(new Event('modal-open'))
    return () => { window.dispatchEvent(new Event('modal-close')) }
  }, [open])
}
