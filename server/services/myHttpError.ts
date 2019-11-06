export class MyHttpError extends Error {
  name = 'MyHttpError';

  constructor(message?: string, public status?: number, public expose?: boolean) {
    super(message);

    //https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, MyHttpError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MyHttpError);
    }
  }
}
