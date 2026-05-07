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
    ? '- First person: "I", "me", "my" — never "we" or "our"'
    : '- First person plural: "we", "our", "us" — never "I" or "me"'

  return `You are a ghostwriter for an experienced professional on X (Twitter).

STRICT RULES — follow every one:
- HOOK: First line must stop the scroll. Specific, bold, or counterintuitive.
- Write complete thoughts. No one-word or two-word sentence fragments.
- Medium sentence length — full ideas per line. Not too short, not too long.
- If you must list anything, use arrows (→) — never numbers, never bullet points, never hyphens.
${voiceRule}
- NO ellipsis (...) anywhere. Ever.
- NO emojis. Not one.
- NO hyphens as punctuation. Use commas or full stops instead.
- NO bold markdown (**text**).
- NO hashtags.
- NO filler openers: "In today's world", "Let's be honest", "Hot take:", "Let's dive in".
- Use contractions. Sound like a real person.
- End on a strong POV or a question that sparks replies.
- NEVER sound like AI wrote it.`
}

function cleanPost(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-–—]\s+/gm, '→ ')      // convert hyphens to arrows
    .replace(/^\d+\.\s+/gm, '→ ')      // convert numbered lists to arrows
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
  wordLimit?: number
}): Promise<string> {
  const { topic, contentBrief, pillar, voiceType = 'personal', wordLimit = 120 } = params

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
Word limit: ${wordLimit} words maximum

Return the post only. Nothing else.`,
      },
    ],
    temperature: 0.92,
    max_tokens: Math.min(600, wordLimit * 6),
  })

  return cleanPost(res.choices?.[0]?.message.content?.trim() ?? '')
}

export async function generateImageGuidance(params: {
  topic: string
  pillar: ContentPillar
  brandColors?: string
  logoDescription?: string
  preferredSize?: string
}): Promise<{ type: 'prompt' | 'idea'; content: string }> {
  const { topic, pillar, brandColors, logoDescription, preferredSize = '1024x1024' } = params

  const pillarStyle: Record<ContentPillar, string> = {
    educational: 'clean editorial design, structured, professional, clear focal point',
    engagement:  'bold typographic style, high contrast, eye-catching, one dominant visual element',
    ragebait:    'stark brutalist graphic, extreme contrast between light and dark, confrontational composition',
    value:       'premium minimal design, generous negative space, sophisticated, magazine-quality',
  }

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a senior art director at a top creative agency. Write image prompts that produce stunning, ultra-sharp social media visuals. Every prompt should feel like it came from a professional creative brief.',
      },
      {
        role: 'user',
        content: `Write a DALL-E 3 / ChatGPT image prompt for this X (Twitter) post topic: "${topic}"

Style: ${pillarStyle[pillar]}
Format: ${preferredSize}
Audience: Professional X (Twitter)

Requirements:
- Ultra-sharp, high resolution, professional quality
- No text, words, or letters in the image
- Strong visual composition with clear focal point
- Specific about lighting, textures, colors, and mood
- The image should work with a logo overlaid
- Think top creative agency output

Return only the image prompt. 2-3 rich, specific sentences.`,
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
    educational: 'bottom-right corner, small and clean',
    engagement:  'bottom-left corner, give it breathing room',
    ragebait:    'top-right corner, small',
    value:       'bottom-center or bottom-right, subtle',
  }

  const lines: string[] = ['--- Add manually when uploading to ChatGPT ---']

  if (brandColors) {
    lines.push(`Colors: Use "${brandColors}" — primary as dominant accent, secondary as background or shadow.`)
  } else {
    lines.push(`Colors: Tell ChatGPT your brand colors — e.g. "use [your color] as the dominant accent".`)
  }

  if (logoDescription) {
    lines.push(`Logo: Upload your logo (${logoDescription}) → place it ${logoPositions[pillar]}. Transparent background works best.`)
  } else {
    lines.push(`Logo: Upload your logo file → tell ChatGPT "place the logo ${logoPositions[pillar]}, keep it clean".`)
  }

  lines.push(`Size: ${preferredSize}.`)
  lines.push(`Tip: You can also upload a photo of a person, product, or scene and ask ChatGPT to incorporate it into this design.`)

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
