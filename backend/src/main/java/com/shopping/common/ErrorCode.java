package com.shopping.common;

public final class ErrorCode {

    public static final int INVALID_REQUEST = 40000;
    public static final int UNAUTHORIZED = 40100;
    public static final int INVALID_CREDENTIALS = 40101;
    public static final int FORBIDDEN = 40300;
    public static final int DUPLICATE_ORDER = 40900;
    public static final int SOLD_OUT = 40901;
    public static final int USER_ALREADY_EXISTS = 40902;
    public static final int RATE_LIMITED = 42900;
    public static final int SYSTEM_BUSY = 50000;

    private ErrorCode() {
    }
}
