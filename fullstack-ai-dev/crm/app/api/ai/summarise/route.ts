import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json()
    if (!contactId) return new Response('Contact ID required', { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorised', { status: 401 })

    const { data: contact } = await supabase
      .from('contacts')
      .select('*, deals(*), notes(*), activities(*)')
      .eq('id', contactId)
      .eq('user_id', user.id)
      .single()

    if (!contact) return new Response('Contact not found', { status: 404 })

    const { deals = [], notes = [], activities = [] } = contact

    const prompt = `
You are a CRM assistant helping a salesperson prepare for a client interaction.
Provide a concise 3-4 sentence briefing on this contact.
Be specific — mention deal names, stages, and values where relevant.
End with one clear recommended next action.

CONTACT
Name: ${contact.first_name} ${contact.last_name}
Company: ${contact.company ?? 'Not specified'}
Job title: ${contact.job_title ?? 'Not specified'}
Email: ${contact.email ?? 'Not specified'}

ACTIVE DEALS (${deals.filter((d: any) => d.stage !== 'won' && d.stage !== 'lost').length})
${deals.length === 0
  ? 'No deals on record.'
  : deals.map((d: any) =>
    `- ${d.title}: ${d.stage} stage, R${Number(d.value).toLocaleString('en-ZA')}`
  ).join('\n')
}

RECENT NOTES (last 5)
${notes.length === 0
  ? 'No notes on record.'
  : notes.slice(0, 5).map((n: any) => `- ${n.content}`).join('\n')
}

RECENT ACTIVITY (last 8)
${activities.length === 0
  ? 'No activity on record.'
  : activities.slice(0, 8).map((a: any) => `- ${a.description}`).join('\n')
}`.trim()

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('Summarise API error:', error)
    return new Response('AI service error', { status: 500 })
  }
}
