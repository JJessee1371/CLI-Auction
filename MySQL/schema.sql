DROP DATABASE IF EXISTS myauction_db;
CREATE DATABASE myauction_db;

USE myauction_db;

CREATE TABLE auction_items (
	id INT(10) NOT NULL AUTO_INCREMENT,
    item VARCHAR(100) NOT NULL,
    value INT(10,2) NOT NULL,
    category VARCHAR(100) NULL
);

SELECT * FROM auction_items;