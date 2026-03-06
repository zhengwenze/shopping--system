package com.shopping.model;

public class AuthResponse {

    private final String token;
    private final String tokenType;
    private final long expiresInSeconds;
    private final UserProfileResponse user;

    public AuthResponse(String token, String tokenType, long expiresInSeconds, UserProfileResponse user) {
        this.token = token;
        this.tokenType = tokenType;
        this.expiresInSeconds = expiresInSeconds;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public UserProfileResponse getUser() {
        return user;
    }
}
