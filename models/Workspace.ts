import mongoose, { Document, Schema } from 'mongoose'

export interface IBrandSettings {
  primaryColor?: string
  secondaryColor?: string
  logoDescription?: string
  preferredImageSize?: '1024x1024' | '1792x1024' | '1024x1792'
}

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  name: string
  niche: string
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational'
  goals: string[]
  postingFrequency: number
  strategy?: string
  strategyGeneratedAt?: Date
  campaignFocus?: string
  campaignBrief?: string
  brandSettings?: IBrandSettings
  platforms: {
    telegram: { enabled: boolean; channelId?: string }
    discord: { enabled: boolean; channelId?: string; guildId?: string }
    x: { enabled: boolean }
  }
  createdAt: Date
  updatedAt: Date
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    niche: { type: String, default: '' },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational'],
      default: 'professional',
    },
    goals: [{ type: String }],
    postingFrequency: { type: Number, default: 7, min: 1, max: 21 },
    strategy: { type: String },
    strategyGeneratedAt: { type: Date },
    campaignFocus: { type: String },
    campaignBrief: { type: String },
    brandSettings: {
      primaryColor:       { type: String },
      secondaryColor:     { type: String },
      logoDescription:    { type: String },
      preferredImageSize: { type: String, default: '1024x1024' },
    },
    platforms: {
      telegram: { enabled: { type: Boolean, default: false }, channelId: { type: String } },
      discord:  { enabled: { type: Boolean, default: false }, channelId: { type: String }, guildId: { type: String } },
      x:        { enabled: { type: Boolean, default: false } },
    },
  },
  { timestamps: true }
)

export const Workspace =
  mongoose.models.Workspace ?? mongoose.model<IWorkspace>('Workspace', WorkspaceSchema)
