DROP DATABASE IF EXISTS myauction_db;
CREATE DATABASE myauction_db;

USE myauction_db;

CREATE TABLE auction_items (
	id INT(10) NOT NULL AUTO_INCREMENT,
    item VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NULL,
    bid DECIMAL(10,2) NULL,
    PRIMARY KEY (id)
);

SELECT * FROM auction_items;