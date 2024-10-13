interface ErrorOptions {
  cause?: unknown;
}

interface AggregateError extends Error {
  errors: any[];
}
