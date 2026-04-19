create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

create index idx_contact_messages_email on contact_messages(email);
create index idx_contact_messages_created_at on contact_messages(created_at desc);
