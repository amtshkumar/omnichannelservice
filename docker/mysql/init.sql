-- MySQL initialization script
-- This file is executed when the MySQL container is first created

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Grant privileges
GRANT ALL PRIVILEGES ON notification_db.* TO 'notification_user'@'%';
FLUSH PRIVILEGES;

-- Log initialization
SELECT 'MySQL initialization completed' AS message;
