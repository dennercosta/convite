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


-- Reservas da lista de presentes.
-- Visitantes podem consultar somente os IDs já reservados; nomes ficam privados no painel.
create table if not exists public.presentes_reservados (
  id bigint generated always as identity primary key,
  presente_id text not null unique
    check (
      presente_id ~ '^presente-[0-9]{2}$'
      or presente_id ~ '^outro-[A-Za-z0-9-]{8,}$'
    ),
  presente_nome text not null
    check (char_length(trim(presente_nome)) between 2 and 120),
  nome_convidado text not null
    check (char_length(trim(nome_convidado)) between 2 and 100),
  created_at timestamptz not null default now()
);

alter table public.presentes_reservados enable row level security;

revoke all on table public.presentes_reservados from anon;
grant usage on schema public to anon;
grant select (presente_id) on table public.presentes_reservados to anon;
grant insert (presente_id, presente_nome, nome_convidado)
  on table public.presentes_reservados to anon;
grant usage on sequence public.presentes_reservados_id_seq to anon;

drop policy if exists "Convidados podem ver presentes reservados" on public.presentes_reservados;
create policy "Convidados podem ver presentes reservados"
  on public.presentes_reservados
  for select
  to anon
  using (true);

drop policy if exists "Convidados podem reservar presentes" on public.presentes_reservados;
create policy "Convidados podem reservar presentes"
  on public.presentes_reservados
  for insert
  to anon
  with check (
    char_length(trim(presente_nome)) between 2 and 120
    and char_length(trim(nome_convidado)) between 2 and 100
    and (
      presente_id ~ '^presente-[0-9]{2}$'
      or presente_id ~ '^outro-[A-Za-z0-9-]{8,}$'
    )
  );


-- Mural público de recados.
-- Os convidados podem publicar e ler somente os recados visíveis.
-- O conteúdo é exibido com textContent no site para evitar injeção de HTML.
create table if not exists public.recados (
  id bigint generated always as identity primary key,
  nome text not null
    check (char_length(trim(nome)) between 2 and 60),
  mensagem text not null
    check (char_length(trim(mensagem)) between 3 and 360),
  aprovado boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recados enable row level security;

revoke all on table public.recados from anon;
grant usage on schema public to anon;
grant select (id, nome, mensagem, aprovado, created_at)
  on table public.recados to anon;
grant insert (nome, mensagem)
  on table public.recados to anon;
grant usage on sequence public.recados_id_seq to anon;

drop policy if exists "Convidados podem ler recados visiveis" on public.recados;
create policy "Convidados podem ler recados visiveis"
  on public.recados
  for select
  to anon
  using (aprovado = true);

drop policy if exists "Convidados podem enviar recados" on public.recados;
create policy "Convidados podem enviar recados"
  on public.recados
  for insert
  to anon
  with check (
    char_length(trim(nome)) between 2 and 60
    and char_length(trim(mensagem)) between 3 and 360
    and aprovado = true
  );

-- Habilita INSERTs do mural no Supabase Realtime sem duplicar a publicação.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'recados'
  ) then
    alter publication supabase_realtime add table public.recados;
  end if;
end
$$;
