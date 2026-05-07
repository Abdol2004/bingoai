import mongoose, { Document, Schema } from 'mongoose'

export interface ICalendarWeek extends Document {
  _id: mongoose.Types.ObjectId
  workspaceId: mongoose.Types.ObjectId
  weekStart: Date
  weekEnd: Date
  status: 'draft' | 'pending_approval' | 'approved' | 'completed'
  overallStrategy: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CalendarWeekSchema = new Schema<ICalendarWeek>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'completed'],
      default: 'pending_approval',
    },
    overallStrategy: { type: String, default: '' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
)

export const CalendarWeek =
  mongoose.models.CalendarWeek ??
  mongoose.model<ICalendarWeek>('CalendarWeek', CalendarWeekSchema)
