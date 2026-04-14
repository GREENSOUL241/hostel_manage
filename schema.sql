CREATE DATABASE IF NOT EXISTS hostel_management;
USE hostel_management;

CREATE TABLE ADMIN (
  admin_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WARDEN (
  Warden_ID INT PRIMARY KEY AUTO_INCREMENT,
  Name VARCHAR(100) NOT NULL,
  Contact VARCHAR(20) NOT NULL,
  Address TEXT NOT NULL
);

CREATE TABLE HOSTEL (
  Hostel_name VARCHAR(100) PRIMARY KEY,
  Hostel_Location VARCHAR(255) NOT NULL,
  Room_no INT NOT NULL,
  Warden_ID INT,
  FOREIGN KEY (Warden_ID) REFERENCES WARDEN(Warden_ID)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE ROOMS (
  Room_No INT PRIMARY KEY,
  Floor_no INT NOT NULL,
  Room_Type ENUM('Single', 'Double', 'Triple') NOT NULL,
  S_ID INT DEFAULT NULL
);

CREATE TABLE STUDENT (
  S_ID INT PRIMARY KEY AUTO_INCREMENT,
  Fname VARCHAR(50) NOT NULL,
  Minit CHAR(1),
  Lname VARCHAR(50) NOT NULL,
  GENDER ENUM('M', 'F', 'Other') NOT NULL,
  ADDRESS TEXT NOT NULL,
  Room_No INT DEFAULT NULL,
  FOREIGN KEY (Room_No) REFERENCES ROOMS(Room_No)
    ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE ROOMS
  ADD CONSTRAINT fk_rooms_student
  FOREIGN KEY (S_ID) REFERENCES STUDENT(S_ID)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE PAYMENT (
  Payment_ID INT PRIMARY KEY AUTO_INCREMENT,
  Paymentdate DATE NOT NULL,
  Mode ENUM('Cash', 'UPI', 'Card', 'Bank Transfer') NOT NULL,
  Student_ID INT NOT NULL,
  FOREIGN KEY (Student_ID) REFERENCES STUDENT(S_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE STUDENT_AUTH (
  student_auth_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  S_ID INT DEFAULT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (S_ID) REFERENCES STUDENT(S_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE BOOKINGS (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  S_ID INT NOT NULL,
  Room_No INT NOT NULL,
  Hostel_name VARCHAR(100) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (S_ID) REFERENCES STUDENT(S_ID)
    ON DELETE CASCADE,
  FOREIGN KEY (Room_No) REFERENCES ROOMS(Room_No)
    ON DELETE CASCADE,
  FOREIGN KEY (Hostel_name) REFERENCES HOSTEL(Hostel_name)
    ON DELETE CASCADE
);

INSERT INTO WARDEN (Name, Contact, Address) VALUES
('Aarav Mehta', '9876543210', '12 Lake View Road'),
('Neha Sharma', '9876501234', '84 Park Street'),
('Rohan Singh', '9811122233', '45 MG Road'),
('Priya Nair', '9898989898', '29 Hill Top Lane'),
('Kabir Khan', '9800001111', '77 Sunrise Avenue');

INSERT INTO HOSTEL (Hostel_name, Hostel_Location, Room_no, Warden_ID) VALUES
('Alpha Hostel', 'North Campus', 120, 1),
('Beta Hostel', 'South Campus', 90, 2),
('Gamma Hostel', 'East Campus', 110, 3);

INSERT INTO ROOMS (Room_No, Floor_no, Room_Type, S_ID) VALUES
(101, 1, 'Single', NULL),
(102, 1, 'Double', NULL),
(103, 1, 'Double', NULL),
(201, 2, 'Single', NULL),
(202, 2, 'Triple', NULL),
(203, 2, 'Double', NULL),
(301, 3, 'Single', NULL),
(302, 3, 'Double', NULL),
(303, 3, 'Triple', NULL),
(304, 3, 'Double', NULL);

INSERT INTO STUDENT (Fname, Minit, Lname, GENDER, ADDRESS, Room_No) VALUES
('Aman', 'K', 'Verma', 'M', 'Delhi', 101),
('Sara', 'M', 'Khan', 'F', 'Mumbai', 102),
('Ishaan', NULL, 'Gupta', 'M', 'Pune', 103),
('Meera', 'S', 'Rao', 'F', 'Bengaluru', 201),
('Arjun', 'P', 'Das', 'M', 'Kolkata', 202),
('Nisha', NULL, 'Patel', 'F', 'Ahmedabad', 203),
('Rahul', 'T', 'Shah', 'M', 'Surat', 301),
('Ananya', 'J', 'Iyer', 'F', 'Chennai', 302);

UPDATE ROOMS SET S_ID = 1 WHERE Room_No = 101;
UPDATE ROOMS SET S_ID = 2 WHERE Room_No = 102;
UPDATE ROOMS SET S_ID = 3 WHERE Room_No = 103;
UPDATE ROOMS SET S_ID = 4 WHERE Room_No = 201;
UPDATE ROOMS SET S_ID = 5 WHERE Room_No = 202;
UPDATE ROOMS SET S_ID = 6 WHERE Room_No = 203;
UPDATE ROOMS SET S_ID = 7 WHERE Room_No = 301;
UPDATE ROOMS SET S_ID = 8 WHERE Room_No = 302;

INSERT INTO PAYMENT (Paymentdate, Mode, Student_ID) VALUES
('2026-04-01', 'UPI', 1),
('2026-04-02', 'Cash', 2),
('2026-04-03', 'Card', 3),
('2026-04-04', 'Bank Transfer', 4),
('2026-04-05', 'UPI', 5),
('2026-04-06', 'Cash', 6);

INSERT INTO ADMIN (username, email, password) VALUES
('admin', 'admin@hostel.com', '$2b$12$8swmA8Qw6a6YY4cF2xBzCO4GsYxJZGfQxAZTJQw8wM14jArlTc95y');
