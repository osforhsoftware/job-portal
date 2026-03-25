import { NextRequest, NextResponse } from 'next/server'
import { db, JobSubCategory } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    let subCategories: JobSubCategory[]
    if (categoryId) {
      subCategories = await db.jobSubCategories.getByCategoryId(categoryId, false)
    } else {
      subCategories = await db.jobSubCategories.getAll(false)
    }
    return NextResponse.json({ subCategories })
  } catch (error) {
    console.error('Admin job sub-categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job sub-categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { categoryId, name, slug: slugInput, sortOrder, isActive } = body
    if (!categoryId || typeof categoryId !== 'string' || !categoryId.trim()) {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 }
      )
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    const slug = (slugInput && String(slugInput).trim()) ? slugify(String(slugInput)) : slugify(name)
    if (!slug) {
      return NextResponse.json(
        { error: 'Could not generate a valid slug from name' },
        { status: 400 }
      )
    }
    const existing = await db.jobSubCategories.getByCategoryId(categoryId, false)
    if (existing.some((s) => s.slug === slug)) {
      return NextResponse.json(
        { error: 'A sub-category with this slug already exists in this category' },
        { status: 400 }
      )
    }
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((s) => s.sortOrder), 0) + 1 : 1
    const newSub: Omit<JobSubCategory, 'id' | 'createdAt' | 'updatedAt'> = {
      categoryId: categoryId.trim(),
      slug,
      name: name.trim(),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : maxOrder,
      isActive: isActive !== false,
    }
    const created = await db.jobSubCategories.create(newSub)
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: created.id,
      action: 'create',
      description: `Created job sub-category: ${name.trim()}`,
      metadata: { subCategoryName: name.trim(), slug, categoryId },
      status: 'success',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ success: true, subCategory: created })
  } catch (error) {
    console.error('Job sub-category create error:', error)
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: '',
      action: 'create',
      description: `Failed to create job sub-category: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return NextResponse.json(
      { error: 'Failed to create job sub-category' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { id, slug, name, sortOrder, isActive } = body
    const subCategoryId = id != null ? String(id) : ''
    if (!subCategoryId) {
      return NextResponse.json({ error: 'Sub-category id required' }, { status: 400 })
    }
    const updates: Partial<JobSubCategory> = {}
    if (slug !== undefined) updates.slug = slugify(String(slug))
    if (name !== undefined) updates.name = String(name).trim()
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder)
    if (isActive !== undefined) updates.isActive = !!isActive

    const updated = await db.jobSubCategories.update(subCategoryId, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: subCategoryId,
      action: 'update',
      description: `Updated job sub-category: ${updated.name}`,
      metadata: { subCategoryName: updated.name, changes: updates },
      status: 'success',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ success: true, subCategory: updated })
  } catch (error) {
    console.error('Job sub-category update error:', error)
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: '',
      action: 'update',
      description: `Failed to update job sub-category: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return NextResponse.json(
      { error: 'Failed to update job sub-category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const subCategoryId = id != null ? String(id) : ''
    if (!subCategoryId) {
      return NextResponse.json({ error: 'Sub-category id required' }, { status: 400 })
    }
    const deleted = await db.jobSubCategories.delete(subCategoryId)
    if (!deleted) {
      return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 })
    }
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: subCategoryId,
      action: 'delete',
      description: `Deleted job sub-category: ${subCategoryId}`,
      metadata: { subCategoryId },
      status: 'success',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job sub-category delete error:', error)
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'job_category',
      entityId: '',
      action: 'delete',
      description: `Failed to delete job sub-category: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return NextResponse.json(
      { error: 'Failed to delete job sub-category' },
      { status: 500 }
    )
  }
}
