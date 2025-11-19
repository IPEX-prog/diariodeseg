CREATE TABLE `epiChecklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`constructionSite` varchar(255) NOT NULL,
	`inspectionDate` timestamp NOT NULL,
	`inspectionTime` varchar(10) NOT NULL,
	`inspectorName` varchar(255) NOT NULL,
	`inspectorRole` varchar(255),
	`status` enum('em_andamento','concluido') NOT NULL DEFAULT 'em_andamento',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epiChecklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epiItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`epiChecklistId` int NOT NULL,
	`epiName` varchar(255) NOT NULL,
	`ca` varchar(50) NOT NULL,
	`conservationState` enum('novo','parcialmente_utilizado','desgaste','descarte'),
	`collaboratorName` varchar(255) NOT NULL,
	`observations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epiItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `epiChecklists` ADD CONSTRAINT `epiChecklists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `epiItems` ADD CONSTRAINT `epiItems_epiChecklistId_epiChecklists_id_fk` FOREIGN KEY (`epiChecklistId`) REFERENCES `epiChecklists`(`id`) ON DELETE cascade ON UPDATE no action;