package com.shopping.model;

public class UserProfileResponse {

    private final Long id;
    private final String username;

    public UserProfileResponse(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}
