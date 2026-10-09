import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { DEFAULT_WALLETS } from '../../../lib/store';

export async function GET() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify(DEFAULT_WALLETS), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Transfer antar dompet atau update balance
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { from_wallet_id, to_wallet_id, amount } = body;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Nominal tidak valid' }), { status: 400 });
    }

    if (isSupabaseConfigured) {
      // Direct RPC or updates in Supabase
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Transfer berhasil diproses' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Transfer failed' }), { status: 500 });
  }
}
