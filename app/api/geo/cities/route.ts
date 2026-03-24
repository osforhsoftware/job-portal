import { NextResponse } from "next/server"
import { City, type ICity } from "country-state-city"

export const runtime = "nodejs"

type CityRow = {
  name: string
  latitude?: string
  longitude?: string
}

function toCityRow(city: ICity): CityRow {
  const row: CityRow = { name: city.name }
  if (city.latitude != null && city.latitude !== "") {
    row.latitude = city.latitude
  }
  if (city.longitude != null && city.longitude !== "") {
    row.longitude = city.longitude
  }
  return row
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")?.trim() ?? ""
    const state = searchParams.get("state")?.trim() ?? ""

    if (!country || !state) {
      return NextResponse.json(
        { error: "Missing or empty required query parameters: country and state" },
        { status: 400 }
      )
    }

    const countryCode = country.toUpperCase()
    const stateCode = state.toUpperCase()

    const cities = City.getCitiesOfState(countryCode, stateCode)

    return NextResponse.json({
      cities: cities.map(toCityRow),
    })
  } catch (error) {
    console.error("[api/geo/cities]", error)
    return NextResponse.json(
      { error: "Failed to load cities" },
      { status: 500 }
    )
  }
}
