import mongoose, { Document, Schema } from 'mongoose'

export interface ICompetitor extends Document {
  _id: mongoose.Types.ObjectId
  workspaceId: mongoose.Types.ObjectId
  name: string
  platform: string
  handle: string
  url: string
  lastAnalyzed?: Date
  insights?: {
    postingFrequency: string
    topTopics: string[]
    contentStyle: string
    avgEngagement: string
    sponsoredPostsDetected: number
    sponsoredIndicators: string[]
    recommendations: string[]
    summary: string
  }
  createdAt: Date
  updatedAt: Date
}

const CompetitorSchema = new Schema<ICompetitor>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, trim: true },
    platform: { type: String, required: true },
    handle: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    lastAnalyzed: { type: Date },
    insights: {
      postingFrequency: String,
      topTopics: [String],
      contentStyle: String,
      avgEngagement: String,
      sponsoredPostsDetected: Number,
      sponsoredIndicators: [String],
      recommendations: [String],
      summary: String,
    },
  },
  { timestamps: true }
)

export const Competitor =
  mongoose.models.Competitor ?? mongoose.model<ICompetitor>('Competitor', CompetitorSchema)
