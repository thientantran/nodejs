'use strict'

const StatusCode = {
    BAD_REQUEST: 400,

    CONFLICT: 409
}

const ResonStatusCode = {
    BAD_REQUEST: "BAD_REQUEST",
    CONFLICT: "CONFLICT"
}

const {StatusCodes, ReasonPhrases} = require('../utils/httpStatusCode')

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

class AuthFailureError extends ErrorResponse{
    constructor(message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED){
        super(message,statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError
}