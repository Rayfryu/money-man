import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { DEFAULT_TRANSACTIONS } from '../../../lib/store';

export async function GET() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(*), wallets(*)')
      .order('date', { ascending: false });

    if (!error && data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Fallback ke data seed
  return new Response(JSON.stringify(DEFAULT_TRANSACTIONS), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_id, category_id, type, amount, notes, date } = body;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('transactions').insert([
        {
          user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          wallet_id,
          category_id,
          type,
          amount,
          notes,
          date,
        },
      ]).select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }

      return new Response(JSON.stringify(data[0]), { status: 201 });
    }

    return new Response(
      JSON.stringify({
        id: `tx-${Date.now()}`,
        ...body,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to create transaction' }), { status: 500 });
  }
}
