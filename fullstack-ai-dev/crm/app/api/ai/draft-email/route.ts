import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const STAGE_CONTEXT: Record<string, string> = {
  lead:      'This is an initial outreach. Be warm and curious. Ask to schedule a discovery call.',
  qualified: 'This contact is qualified. Reference what you know about their needs. Propose a deeper conversation.',
  proposal:  'A proposal has been shared. Follow up professionally. Offer to answer questions and confirm next steps.',
  won:       'This deal was just won. Send a warm welcome and confirm onboarding next steps.',
  lost:      'This deal was lost. Send a gracious closing email. Leave the door open for the future.',
}

export async function POST(request: NextRequest) {
  try {
    const { dealId } = await request.json()
    if (!dealId) return new Response('Deal ID required', { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorised', { status: 401 })

    const { data: deal } = await supabase
      .from('deals')
      .select('*, contacts(first_name, last_name, company, job_title, email)')
      .eq('id', dealId).eq('user_id', user.id).single()

    if (!deal) return new Response('Deal not found', { status: 404 })

    const { data: recentNotes } = await supabase
      .from('notes').select('content')
      .eq('contact_id', deal.contact_id).eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(3)

    const contact     = deal.contacts as any
    const stageGuide  = STAGE_CONTEXT[deal.stage] ?? STAGE_CONTEXT['lead']

    const prompt = `
You are a professional sales assistant drafting an email on behalf of a salesperson.
Write a concise, professional follow-up email.
Use a natural, human tone — not corporate or stiff.
Do not use placeholders like [Your Name] — write it as if ready to send.
Format: Subject line first, then the email body.

INSTRUCTION
${stageGuide}

DEAL
Title: ${deal.title}
Stage: ${deal.stage}
Value: R${Number(deal.value).toLocaleString('en-ZA')}
${deal.description ? `Description: ${deal.description}` : ''}

CONTACT
Name: ${contact?.first_name ?? ''} ${contact?.last_name ?? ''}
Company: ${contact?.company ?? 'their company'}
Job title: ${contact?.job_title ?? 'not specified'}

${recentNotes?.length ? `
RECENT CONTEXT (from notes)
${recentNotes.map((n: any) => `- ${n.content}`).join('\n')}
` : ''}`.trim()

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
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
    console.error('Draft email API error:', error)
    return new Response('AI service error', { status: 500 })
  }
}
