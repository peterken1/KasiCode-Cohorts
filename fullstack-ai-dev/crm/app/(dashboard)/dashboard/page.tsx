import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StatCard from '@/components/dashboard/StatCard'
import RecentActivity from '@/components/dashboard/RecentActivity'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: totalContacts },
    { count: openDeals },
    { data: pipelineData },
    { data: wonData },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('deals').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).not('stage', 'in', '("won","lost")'),
    supabase.from('deals').select('value').eq('user_id', user.id)
      .not('stage', 'in', '("won","lost")'),
    supabase.from('deals').select('value').eq('user_id', user.id).eq('stage', 'won'),
    supabase.from('activities')
      .select('*, contacts(first_name, last_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const pipelineValue = pipelineData?.reduce((s, d) => s + Number(d.value), 0) ?? 0
  const wonValue      = wonData?.reduce((s, d) => s + Number(d.value), 0) ?? 0

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening in your pipeline.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Contacts"       value={totalContacts ?? 0} format="number"   colour="blue"   href="/contacts" />
        <StatCard label="Open Deals"     value={openDeals ?? 0}     format="number"   colour="green"  href="/deals" />
        <StatCard label="Pipeline Value" value={pipelineValue}       format="currency" colour="purple" href="/deals" />
        <StatCard label="Won Revenue"    value={wonValue}            format="currency" colour="teal"   href="/deals" />
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Recent activity</h2>
        <p className="text-xs text-gray-400 mb-5">Last 12 events across your CRM</p>
        <RecentActivity activities={recentActivities ?? []} />
      </div>
    </div>
  )
}
