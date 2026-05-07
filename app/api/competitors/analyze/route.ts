import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Workspace } from '@/models/Workspace'
import { Competitor } from '@/models/Competitor'
import { getSession } from '@/lib/auth'
import { analyzeCompetitor } from '@/lib/ai/claude'
import axios from 'axios'
import * as cheerio from 'cheerio'

async function scrapePublicPosts(url: string, platform: string): Promise<string[]> {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    })

    // If response is HTML (blocked/login wall), bail out early
    if (typeof data === 'string' && data.trim().startsWith('<')) {
      return []
    }

    const $ = cheerio.load(data)
    const posts: string[] = []
    $('p, article, [class*="post"], [class*="tweet"], [class*="content"]').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 30 && text.length < 1000) posts.push(text)
    })
    return posts.slice(0, 15)
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { competitorId } = await req.json()
    if (!competitorId) return NextResponse.json({ error: 'competitorId required' }, { status: 400 })

    await connectDB()
    const user = await User.findById(session.userId)
    const workspace = await Workspace.findById(user?.workspaceId)

    const competitor = await Competitor.findOne({
      _id: competitorId,
      workspaceId: user?.workspaceId,
    })
    if (!competitor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const posts = await scrapePublicPosts(competitor.url, competitor.platform)

    const insights = await analyzeCompetitor({
      handle: competitor.handle,
      platform: competitor.platform,
      niche: workspace?.niche ?? 'general',
      posts,
    })

    competitor.insights = insights
    competitor.lastAnalyzed = new Date()
    await competitor.save()

    return NextResponse.json({ data: competitor })
  } catch (err) {
    console.error('[competitor analyze]', err)
    return NextResponse.json({ error: 'Failed to analyze competitor' }, { status: 500 })
  }
}
