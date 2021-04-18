export class ErrorCode {
    static ALREADY_AUTHENTICATED = new ErrorCode("ALREADY_AUTHENTICATED", 400, false);
    static MISSING_PARAMETERS = new ErrorCode("MISSING_PARAMETERS", 400, false);
    static INVALID_PARAMETERS = new ErrorCode("INVALID_PARAMETERS", 400, false);
    static INVALID_REQUEST = new ErrorCode("INVALID_REQUEST", 400, false);
    static TOO_MANY_GUILDS = new ErrorCode("TOO_MANY_GUILDS", 400, false);
    static BANNED = new ErrorCode("BANNED", 403, false);
    static FORBIDDEN = new ErrorCode("FORBIDDEN", 403, false);
    static NOT_AUTHENTICATED = new ErrorCode("NOT_AUTHENTICATED", 403, false);
    static NOT_FOUND = new ErrorCode("NOT_FOUND", 404, false);
    static TOO_MANY_REQUESTS = new ErrorCode("TOO_MANY_REQUESTS", 429, false);

    static TEMPORARILY_UNAVAILABLE = new ErrorCode("TEMPORARILY_UNAVAILABLE", 503, false);

    constructor(name, httpCode, logout) {
        return {
            name, httpCode, logout, custom: true
        }
    }
}
