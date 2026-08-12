-- Seed data confirmed with the user on 2026-08-12.
-- Safe to re-run: skips rows that already exist by name.

insert into properties (name, brand) values
  ('Porini Lion Camp', 'porini'),
  ('Porini Rhino Camp', 'porini'),
  ('Porini Mara', 'porini'),
  ('Porini Giraffe Camp', 'porini'),
  ('Porini Amboseli', 'porini'),
  ('Rhino River Camp', 'gamewatchers'),
  ('Porini Safari Cottages', 'porini')
on conflict (name) do nothing;

insert into competitors (name) values
  ('Asilia Africa'),
  ('Cheli & Peacock'),
  ('Wilderness Safaris')
on conflict (name) do nothing;
