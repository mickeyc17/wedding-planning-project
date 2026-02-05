insert into allowed_users (email)
values
  ('mickey@example.com'),
  ('shivani@example.com')
on conflict do nothing;

insert into tasks (title, notes, owner, due_date, priority, labels, checklist, status, position)
values
  (
    'Book venue tour',
    'Call three venues and book tours for next week.',
    'Mickey',
    (current_date + 6),
    'High',
    array['venue', 'logistics'],
    '[{\"id\":\"1\",\"label\":\"Shortlist 5 venues\",\"completed\":true},{\"id\":\"2\",\"label\":\"Email availability\",\"completed\":false}]'::jsonb,
    'This Month',
    0
  ),
  (
    'Finalize guest list draft',
    'Combine family inputs and flag open questions.',
    'Shivani',
    (current_date + 10),
    'Medium',
    array['guests'],
    '[]'::jsonb,
    'Backlog',
    0
  ),
  (
    'Choose photographer',
    'Compare quotes and sample galleries.',
    'Mickey',
    (current_date + 3),
    'Critical',
    array['photo'],
    '[]'::jsonb,
    'In Progress',
    0
  ),
  (
    'Confirm caterer tasting date',
    'Waiting on availability confirmation.',
    'Shivani',
    (current_date + 14),
    'Medium',
    array['food'],
    '[]'::jsonb,
    'Waiting',
    0
  ),
  (
    'Book officiant',
    'Signed contract received.',
    'Mickey',
    (current_date - 2),
    'Low',
    array['ceremony'],
    '[]'::jsonb,
    'Done',
    0
  );
