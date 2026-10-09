import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { DEFAULT_SAVINGS_GOALS } from '../../../lib/store';

export async function GET() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('deadline', { ascending: true });

    if (!error && data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify(DEFAULT_SAVINGS_GOALS), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, target_amount, deadline, icon } = body;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('savings_goals').insert([
        {
          user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          title,
          target_amount,
          current_amount: 0,
          deadline,
          icon: icon || 'Target',
        },
      ]).select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }

      return new Response(JSON.stringify(data[0]), { status: 201 });
    }

    return new Response(
      JSON.stringify({
        id: `sg-${Date.now()}`,
        ...body,
        current_amount: 0,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to create savings goal' }), { status: 500 });
  }
}
