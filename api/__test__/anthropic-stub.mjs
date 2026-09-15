// Stub for @anthropic-ai/sdk so the handler can be exercised without network or key.
class APIError extends Error {}
class RateLimitError extends APIError {}
class AuthenticationError extends APIError {}
export let lastRequest = null;
export default class Anthropic {
  static APIError = APIError;
  static RateLimitError = RateLimitError;
  static AuthenticationError = AuthenticationError;
  constructor(opts) { this.opts = opts; }
  messages = {
    create: async (req) => {
      globalThis.__lastAnthropicRequest = req;
      if (globalThis.__anthropicThrows) throw globalThis.__anthropicThrows;
      return { stop_reason: "end_turn", content: [{ type: "text", text: "stub answer" }] };
    },
  };
}
Anthropic.RateLimitError = RateLimitError;
Anthropic.AuthenticationError = AuthenticationError;
Anthropic.APIError = APIError;
