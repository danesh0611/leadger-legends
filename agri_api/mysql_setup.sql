-- Run these SQL commands in MySQL Workbench or the MySQL command line

-- Create a new database for your project
CREATE DATABASE agri_db;

-- Create a user (optional, you can use root, but for security it's better to create a new user)
CREATE USER 'agri_user'@'localhost' IDENTIFIED BY 'agri_pass';

-- Grant all privileges on the new database to the new user
GRANT ALL PRIVILEGES ON agri_db.* TO 'agri_user'@'localhost';
FLUSH PRIVILEGES;

-- Create the Users table
USE agri_db;
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
