
import { createHash } from 'node:crypto'

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function hashIp(ip: string): string {
  const salt = process.env.CHAT_IP_SALT ?? ''
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16)
}
