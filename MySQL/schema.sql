DROP DATABASE IF EXISTS myauction_db;
CREATE DATABASE myauction_db;

USE myauction_db;

CREATE TABLE users (
    userid INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    admin_access BOOLEAN DEFAULT false,
    PRIMARY KEY (userid)
);

CREATE TABLE admin_users (
    adminid INT NOT NULL AUTO_INCREMENT,
    admin_password VARCHAR(15),
    userid INT,
        FOREIGN KEY (userid) REFERENCES users (userid)
        ON DELETE CASCADE,
    PRIMARY KEY (adminid)
);

CREATE TABLE auction_items (
	id INT NOT NULL AUTO_INCREMENT,
    item VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NULL,
    bid DECIMAL(10,2) NULL,
    topBidder VARCHAR(20) DEFAULT NULL,
    closed BOOLEAN DEFAULT FALSE,
    userid INT,
        FOREIGN KEY (userid) REFERENCES users (userid)
        ON DELETE CASCADE,
	PRIMARY KEY (id)
);