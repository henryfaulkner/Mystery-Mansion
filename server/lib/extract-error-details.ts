export function extractErrorDetails(error: unknown): any {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    return { message: String(error) };  // For non-Error exceptions
}