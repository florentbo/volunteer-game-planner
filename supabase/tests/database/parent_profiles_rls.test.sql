begin;

select plan(12);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  phone,
  encrypted_password,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '+32470000001',
    '',
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '+32470000002',
    '',
    now(),
    now()
  );

insert into public.parent_profiles (user_id, full_name)
values
  ('11111111-1111-4111-8111-111111111111', 'Parent Un'),
  ('22222222-2222-4222-8222-222222222222', 'Parent Deux');

insert into public.children (parent_user_id, full_name, sort_order)
values
  ('11111111-1111-4111-8111-111111111111', 'Enfant Un', 0),
  ('22222222-2222-4222-8222-222222222222', 'Enfant Deux', 0);

select ok(not has_table_privilege('anon', 'public.parent_profiles', 'SELECT'), 'anonymous users cannot select profiles');
select ok(not has_table_privilege('anon', 'public.children', 'SELECT'), 'anonymous users cannot select children');
select ok(not has_table_privilege('authenticated', 'public.parent_profiles', 'INSERT'), 'parents cannot create profiles');
select ok(not has_table_privilege('authenticated', 'public.children', 'INSERT'), 'parents cannot create children');

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
set local role authenticated;
select is((select count(*) from public.parent_profiles), 1::bigint, 'parent reads one profile');
select is((select full_name from public.parent_profiles), 'Parent Un', 'parent reads their own profile');
select is((select count(*) from public.children), 1::bigint, 'parent reads one child');
select is((select full_name from public.children), 'Enfant Un', 'parent reads their own child');

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select is((select count(*) from public.parent_profiles), 1::bigint, 'second parent reads one profile');
select is((select full_name from public.parent_profiles), 'Parent Deux', 'second parent cannot read the first profile');
select is((select count(*) from public.children), 1::bigint, 'second parent reads one child');
select is((select full_name from public.children), 'Enfant Deux', 'second parent cannot read the first child');

select * from finish();
rollback;
