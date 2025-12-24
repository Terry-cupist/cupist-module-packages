/**
 * Web API 타입 선언 (React Native 환경)
 *
 * @hey-api/openapi-ts가 생성한 코드는 Web API를 사용하지만,
 * React Native 환경에는 해당 타입이 없어 TypeScript 컴파일 에러 발생.
 * 이 파일은 타입 체크만 통과시키며, 런타임 polyfill은 별도로 필요함.
 */

declare global {
  /**
   * Fetch API Body 타입
   */
  type BodyInit = BodyInit_;
  type HeadersInit = HeadersInit_;
  type RequestCredentials = RequestCredentials_;
  type RequestMode = RequestMode_;

  /**
   * Fetch API Request 초기화 옵션
   */
  interface RequestInit {
    body?: BodyInit | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal | null;
    window?: null;
  }

  type RequestCache =
    | "default"
    | "force-cache"
    | "no-cache"
    | "no-store"
    | "only-if-cached"
    | "reload";

  type RequestRedirect = "error" | "follow" | "manual";

  type ReferrerPolicy =
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";

  /**
   * Fetch API Request 클래스
   */
  interface Request {
    readonly cache: RequestCache;
    readonly credentials: RequestCredentials;
    readonly destination: RequestDestination;
    readonly headers: Headers;
    readonly integrity: string;
    readonly keepalive: boolean;
    readonly method: string;
    readonly mode: RequestMode;
    readonly redirect: RequestRedirect;
    readonly referrer: string;
    readonly referrerPolicy: ReferrerPolicy;
    readonly signal: AbortSignal;
    readonly url: string;
    clone(): Request;
  }

  type RequestDestination =
    | ""
    | "audio"
    | "audioworklet"
    | "document"
    | "embed"
    | "font"
    | "frame"
    | "iframe"
    | "image"
    | "manifest"
    | "object"
    | "paintworklet"
    | "report"
    | "script"
    | "sharedworker"
    | "style"
    | "track"
    | "video"
    | "worker"
    | "xslt";

  const Request: {
    prototype: Request;
    new (input: RequestInfo, init?: RequestInit): Request;
  };

  type RequestInfo = Request | string;

  /**
   * Fetch API Response 인터페이스 확장
   * React Native의 Response에는 body 스트림이 없음 주의!
   */
  interface Response {
    readonly body: ReadableStream<Uint8Array> | null;
    readonly bodyUsed: boolean;
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    clone(): Response;
    formData(): Promise<FormData>;
    json(): Promise<any>;
    text(): Promise<string>;
  }

  type ResponseType =
    | "basic"
    | "cors"
    | "default"
    | "error"
    | "opaque"
    | "opaqueredirect";

  /**
   * Web Streams API - TextDecoderStream
   * React Native 미지원: polyfill 또는 대체 구현 필요
   */
  interface TextDecoderStream {
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
    readonly readable: ReadableStream<string>;
    readonly writable: WritableStream<BufferSource>;
  }

  const TextDecoderStream: {
    prototype: TextDecoderStream;
    new (label?: string, options?: TextDecoderOptions): TextDecoderStream;
  };

  interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
  }

  /**
   * Web Streams API - ReadableStream
   */
  interface ReadableStream<R = any> {
    readonly locked: boolean;
    cancel(reason?: any): Promise<void>;
    getReader(): ReadableStreamDefaultReader<R>;
    pipeThrough<T>(
      transform: ReadableWritablePair<T, R>,
      options?: StreamPipeOptions,
    ): ReadableStream<T>;
    pipeTo(
      destination: WritableStream<R>,
      options?: StreamPipeOptions,
    ): Promise<void>;
    tee(): [ReadableStream<R>, ReadableStream<R>];
  }

  interface ReadableStreamDefaultReader<R = any> {
    readonly closed: Promise<undefined>;
    cancel(reason?: any): Promise<void>;
    read(): Promise<ReadableStreamReadResult<R>>;
    releaseLock(): void;
  }

  interface ReadableStreamReadResult<T> {
    done: boolean;
    value: T;
  }

  interface ReadableWritablePair<R = any, W = any> {
    readable: ReadableStream<R>;
    writable: WritableStream<W>;
  }

  interface StreamPipeOptions {
    preventAbort?: boolean;
    preventCancel?: boolean;
    preventClose?: boolean;
    signal?: AbortSignal;
  }

  interface WritableStream<W = any> {
    readonly locked: boolean;
    abort(reason?: any): Promise<void>;
    close(): Promise<void>;
    getWriter(): WritableStreamDefaultWriter<W>;
  }

  interface WritableStreamDefaultWriter<W = any> {
    readonly closed: Promise<undefined>;
    readonly desiredSize: number | null;
    readonly ready: Promise<undefined>;
    abort(reason?: any): Promise<void>;
    close(): Promise<void>;
    releaseLock(): void;
    write(chunk: W): Promise<void>;
  }

  type BufferSource = ArrayBufferView | ArrayBuffer;
}

export {};
