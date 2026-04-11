"use client"

import { PublicDemandsListing } from "@/components/public-demands-listing"

export default function DemandsPage() {
  return (
    <PublicDemandsListing
      pageTitle="Open recruitment demands"
      pageSubtitle="Filter by location and role, open a demand for full details, then apply as a candidate"
      redirectPath="/demands"
    />
  )
}
