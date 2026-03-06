package com.shopping.service;

import com.shopping.common.ErrorCode;
import com.shopping.exception.BusinessException;
import com.shopping.model.AuthRequest;
import com.shopping.model.AuthResponse;
import com.shopping.model.UserAccount;
import com.shopping.model.UserProfileResponse;
import com.shopping.security.AuthenticatedUser;
import com.shopping.security.JwtService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private static final RowMapper<UserAccount> USER_ROW_MAPPER = (rs, rowNum) -> new UserAccount(
            rs.getLong("id"),
            rs.getString("username"),
            rs.getString("password_hash"),
            rs.getTimestamp("create_time").toLocalDateTime()
    );

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRequest request) {
        String username = normalizeUsername(request.getUsername());
        validatePassword(request.getPassword());
        long userId = generateUserId();

        try {
            jdbcTemplate.update(
                    "INSERT INTO user_account(id, username, password_hash) VALUES(?, ?, ?)",
                    userId,
                    username,
                    passwordEncoder.encode(request.getPassword())
            );
        } catch (DuplicateKeyException ex) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS, "用户名已存在，请更换后重试", HttpStatus.CONFLICT);
        }

        AuthenticatedUser user = new AuthenticatedUser(userId, username);
        return buildAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        String username = normalizeUsername(request.getUsername());
        validatePassword(request.getPassword());

        UserAccount user = findByUsername(username);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "用户名或密码错误", HttpStatus.UNAUTHORIZED);
        }

        return buildAuthResponse(new AuthenticatedUser(user.getId(), user.getUsername()));
    }

    public UserProfileResponse getCurrentUser(Long userId) {
        UserAccount user = findById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户不存在或登录状态已失效", HttpStatus.UNAUTHORIZED);
        }

        return new UserProfileResponse(user.getId(), user.getUsername());
    }

    private AuthResponse buildAuthResponse(AuthenticatedUser user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                new UserProfileResponse(user.getId(), user.getUsername())
        );
    }

    private UserAccount findByUsername(String username) {
        List<UserAccount> users = jdbcTemplate.query(
                "SELECT id, username, password_hash, create_time FROM user_account WHERE username = ?",
                USER_ROW_MAPPER,
                username
        );
        return users.isEmpty() ? null : users.get(0);
    }

    private UserAccount findById(Long userId) {
        List<UserAccount> users = jdbcTemplate.query(
                "SELECT id, username, password_hash, create_time FROM user_account WHERE id = ?",
                USER_ROW_MAPPER,
                userId
        );
        return users.isEmpty() ? null : users.get(0);
    }

    private String normalizeUsername(String username) {
        if (!StringUtils.hasText(username)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "用户名不能为空", HttpStatus.BAD_REQUEST);
        }

        String normalized = username.trim();
        if (normalized.length() < 3 || normalized.length() > 32) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "用户名长度需在 3 到 32 位之间", HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }

    private void validatePassword(String password) {
        if (!StringUtils.hasText(password) || password.length() < 6 || password.length() > 64) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "密码长度需在 6 到 64 位之间", HttpStatus.BAD_REQUEST);
        }
    }

    private long generateUserId() {
        return System.currentTimeMillis() * 1000 + ThreadLocalRandom.current().nextInt(1000);
    }
}
