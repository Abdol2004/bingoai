import Agenda from 'agenda'

let agendaInstance: Agenda | null = null

export function getAgenda(): Agenda {
  if (!agendaInstance) {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set')
    agendaInstance = new Agenda({
      db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
      processEvery: '30 seconds',
      maxConcurrency: 5,
    })
  }
  return agendaInstance
}

export async function startAgenda() {
  const agenda = getAgenda()
  await agenda.start()
  return agenda
}

export async function schedulePost(postId: string, scheduledAt: Date) {
  const agenda = getAgenda()
  const job = await agenda.schedule(scheduledAt, 'generate-and-post', { postId })
  return job.attrs._id?.toString()
}

export async function cancelJob(jobId: string) {
  const agenda = getAgenda()
  await agenda.cancel({ _id: jobId } as Parameters<typeof agenda.cancel>[0])
}
