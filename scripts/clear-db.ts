import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import mongoose from 'mongoose'

async function clearDB() {
  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI not set in .env.local')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection

  const collections = ['users', 'workspaces', 'posts', 'calendarweeks', 'competitors', 'agendajobs']

  for (const col of collections) {
    const result = await db.collection(col).deleteMany({})
    console.log(`🗑  ${col}: ${result.deletedCount} documents removed`)
  }

  console.log('\n✅  Database cleared')
  await mongoose.disconnect()
}

clearDB().catch(console.error)
