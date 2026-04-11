"use client"

import { PublicDemandsListing } from "@/components/public-demands-listing"

export default function JobsPage() {
  return (
    <PublicDemandsListing
      pageTitle="Find Your Next Opportunity"
      pageSubtitle="Browse open positions from companies across the region"
      redirectPath="/jobs"
    />
  )
}
