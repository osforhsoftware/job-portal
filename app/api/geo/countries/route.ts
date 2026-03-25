import { NextResponse } from "next/server"
import { Country } from "country-state-city"

export const runtime = "nodejs"

export async function GET() {
  try {
    const countries = Country.getAllCountries()
    return NextResponse.json({
      countries: (countries || []).map((c) => ({
        iso2: c.isoCode,
        name: c.name,
      })),
    })
  } catch (error) {
    console.error("Geo countries fetch error:", error)
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 })
  }
}

