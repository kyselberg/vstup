CREATE TABLE `applicants` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text,
	`name` text NOT NULL,
	`position` integer,
	`mark` integer,
	`priority` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`speciality_name` text NOT NULL,
	`university_id` text,
	`total` integer,
	`budget` integer,
	`contract` integer,
	`website` text,
	FOREIGN KEY (`university_id`) REFERENCES `universities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `universities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
