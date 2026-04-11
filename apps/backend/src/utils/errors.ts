type ErrorLike = {
  message?: unknown;
  code?: unknown;
  stack?: unknown;
};

export function getErrorMessage(error: unknown, fallback = "unknown error") {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as ErrorLike;
    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
    if (typeof maybeError.code === "string" && maybeError.code.trim()) {
      return maybeError.code;
    }
  }

  return fallback;
}

export function getErrorStack(error: unknown) {
  if (error instanceof Error && typeof error.stack === "string") {
    return error.stack;
  }
  if (typeof error === "object" && error !== null) {
    const maybeError = error as ErrorLike;
    if (typeof maybeError.stack === "string") {
      return maybeError.stack;
    }
  }
  return null;
}
