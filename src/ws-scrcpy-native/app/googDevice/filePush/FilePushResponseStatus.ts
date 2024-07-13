export enum FilePushResponseStatus {
    NEW_PUSH_ID = 1,
    NO_ERROR = 0,
    ERROR_INVALID_NAME = -1,
    ERROR_NO_SPACE = -2,
    ERROR_FAILED_TO_DELETE = -3,
    ERROR_FAILED_TO_CREATE = -4,
    ERROR_FILE_NOT_FOUND = -5,
    ERROR_FAILED_TO_WRITE = -6,
    ERROR_FILE_IS_BUSY = -7,
    ERROR_INVALID_STATE = -8,
    ERROR_UNKNOWN_ID = -9,
    ERROR_NO_FREE_ID = -10,
    ERROR_INCORRECT_SIZE = -11,
    ERROR_OTHER = -12,
}
