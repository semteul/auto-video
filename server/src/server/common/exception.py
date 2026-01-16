class ServiceError(Exception):
    status_code = 400
    code = "domain_error"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.code)

class NotFoundError(ServiceError):
    status_code = 404
    code = "not_found"


class PermissionDeniedError(ServiceError):
    status_code = 403
    code = "permission_denied"


class ConflictError(ServiceError):
    status_code = 409
    code = "conflict"


class InvalidInputError(ServiceError):
    status_code = 400
    code = "invalid_input" 