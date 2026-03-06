CREATE TABLE IF NOT EXISTS product (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  stock INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_account (
  id BIGINT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_username (username)
);

CREATE TABLE IF NOT EXISTS order_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_product_id (product_id),
  UNIQUE KEY uk_user_product (user_id, product_id)
);

INSERT INTO product(id, name, stock)
VALUES (1, '秒杀商品', 100)
ON DUPLICATE KEY UPDATE name = VALUES(name), stock = VALUES(stock);
