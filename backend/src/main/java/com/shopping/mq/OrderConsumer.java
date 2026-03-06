package com.shopping.mq;

import com.shopping.model.OrderMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderConsumer {

    @Autowired
    private JdbcTemplate jdbc;

    @Transactional
    @RabbitListener(queues = MQConfig.SECKILL_ORDER_QUEUE)
    public void handleOrder(OrderMessage msg) {
        int updated = jdbc.update("UPDATE product SET stock = stock - 1 WHERE id = ? AND stock > 0", msg.getProductId());
        if (updated > 0) {
            jdbc.update("INSERT INTO order_info(user_id, product_id) VALUES(?, ?)", msg.getUserId(), msg.getProductId());
        }
    }
}
