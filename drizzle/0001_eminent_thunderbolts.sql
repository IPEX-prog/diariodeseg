CREATE TABLE `checklistCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklistCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistItemTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`question` text NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklistItemTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`templateId` int NOT NULL,
	`status` enum('conforme','nao_conforme','nao_aplicavel'),
	`observations` text,
	`correctiveAction` text,
	`responsible` varchar(255),
	`deadline` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistItemId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`photoKey` varchar(500) NOT NULL,
	`caption` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklistPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inspectionType` enum('diaria','semanal','conforme_necessidade') NOT NULL,
	`inspectionDate` timestamp NOT NULL,
	`inspectionTime` varchar(5) NOT NULL,
	`inspectorName` varchar(255) NOT NULL,
	`inspectorRole` varchar(255) NOT NULL,
	`constructionSite` varchar(255) NOT NULL,
	`weatherConditions` varchar(100),
	`workersCount` int,
	`generalObservations` text,
	`status` enum('em_andamento','concluido') NOT NULL DEFAULT 'em_andamento',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
