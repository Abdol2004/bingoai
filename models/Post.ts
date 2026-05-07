import mongoose, { Document, Schema } from 'mongoose'

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId
  workspaceId: mongoose.Types.ObjectId
  calendarWeekId: mongoose.Types.ObjectId
  platform: 'telegram' | 'discord' | 'x'
  topic: string
  contentBrief: string
  contentPillar?: 'educational' | 'engagement' | 'ragebait' | 'value'
  voiceType?: 'personal' | 'brand'
  caption?: string
  imagePrompt?: string
  scheduledAt: Date
  status: 'draft' | 'approved' | 'generating' | 'sent' | 'failed'
  agendaJobId?: string
  error?: string
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    calendarWeekId: { type: Schema.Types.ObjectId, ref: 'CalendarWeek', required: true },
    platform: { type: String, enum: ['telegram', 'discord', 'x'], required: true },
    topic: { type: String, required: true },
    contentBrief: { type: String, default: '' },
    contentPillar: { type: String, enum: ['educational', 'engagement', 'ragebait', 'value'] },
    voiceType:     { type: String, enum: ['personal', 'brand'], default: 'personal' },
    caption: { type: String },
    imagePrompt: { type: String },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'approved', 'generating', 'sent', 'failed'],
      default: 'draft',
    },
    agendaJobId: { type: String },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
)

PostSchema.index({ workspaceId: 1, scheduledAt: 1 })
PostSchema.index({ calendarWeekId: 1 })

export const Post = mongoose.models.Post ?? mongoose.model<IPost>('Post', PostSchema)
