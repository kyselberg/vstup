import { integer, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const universities = sqliteTable('universities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const programs = sqliteTable('programs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  speciality_name: text('speciality_name').notNull(),
  university_id: text('university_id').references(() => universities.id),
  total: integer('total'),
  license: integer('license'),
  budget: integer('budget'),
  contract: integer('contract'),
  website: text('website'),
});

export const applicants = sqliteTable('applicants', {
  id: text('id').primaryKey(),
  program_id: text('program_id').references(() => programs.id),
  name: text('name').notNull(),
  position: integer('position'),
  mark: integer('mark'),
  priority: text('priority').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
});
