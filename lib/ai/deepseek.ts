import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export type ContentPillar = 'educational' | 'engagement' | 'ragebait' | 'value'
export type VoiceType = 'personal' | 'brand'

const PILLAR_GUIDE: Record<ContentPillar, string> = {
  educational: 'Teach one specific insight. The hook must make it sound surprising or counterintuitive. Each line should reveal something new.',
  engagement:  'Write something people cannot help but respond to. Bold opinion or relatable situation that forces a reply.',
  ragebait:    'Hot take that triggers a reaction. Take one clear controversial side. Make people who disagree want to reply immediately.',
  value:       'Pure insight, no fluff. One non-obvious observation that sounds like it came from real experience.',
}

function getSystemPrompt(voiceType: VoiceType = 'personal'): string {
  const voiceRule = voiceType === 'personal'
    ? '- Write in first person: use "I", "me", "my" — never "we" or "our"'
    : '- Write in first person plural: use "we", "our", "us" — never "I" or "me"'

  return `You are a ghostwriter for an experienced professional on X (Twitter).

STRICT RULES — every single one:
- HOOK: First line must stop the scroll. Specific, bold, or counterintuitive.
- Keep it SHORT. Max 4-6 lines total. Never more than 80 words.
- Short punchy sentences. One idea per line. Heavy line breaks.
- Sound like a real opinionated person. Smart but not stiff.
${voiceRule}
- NO ellipsis (...) anywhere. Ever.
- NO emojis. Not one.
- NO hyphens. Use commas or full stops instead.
- NO bold markdown (**text**).
- NO hashtags.
- NO bullet points or numbered lists.
- NO filler openers: "In today's world", "Let's be honest", "It's no secret", "Hot take:".
- Use contractions. Vary sentence length.
- End on a strong POV or a question that sparks replies.
- NEVER sound like AI wrote it.`
}

function cleanPost(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-–—]\s+/gm, '')
    .replace(/\.\.\./g, '')
    .replace(/…/g, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/#\w+/g, '')
    .trim()
}

export async function generateXPost(params: {
  topic: string
  contentBrief: string
  pillar: ContentPillar
  voiceType?: VoiceType
}): Promise<string> {
  const { topic, contentBrief, pillar, voiceType = 'personal' } = params

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: getSystemPrompt(voiceType) },
      {
        role: 'user',
        content: `Write an X post.

Topic: ${topic}
Brief: ${contentBrief}
Type: ${pillar}
Goal: ${PILLAR_GUIDE[pillar]}

Return the post only. Nothing else. Keep it under 80 words.`,
      },
    ],
    temperature: 0.92,
    max_tokens: 300,
  })

  return cleanPost(res.choices?.[0]?.message.content?.trim() ?? '')
}

const STYLE_MAP: Record<ContentPillar, string> = {
  educational: 'clean minimal design, device mockup style, professional and structured',
  engagement:  'bold typographic poster, high contrast, one dominant visual, eye-catching',
  ragebait:    'stark brutalist graphic, extreme contrast, raw and direct, confrontational',
  value:       'premium minimal, generous white space, refined color blocking, magazine feel',
}

const COMPOSITION_MAP: Record<ContentPillar, string> = {
  educational: 'device mockup centered — laptop or phone frame with the screen area clearly visible for content placement',
  engagement:  'asymmetric layout, strong diagonal energy, main visual takes 60% of frame',
  ragebait:    'full-bleed background, single dominant element, nothing competing for attention',
  value:       'balanced negative space, single strong visual metaphor, rule-of-thirds',
}

export async function generateImageGuidance(params: {
  topic: string
  pillar: ContentPillar
  brandColors?: string
  logoDescription?: string
  preferredSize?: string
}): Promise<{ type: 'prompt' | 'idea'; content: string }> {
  const { topic, pillar, brandColors, logoDescription, preferredSize = '1024x1024' } = params

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a senior art director. Write image prompts that produce stunning social media graphics. For educational posts always suggest a device mockup (MacBook, iPhone, iPad) so the user can screenshot their content and embed it into the device screen.',
      },
      {
        role: 'user',
        content: `Write a DALL-E 3 / ChatGPT image prompt for a social media post about: "${topic}"

Design style: ${STYLE_MAP[pillar]}
Composition: ${COMPOSITION_MAP[pillar]}
Format: ${preferredSize}
Platform: X (Twitter)

${pillar === 'educational' ? `This is an EDUCATIONAL post. The image MUST be a device mockup (MacBook Pro on a minimal desk, or a floating iPhone/iPad). The screen area should appear as a clean glowing surface — the user will screenshot their content and embed it there. Make the mockup photorealistic. Describe the device angle, desk props, and lighting. Leave the screen area intentionally simple/bright so content can be placed on it.` : ''}

Requirements:
- No text or words in the image
- High resolution, ultra detailed, professional
- Works well with a logo overlay
- Specific about lighting, textures, colors, mood

Return only the prompt. 2-3 sentences.`,
      },
    ],
    temperature: 0.85,
    max_tokens: 250,
  })

  const basePrompt = res.choices?.[0]?.message.content?.trim() ?? ''
  const brandBlock = buildBrandBlock({ brandColors, logoDescription, preferredSize, pillar })

  return { type: 'prompt', content: `${basePrompt}\n\n${brandBlock}` }
}

function buildBrandBlock(params: {
  brandColors?: string
  logoDescription?: string
  preferredSize?: string
  pillar: ContentPillar
}): string {
  const { brandColors, logoDescription, preferredSize = '1024x1024', pillar } = params

  const logoPositions: Record<ContentPillar, string> = {
    educational: 'bottom-right corner of the image, outside the device screen',
    engagement:  'bottom-left corner, give it breathing room',
    ragebait:    'top-right corner, small',
    value:       'bottom-center, subtle',
  }

  const screenshotNote = pillar === 'educational'
    ? `\nScreenshot tip: Take a screenshot of your content (app, tweet, chart, anything) → open in Canva or Photoshop → place it on the device screen using a frame/smart object → export as final image.`
    : ''

  const lines: string[] = ['--- Add manually when uploading to ChatGPT or DALL-E ---']

  if (brandColors) {
    lines.push(`Colors: Use "${brandColors}" — primary color on the main focal element, secondary as background or accent.`)
  } else {
    lines.push(`Colors: Tell ChatGPT your brand colors — e.g. "use [color] as the dominant accent".`)
  }

  if (logoDescription) {
    lines.push(`Logo: Upload your logo (${logoDescription}) → place it ${logoPositions[pillar]}. Transparent background works best.`)
  } else {
    lines.push(`Logo: Upload your logo → tell ChatGPT "place the logo ${logoPositions[pillar]}, keep it clean and proportional".`)
  }

  lines.push(`Size: ${preferredSize}.${screenshotNote}`)

  return lines.join('\n')
}

export async function generateCaption(params: {
  topic: string
  contentBrief: string
  tone: string
  platform: string
}): Promise<string> {
  return generateXPost({ topic: params.topic, contentBrief: params.contentBrief, pillar: 'value' })
}
