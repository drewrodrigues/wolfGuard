import { v1 } from 'uuid'

export function uniqueRequestId(): number {
  return parseInt(v1().replace(/\D/g, '').slice(0, 5))
}
