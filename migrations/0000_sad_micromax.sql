CREATE TABLE `chat` (
	`chat_id` integer NOT NULL,
	`message_id` integer NOT NULL,
	`from_user_name` text,
	`date` integer DEFAULT 0 NOT NULL,
	`message_type` text DEFAULT 'text' NOT NULL,
	`message` text,
	`reply_chat_id` integer,
	`reply_message_id` integer,
	`file_id` text,
	PRIMARY KEY(`chat_id`, `message_id`)
);
--> statement-breakpoint
CREATE INDEX `date_idx` ON `chat` (`date`);