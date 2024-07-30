'use strict'

const StatusCode = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    CONFLICT: 409
}

const ResonStatusCode = {
    OK: "OK",
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    CONFLICT: "CONFLICT"
}

class ErrorResponse extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse{
    constructor(message = ResonStatusCode.CONFLICT, statusCode = StatusCode.CONFLICT){
        super(message,statusCode)
    }
}

class BadRequestError extends ErrorResponse{
    constructor(message = ResonStatusCode.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST){
        super(message,statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError
}