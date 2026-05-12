import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [demands, categories, subCategories] = await Promise.all([
      db.demands.getOpen(),
      db.jobCategories.getAll(true),
      db.jobSubCategories.getAll(true),
    ])
    const catName = new Map(categories.map((c) => [c.id, c.name]))
    const subName = new Map(subCategories.map((s) => [s.id, s.name]))

    const jobs = demands.map((d) => ({
      id: d.id,
      jobTitle: d.jobTitle,
      description: d.description,
      skills: d.skills ?? [],
      requirements: d.requirements ?? [],
      salary: d.salary,
      location: d.location,
      deadline: d.deadline,
      createdAt: d.createdAt,
      joining: d.joining,
      companyName: d.companyName,
      createdByEmployeeName: d.createdByEmployeeName,
      quantity: d.quantity,
      filledPositions: d.filledPositions,
      status: d.status,
      gender: d.gender,
      nationality: d.nationality ?? [],
      benefits: d.benefits ?? [],
      dutyHoursPerDay: d.dutyHoursPerDay,
      breakTimeHours: d.breakTimeHours,
      dayOffPerMonth: d.dayOffPerMonth,
      timeRemark: d.timeRemark,
      shiftStartTime: d.shiftStartTime,
      shiftEndTime: d.shiftEndTime,
      otherBenefitNote: d.otherBenefitNote,
      jobCategoryId: d.jobCategoryId,
      jobSubCategoryId: d.jobSubCategoryId,
      jobCategoryName: d.jobCategoryId ? catName.get(d.jobCategoryId) : undefined,
      jobSubCategoryName: d.jobSubCategoryId
        ? subName.get(d.jobSubCategoryId)
        : undefined,
    }))
    return NextResponse.json({ success: true, jobs })
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
