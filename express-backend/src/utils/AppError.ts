/**
 * A known, expected error (bad input, missing resource, auth failure) as
 * opposed to a bug. Routes/controllers throw this and a single error
 * handler middleware turns it into the right HTTP status + JSON body.
 * Anything that ISN'T an AppError is treated as a 500 — a bug we didn't
 * anticipate, not something to describe to the client in detail.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
