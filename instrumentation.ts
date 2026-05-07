export async function register() {
  // Only runs in Node.js runtime (not Edge), only in development
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV !== 'production'
  ) {
    const { startDevBot } = await import('./lib/bots/telegram-dev')
    startDevBot()
  }
}
