CREATE TABLE product (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  stock INT
);

CREATE TABLE order_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  product_id BIGINT,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product(id, name, stock) VALUES(1,'秒杀商品',100);
