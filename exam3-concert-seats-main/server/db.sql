BEGIN TRANSACTION;

DROP TABLE IF EXISTS reservation_seats;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS concerts;
DROP TABLE IF EXISTS theaters;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS "users" (
    "uid" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT,
    "username" TEXT,
    "salt" TEXT,
    "password" TEXT,
    "loyal"	INTEGER CHECK("loyal" = 0 OR "loyal" = 1)
);

CREATE TABLE IF NOT EXISTS "theaters" (
    "theater_id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "dimension" TEXT,
    "rows" INTEGER,
    "columns" INTEGER
);

CREATE TABLE IF NOT EXISTS "concerts" (
    "concert_id" INTEGER PRIMARY KEY AUTOINCREMENT, 
    "name" TEXT,
    "location" TEXT,
    "onset" TEXT,
    "theater_id" INTEGER,
    "image" TEXT,
    FOREIGN KEY (theater_id) REFERENCES theaters (theater_id)
);

CREATE TABLE IF NOT EXISTS "reservations" (
    "reservation_id" INTEGER PRIMARY KEY AUTOINCREMENT, 
    "uid" INTEGER,
    "concert_id" INTEGER,
    FOREIGN KEY (uid) REFERENCES users (uid),
    FOREIGN KEY (concert_id) REFERENCES concerts (concert_id)
);

CREATE TABLE IF NOT EXISTS "reservation_seats" (
    "rsid" INTEGER PRIMARY KEY AUTOINCREMENT, 
    "reservation_id" INTEGER,
    "seat" TEXT,
    FOREIGN KEY (reservation_id) REFERENCES reservations (reservation_id)
);

/* USERS */
INSERT INTO "users" VALUES (1, 'enrico@test.com', 'enrico', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb', 1); /* password='pwd' */
INSERT INTO "users" VALUES (2, 'luigi@test.com', 'luigi', '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c', 1);
INSERT INTO "users" VALUES (3, 'alice@test.com', 'alice', 'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160', 1);
INSERT INTO "users" VALUES (4, 'harry@test.com', 'harry', 'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8', 0);

/* THEATERS */
INSERT INTO "theaters" VALUES (1, 'small', 4, 8);
INSERT INTO "theaters" VALUES (2, 'medium', 6, 10);
INSERT INTO "theaters" VALUES (3, 'large', 9, 14);

/* CONCERTS */
INSERT INTO "concerts" VALUES (1, 'Pink Floyd Legend - The Dark Side of the Moon', 'Sanremo', '2024-11-24 21:00:00', 1, 'https://www.ciaotickets.com/sites/default/files/styles/img_main_quadrato/public/immagini_evento_quadrata/pink%20floyd%20legend%201080%20%281%29.jpg?itok=0-J-3mTk');
INSERT INTO "concerts" VALUES (2, 'Alla Scoperta di Morricone', 'Grosseto', '2025-03-28 21:15:00', 2, 'https://www.teatro.it/images/spettacoli/40137/main-image/teatro.it-alla-scoperta-di-morricone-date-tour-concerto-biglietti.jpeg');
INSERT INTO "concerts" VALUES (3, 'Giovanni Allevi - Piano Solo Tour', 'Assisi', '2024-11-15 21:00:00', 3, 'https://www.mondomilano.it/wp-content/uploads/2024/02/Ciovanni-Allevi-concerti-2024-Date-info-tour-biglietti-Piano-Solo-Tour-2024.webp');
INSERT INTO "concerts" VALUES (4, 'David Gilmoure - Luck and Strange', 'Roma', '2024-09-27 21:00:00', 2, 'https://i.scdn.co/image/ab67616d0000b2731729a13f93d13fa569ea5233');
INSERT INTO "concerts" VALUES (5, 'Gazzelle - Stadi 2025', 'Milano', '2025-06-22 21:00:00', 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHuGGsD3RVSB_A3AFCZPxNjIrdKtl-Xy568g&s');
INSERT INTO "concerts" VALUES (6, 'Brunori Sas - Tour 2025', 'Firenze', '2025-03-14 21:00:00', 3, 'https://www.unipolarena.it/wp-content/uploads/2024/09/BrunoriSas_25_FB_event1.jpg');


/* RESERVATIONS */
INSERT INTO "reservations" VALUES (1, 1, 1);
INSERT INTO "reservations" VALUES (2, 1, 2);
INSERT INTO "reservations" VALUES (3, 2, 3);
INSERT INTO "reservations" VALUES (4, 2, 5);



/* RESERVATION SEATS */
INSERT INTO "reservation_seats" VALUES (1, 1, '1A');
INSERT INTO "reservation_seats" VALUES (2, 1, '1B');
INSERT INTO "reservation_seats" VALUES (3, 2, '1A');
INSERT INTO "reservation_seats" VALUES (4, 2, '1B');
INSERT INTO "reservation_seats" VALUES (5, 3, '1B');
INSERT INTO "reservation_seats" VALUES (6, 3, '1C');
INSERT INTO "reservation_seats" VALUES (7, 4, '1A');
INSERT INTO "reservation_seats" VALUES (8, 4, '1B');

COMMIT;
