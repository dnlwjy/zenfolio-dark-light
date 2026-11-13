
import { getSql } from '@/db/client'
import { chatConfig } from '@/lib/config/chat'

async function spendSince(truncate: 'day' | 'month'): Promise<number> {
  const sql = getSql()
  const rows = await sql<Array<{ total: string | null }>>`
    select coalesce(sum(cost_usd), 0)::text as total
    from chat_message
    where created_at >= date_trunc(${truncate}, now())
  `

  return Number(rows[0]?.total ?? 0)
}

export type BudgetStatus = {
  spentUsd: number
  limitUsd: number
  exceeded: boolean
  warning: boolean
}

export async function dailyBudgetStatus(): Promise<BudgetStatus> {
  const spentUsd = await spendSince('day')
  const limitUsd = chatConfig.budget.dailyUsd

  return {
    spentUsd,
    limitUsd,
    exceeded: spentUsd >= limitUsd,
    warning: spentUsd >= limitUsd * chatConfig.budget.alertThreshold,
  }
}

export async function monthlySpendUsd(): Promise<number> {
  return spendSince('month')
}
