import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await db.candidates.update(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, candidate: updated })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const database = await getDatabase()
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id }
    const result = await database.collection('candidates').deleteOne(query)
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete candidate:', error)
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 })
  }
}
