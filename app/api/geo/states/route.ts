import { NextResponse } from "next/server"
import { State } from "country-state-city"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")?.trim() ?? ""

    if (!country) {
      return NextResponse.json(
        { error: "Missing country query parameter" },
        { status: 400 }
      )
    }

    const countryCode = country.toUpperCase()
    const states = State.getStatesOfCountry(countryCode)

    return NextResponse.json({
      states: (states || []).map((s) => ({
        iso2: s.isoCode,
        name: s.name,
      })),
    })
  } catch (error) {
    console.error("Geo states fetch error:", error)
    return NextResponse.json(
      { error: "Failed to load states" },
      { status: 500 }
    )
  }
}
