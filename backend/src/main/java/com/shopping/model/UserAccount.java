package com.shopping.model;

import java.time.LocalDateTime;

public class UserAccount {

    private final Long id;
    private final String username;
    private final String passwordHash;
    private final LocalDateTime createTime;

    public UserAccount(Long id, String username, String passwordHash, LocalDateTime createTime) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.createTime = createTime;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }
}
