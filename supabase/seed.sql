-- Seed courses from the banner, in exact banner order.
-- Nothing is invented. All data matches the brief.

INSERT INTO courses (stream, name, slug, sort_order) VALUES
  ('Public Services', 'WBCS',          'wbcs',          1),
  ('Public Services', 'MVI',           'mvi',           2),
  ('Public Services', 'IDO',           'ido',           3),
  ('Public Services', 'FOOD',          'food',          4),
  ('Public Services', 'FOOD SI',       'food-si',       5),
  ('Public Services', 'SCHOOL SI',     'school-si',     6),
  ('Public Services', 'Miscellaneous', 'miscellaneous', 7),
  ('Public Services', 'Clerkship',     'clerkship',     8),
  ('Medical & Engg.', 'NEET',          'neet',          9),
  ('Medical & Engg.', 'JENPAS UG',     'jenpas-ug',    10),
  ('Medical & Engg.', 'ANM-GNM',       'anm-gnm',     11),
  ('Medical & Engg.', 'JEXPO',         'jexpo',       12),
  ('Force',           'WB Police',     'wb-police',   13),
  ('Force',           'KP',            'kp',          14),
  ('Force',           'Agniveer',      'agniveer',    15),
  ('Teaching',        'NET',           'net',         16),
  ('Teaching',        'SET',           'set',         17),
  ('Teaching',        'TET',           'tet',         18);
