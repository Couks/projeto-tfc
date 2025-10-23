import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const site = await prisma.site.findFirst({ where: { id, userId: session.userId }, select: { id: true } })
    if (!site) return NextResponse.json({ error: 'not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.setting.deleteMany({ where: { siteId: id } }),
      prisma.domain.deleteMany({ where: { siteId: id } }),
      prisma.site.delete({ where: { id } })
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { body = {} }
  const data: Record<string, unknown> = {}
  if (typeof body?.name === 'string' && body.name.trim().length > 0) data.name = body.name.trim()
  if (typeof body?.status === 'string' && (body.status === 'active' || body.status === 'inactive')) data.status = body.status
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'no_changes' }, { status: 400 })
  try {
    const { id } = await params
    const result = await prisma.site.updateMany({ where: { id, userId: session.userId }, data })
    if (result.count === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}


