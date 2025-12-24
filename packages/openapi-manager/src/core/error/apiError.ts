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
  console.log("📝 extractErrorMessage: 에러 응답에서 에러 메시지를 추출합니다.", { errorResponse });
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
  console.log("📋 extractErrorDetails: 에러 응답에서 상세 정보를 추출합니다.", { errorResponse });
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
    console.log("🚨 ApiError 생성자: Axios 에러를 ApiError로 변환합니다.", { error });
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
    console.log("📋 parseServerError: 서버 에러 데이터를 파싱합니다.", { data });
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
    console.log("📋 getErrorCategory: 에러 카테고리를 반환합니다.", { category: this.serverError?.category });
    return this.serverError?.category || null;
  }

  getErrorType(): string | null {
    console.log("📋 getErrorType: 에러 타입을 반환합니다.", { type: this.serverError?.content?.type });
    return this.serverError?.content?.type || null;
  }

  getErrorDescription(): string | null {
    console.log("📋 getErrorDescription: 에러 설명을 반환합니다.", { description: this.serverError?.content?.description });
    return this.serverError?.content?.description || null;
  }

  getStatusCode(): number | null {
    console.log("📊 getStatusCode: 에러 상태 코드를 반환합니다.", { statusCode: this.serverError?.status_code });
    return this.serverError?.status_code || null;
  }
}
