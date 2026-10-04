-- Execute este arquivo no SQL Editor do Supabase.
-- A política permite que visitantes enviem confirmações,
-- mas impede leitura, alteração ou exclusão usando a chave pública.

create table if not exists public.confirmacoes (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(trim(nome)) between 2 and 100),
  pessoas smallint not null check (pessoas between 1 and 20),
  convidado text,
  created_at timestamptz not null default now()
);

alter table public.confirmacoes enable row level security;

revoke all on table public.confirmacoes from anon;
grant usage on schema public to anon;
grant insert (nome, pessoas, convidado) on table public.confirmacoes to anon;
grant usage on sequence public.confirmacoes_id_seq to anon;

drop policy if exists "Convidados podem confirmar presença" on public.confirmacoes;
create policy "Convidados podem confirmar presença"
on public.confirmacoes
for insert
to anon
with check (
  char_length(trim(nome)) between 2 and 100
  and pessoas between 1 and 20
);

-- Não há política de SELECT para anon:
-- somente os noivos, pelo painel do Supabase, poderão consultar as respostas.
