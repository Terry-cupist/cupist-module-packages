import { AxiosError } from "axios";

export const DEFAULT_ERROR_MESSAGE = "UNKNOWN_ERROR";

export interface ErrorResponse {
  status_code: number;
  category: string;
  content: {
    type: string;
    description: string;
  };
}

export const extractErrorMessage = (errorResponse: unknown) => {
  try {
    const { content, status_code: statusCode } = errorResponse as ErrorResponse;
    const { type = "UNKNOWN_TYPE" } = content || {};
    const isValid = type && statusCode;
    if (!isValid) {
      throw new Error(DEFAULT_ERROR_MESSAGE);
    }

    return `[${statusCode}] ${type}`;
  } catch (e) {
    return DEFAULT_ERROR_MESSAGE;
  }
};

export const extractErrorDetails = (
  errorResponse: unknown,
): {
  statusCode: number;
  category: string;
  type: string;
  description: string;
} | null => {
  try {
    const response = errorResponse as ErrorResponse;
    if (!response?.content) return null;

    return {
      statusCode: response.status_code,
      category: response.category,
      type: response.content.type,
      description: response.content.description,
    };
  } catch {
    return null;
  }
};

export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const ERROR_NAME: { [status in HttpStatus]: string } = {
  [HttpStatus.BAD_REQUEST]: "ApiBadRequestError",
  [HttpStatus.UNAUTHORIZED]: "ApiUnauthorizedError",
  [HttpStatus.FORBIDDEN]: "ApiForbiddenError",
  [HttpStatus.NOT_FOUND]: "ApiNotFoundError",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "ApiInternalServerError",
};

export default class ApiError extends AxiosError {
  cause: AxiosError;
  serverError: ErrorResponse | null;
  errorDetails: ReturnType<typeof extractErrorDetails>;

  constructor(error: AxiosError) {
    const { message, code, config, request, response } = error;
    super(message, code, config, request, response);

    this.serverError = this.parseServerError(error.response?.data);
    this.errorDetails = extractErrorDetails(error.response?.data);

    const errorMessage = extractErrorMessage(error.response?.data);
    const errorStatus = (error.response?.status || 0) as HttpStatus;
    const isDefaultMessage = DEFAULT_ERROR_MESSAGE === errorMessage;

    this.message = isDefaultMessage ? message : errorMessage;
    this.cause = error;
    this.name = ERROR_NAME[errorStatus] || "ApiError";
  }

  private parseServerError(data: unknown): ErrorResponse | null {
    try {
      const parsed = data as ErrorResponse;
      if (parsed?.status_code || parsed?.category || parsed?.content) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  getErrorCategory(): string | null {
    return this.serverError?.category || null;
  }

  getErrorType(): string | null {
    return this.serverError?.content?.type || null;
  }

  getErrorDescription(): string | null {
    return this.serverError?.content?.description || null;
  }

  getStatusCode(): number | null {
    return this.serverError?.status_code || null;
  }
}
