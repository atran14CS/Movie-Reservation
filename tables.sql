CREATE TABLE IF NOT EXISTS "NewMovies" (
	"id"	INTEGER NOT NULL,
	"name"	varchar(255),
	"reserved"	INTEGER,
	"date"	Datetime,
	"img"	varchar(255)
);
CREATE TABLE IF NOT EXISTS "Reserved" (
	"id"	TEXT,
	"MovieName"	TEXT,
	"DateReserved"	DATETIME DEFAULT (datetime('now', 'localtime')),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Information1" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT,
	"rating"	INTEGER,
	"budget"	TEXT,
	"boxoffice"	TEXT,
	"resid"	TEXT
);
CREATE TABLE IF NOT EXISTS "Information" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT,
	"rating"	INTEGER,
	"budget"	TEXT,
	"boxoffice"	TEXT,
	"resid"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("resid") REFERENCES "Reserved"("id")
);
CREATE TABLE IF NOT EXISTS "users" (
	"userid"	INTEGER,
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"likes"	TEXT,
	"reserved"	TEXT,
	"likeimg"	TEXT,
	"resimg"	TEXT,
	PRIMARY KEY("userid" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "reviews" (
	"stars"	INTEGER,
	"review"	TEXT,
	PRIMARY KEY("stars","review")
);
