/**
 * Strategy & calendar generation — powered by DeepSeek (no Anthropic needed)
 */
import OpenAI from 'openai'
import { addDays, format } from 'date-fns'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export interface GeneratedPost {
  date: string
  platform: 'x'
  topic: string
  imagePrompt: string
  scheduledTime: string
  contentBrief: string
  contentPillar: 'educational' | 'engagement' | 'ragebait' | 'value'
}

export async function generateStrategy(params: {
  niche: string
  tone: string
  goals: string[]
  frequency: number
  campaignFocus?: string
  campaignBrief?: string
}): Promise<string> {
  const { niche, tone, goals, frequency, campaignFocus, campaignBrief } = params

  const campaignSection = campaignFocus
    ? `\nCurrent campaign focus: ${campaignFocus}${campaignBrief ? `\nCampaign details: ${campaignBrief}` : ''}`
    : ''

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a senior content strategist. Write in clean, flowing prose. No bold markdown, no bullet points, no headers, no asterisks of any kind.',
      },
      {
        role: 'user',
        content: `Write a focused X (Twitter) content strategy.

Niche: ${niche}
Tone: ${tone}
Goals: ${goals.join(', ')}
Posts per week: ${frequency}${campaignSection}

Write 3 short paragraphs covering:
1. What this strategy is trying to accomplish and why
2. The content mix and angles that will drive the goals
3. The posting rhythm and what each type of post should feel like

Rules:
- No bold, no asterisks, no headers, no bullet points
- Write like a strategist giving a verbal briefing
- Be specific to the niche and campaign, not generic
- Each paragraph gets one clear idea, well spaced`,
      },
    ],
    temperature: 0.7,
    max_tokens: 900,
  })

  const raw = res.choices?.[0]?.message.content?.trim() ?? ''
  return raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
}

export async function generateCalendar(params: {
  niche: string
  tone: string
  goals: string[]
  frequency: number
  platforms: string[]
  strategy: string
  weekStart: Date
  pillars?: string[]
  preferredTime?: string
  campaignFocus?: string
  campaignBrief?: string
}): Promise<{ posts: GeneratedPost[]; overallStrategy: string }> {
  const { niche, tone, goals, frequency, strategy, weekStart, pillars = ['educational','engagement','value','ragebait'], preferredTime = '10:00', campaignFocus, campaignBrief } = params

  const totalDays = 7
  const dates = Array.from({ length: totalDays }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  )

  const pillarGuide = {
    educational:  'teaches a specific insight, hook sounds surprising',
    engagement:   'gets replies and RTs, bold opinion or relatable situation',
    ragebait:     'hot controversial take, strong reaction, clear side taken',
    value:        'pure insight or thought leadership, non-obvious observation',
  }

  const pillarDescriptions = pillars
    .map(p => `- ${p}: ${pillarGuide[p as keyof typeof pillarGuide] ?? p}`)
    .join('\n')

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are an expert X (Twitter) content strategist. Always return valid JSON only — no markdown, no explanation.',
      },
      {
        role: 'user',
        content: `Generate an X (Twitter) content calendar.

Niche: ${niche}
Tone: ${tone}
Goals: ${goals.join(', ')}
Platform: X (Twitter) only
Posts needed: ${frequency}
Available dates: ${dates.join(', ')}
Preferred posting time: ${preferredTime}
Strategy: ${strategy}${campaignFocus ? `\n\nCampaign this period: ${campaignFocus}` : ''}${campaignBrief ? `\nCampaign details: ${campaignBrief}\n\nIMPORTANT: Every post must serve this campaign. Topics, hooks, and angles must connect back to it.` : ''}

Content pillars to use (distribute evenly):
${pillarDescriptions}

Return exactly ${frequency} posts. JSON format:
{
  "overallStrategy": "one sentence about this period's focus",
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "platform": "x",
      "topic": "specific, concrete post topic — not generic",
      "contentPillar": "educational|engagement|ragebait|value",
      "imagePrompt": "DALL-E 3 prompt only for educational posts, empty string for others",
      "scheduledTime": "${preferredTime}",
      "contentBrief": "2 sentences describing what the post says and what reaction it aims for"
    }
  ]
}

Rules:
- Spread posts across dates evenly
- Distribute content pillars as requested
- Topics must be specific and tied to the niche — no generic titles
- No more than 2 posts per day
- imagePrompt is only needed for educational pillar posts`,
      },
    ],
    temperature: 0.8,
    max_tokens: 4096,
  })

  const raw = res.choices?.[0]?.message.content ?? ''
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned invalid JSON for calendar. Try again.')
  }
}

export async function analyzeCompetitor(params: {
  handle: string
  platform: string
  niche: string
  posts: string[]
}): Promise<{
  postingFrequency: string
  topTopics: string[]
  contentStyle: string
  avgEngagement: string
  sponsoredPostsDetected: number
  sponsoredIndicators: string[]
  recommendations: string[]
  summary: string
}> {
  const { handle, platform, niche, posts } = params

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a competitive intelligence analyst. Always return valid JSON only.',
      },
      {
        role: 'user',
        content: `Analyze this competitor in the ${niche} niche.

Handle: @${handle}
Platform: ${platform}
Recent posts:
${posts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Return JSON:
{
  "postingFrequency": "e.g. 5-7 posts per week",
  "topTopics": ["topic1", "topic2", "topic3"],
  "contentStyle": "description of their style",
  "avgEngagement": "low|medium|high",
  "sponsoredPostsDetected": 0,
  "sponsoredIndicators": ["post snippet that looks sponsored"],
  "recommendations": ["what gaps to fill", "what to do differently"],
  "summary": "2-3 sentence competitive insight"
}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2048,
  })

  const raw = res.choices?.[0]?.message.content ?? ''
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      postingFrequency: 'Unknown',
      topTopics: [],
      contentStyle: 'Could not analyze. Profile may be private or the platform blocked scraping.',
      avgEngagement: 'unknown',
      sponsoredPostsDetected: 0,
      sponsoredIndicators: [],
      recommendations: ['Try a direct public profile URL', 'Make sure the handle is correct'],
      summary: 'Analysis could not be completed. The profile may be private or blocked.',
    }
  }
}
