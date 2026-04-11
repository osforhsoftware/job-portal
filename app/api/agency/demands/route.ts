import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [demands, categories, subCategories] = await Promise.all([
      db.demands.getMarketplaceVisible(),
      db.jobCategories.getAll(true),
      db.jobSubCategories.getAll(true),
    ])
    const catName = new Map(categories.map((c) => [c.id, c.name]))
    const subName = new Map(subCategories.map((s) => [s.id, s.name]))

    const withPositions = demands.map((d) => ({
      ...d,
      positions: d.quantity,
      jobCategoryName: d.jobCategoryId ? catName.get(d.jobCategoryId) : undefined,
      jobSubCategoryName: d.jobSubCategoryId
        ? subName.get(d.jobSubCategoryId)
        : undefined,
    }))
    return NextResponse.json({ success: true, demands: withPositions })
  } catch (error) {
    console.error('Failed to fetch demands:', error)
    return NextResponse.json({ error: 'Failed to fetch demands' }, { status: 500 })
  }
}
