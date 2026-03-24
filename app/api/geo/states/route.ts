import { NextResponse } from "next/server"
import { City } from "country-state-city"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const country = searchParams.get("country")
    const state = searchParams.get("state")

    // Validation
    if (!country || !state) {
      return NextResponse.json(
        { error: "Missing country or state" },
        { status: 400 }
      )
    }

    const countryCode = country.toUpperCase()
    const stateCode = state.toUpperCase()

    // Get cities using library (NO fs)
    const cities = City.getCitiesOfState(countryCode, stateCode)

    // Format response
    return NextResponse.json({
      cities: (cities || []).map((city) => ({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      })),
    })

  } catch (error) {
    console.error("Geo cities fetch error:", error)

    return NextResponse.json(
      { error: "Failed to load cities" },
      { status: 500 }
    )
  }
}