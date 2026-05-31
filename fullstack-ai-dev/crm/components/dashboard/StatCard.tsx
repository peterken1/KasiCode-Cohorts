import Link from 'next/link'

type Colour = 'blue' | 'green' | 'purple' | 'teal'
type Format = 'number' | 'currency'

const STYLES: Record<Colour, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100' },
}

function fmt(value: number, format: Format) {
  if (format === 'currency') {
    return 'R\u00a0' + value.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return value.toLocaleString('en-ZA')
}

export default function StatCard({
  label, value, format, colour, href,
}: {
  label: string; value: number; format: Format; colour: Colour; href: string
}) {
  const s = STYLES[colour]
  return (
    <Link href={href}
      className={`block rounded-xl border p-4 lg:p-5 transition-all
        hover:shadow-sm hover:scale-[1.01] ${s.bg} ${s.border}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold ${s.text}`}>{fmt(value, format)}</p>
    </Link>
  )
}
