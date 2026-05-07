'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Redirect /calendar/[id] → /calendar and auto-scroll to that calendar
export default function CalendarRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // The main /calendar page manages its own selection.
    // Store the target ID in sessionStorage so it can auto-select on load.
    if (params.id) {
      sessionStorage.setItem('selectedCalendarId', params.id as string)
    }
    router.replace('/calendar')
  }, [router, params.id])

  return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Opening calendar...
    </div>
  )
}
