import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export type ContentPillar = 'educational' | 'engagement' | 'ragebait' | 'value'

const PILLAR_GUIDE: Record<ContentPillar, string> = {
  educational:
    'Teach one specific, valuable insight. The hook must make the lesson sound surprising or counterintuitive. Structure it so each line reveals something new.',
  engagement:
    'Write something people cannot help but respond to. Bold opinion, relatable situation, or a statement that makes them feel seen or challenged. Build toward a question or statement that forces a reply.',
  ragebait:
    'Write a hot take that triggers a strong reaction. Take a clear, controversial side. Be direct and unapologetic. The goal is to make people who disagree want to reply immediately.',
  value:
    'Pure insight with no fluff. Share a specific, non-obvious observation or lesson that sounds like it came from real experience. Every line must earn its place.',
}

const SYSTEM_PROMPT = `You are a ghostwriter for an experienced professional on X (Twitter). You write posts that get thousands of impressions.

STRICT RULES — break any of these and the post is rejected:
- The first line is the HOOK. It must stop the scroll. Make it specific, provocative, or so counterintuitive they have to keep reading.
- Short sentences. Heavy use of line breaks. No walls of text.
- Sound like a sharp, opinionated 30-year-old who has actually lived this stuff. Smart but not stiff.
- NO emojis. Not one.
- NO hyphens. Use commas or full stops instead.
- NO bold markdown. No **text** whatsoever.
- NO hashtags.
- NO numbered or bullet lists.
- NO filler openers like "In today's world", "Let's be honest", "It's no secret", "Let's dive in", "This is important".
- Contractions make it human. Use them.
- Vary sentence length. Short. Then a bit longer. Then short again.
- End on a strong POV statement or a question that makes people want to reply.
- NEVER sound like AI wrote it. NEVER.`

function cleanPost(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^[-–—]\s+/gm, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')  // remove emoji surrogate pairs
    .replace(/[☀-➿⬀-⯿]/g, '')    // remove misc symbols
    .replace(/#\w+/g, '')
    .trim()
}

export async function generateXPost(params: {
  topic: string
  contentBrief: string
  pillar: ContentPillar
}): Promise<string> {
  const { topic, contentBrief, pillar } = params

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Write an X post.

Topic: ${topic}
Brief: ${contentBrief}
Type: ${pillar}
Goal: ${PILLAR_GUIDE[pillar]}

Return the post text only. Nothing else.`,
      },
    ],
    temperature: 0.92,
    max_tokens: 500,
  })

  return cleanPost(res.choices?.[0]?.message.content?.trim() ?? '')
}

const STYLE_MAP: Record<ContentPillar, string> = {
  educational: 'clean editorial infographic style, geometric shapes, structured layout with strong visual hierarchy, flat design with subtle depth',
  engagement:  'bold typographic poster style, high contrast, one dominant visual element, modern graphic design, eye-catching',
  ragebait:    'stark brutalist graphic design, raw and direct, extreme contrast between light and dark, zero decoration, confrontational composition',
  value:       'premium minimal design, generous white space, refined typography feel, sophisticated color blocking, like a high-end magazine spread',
}

const COMPOSITION_MAP: Record<ContentPillar, string> = {
  educational: 'centered focal point with supporting geometric elements radiating outward, clean grid structure',
  engagement:  'asymmetric layout with strong diagonal energy, the main visual occupies 60% of the frame',
  ragebait:    'full-bleed background with single dominant element, nothing competing for attention',
  value:       'balanced negative space, single strong visual metaphor centered or rule-of-thirds positioned',
}

export async function generateImageGuidance(params: {
  topic: string
  pillar: ContentPillar
  brandColors?: string
  logoDescription?: string
  preferredSize?: string
}): Promise<{ type: 'prompt' | 'idea'; content: string }> {
  const {
    topic, pillar,
    brandColors,
    logoDescription,
    preferredSize = '1024x1024',
  } = params

  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a senior art director and visual designer. Write image prompts that produce stunning, award-winning social media graphics.',
      },
      {
        role: 'user',
        content: `Write a DALL-E 3 / ChatGPT image prompt for a social media graphic about: "${topic}"

Design style: ${STYLE_MAP[pillar]}
Composition: ${COMPOSITION_MAP[pillar]}
Format: ${preferredSize} square
Platform: X (Twitter) — professional audience

Requirements:
- No text, words, or letters in the image
- The visual should work as a standalone piece and also with a logo overlaid
- High resolution, ultra detailed, professional quality
- The image should feel intentional and designed, not generic stock photo
- Think about what a top creative agency would produce for this topic

Return only the image prompt. 2-3 sentences. Be specific about colors, textures, lighting, and mood.`,
      },
    ],
    temperature: 0.85,
    max_tokens: 250,
  })

  const basePrompt = res.choices?.[0]?.message.content?.trim() ?? ''

  // Build the brand integration block
  const brandBlock = buildBrandBlock({ brandColors, logoDescription, preferredSize, pillar })

  return {
    type: 'prompt',
    content: `${basePrompt}\n\n${brandBlock}`,
  }
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
    ragebait:    'top-right corner, small — let the message dominate',
    value:       'bottom-center or bottom-right, subtle',
  }

  const lines: string[] = ['--- Brand integration (add manually in ChatGPT) ---']

  if (brandColors) {
    lines.push(`Colors: Apply "${brandColors}" as the dominant palette. Use the primary color for the main focal element and the secondary as background or shadow tones.`)
  } else {
    lines.push(`Colors: Tell ChatGPT your brand colors when uploading — e.g. "use [your color] as the dominant accent".`)
  }

  if (logoDescription) {
    lines.push(`Logo: Upload your logo (${logoDescription}) and ask ChatGPT to place it in the ${logoPositions[pillar]}. Make sure you upload it on a transparent background for clean integration.`)
  } else {
    lines.push(`Logo: Upload your logo file and tell ChatGPT: "place the logo in the ${logoPositions[pillar]}, keep it clean and proportional".`)
  }

  lines.push(`Size: ${preferredSize}. If using ChatGPT, set the image size accordingly before generating.`)
  lines.push(`Tip: Paste the prompt above, then add "Use [your brand colors]. Place my logo (attached) in the ${logoPositions[pillar]}." for best results.`)

  return lines.join('\n')
}

// Keep old name as alias for worker compatibility
export async function generateCaption(params: {
  topic: string
  contentBrief: string
  tone: string
  platform: string
}): Promise<string> {
  return generateXPost({
    topic: params.topic,
    contentBrief: params.contentBrief,
    pillar: 'value',
  })
}
