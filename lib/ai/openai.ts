import OpenAI from 'openai'
import axios from 'axios'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateImage(prompt: string): Promise<string> {
  const res = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })
  const url = res.data[0].url
  if (!url) throw new Error('No image URL returned from DALL-E 3')
  return url
}

export async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 })
  return Buffer.from(res.data)
}
