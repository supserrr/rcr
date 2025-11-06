/**
 * CORS handler for Edge Functions
 * 
 * Handles CORS headers for cross-origin requests
 */

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

/**
 * Default CORS options
 */
const defaultOptions: CorsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

/**
 * Get allowed origin from request
 */
function getAllowedOrigin(request: Request, options: CorsOptions): string | null {
  const origin = request.headers.get('Origin');

  if (!origin) {
    return null;
  }

  if (options.origin === true) {
    return origin;
  }

  if (typeof options.origin === 'string') {
    return options.origin;
  }

  if (Array.isArray(options.origin)) {
    return options.origin.includes(origin) ? origin : null;
  }

  return null;
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(request: Request, options: CorsOptions = defaultOptions): Response | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const allowedOrigin = getAllowedOrigin(request, options);

  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }

  const headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': (options.methods || defaultOptions.methods || []).join(', '),
    'Access-Control-Allow-Headers': (options.allowedHeaders || defaultOptions.allowedHeaders || []).join(', '),
    'Access-Control-Max-Age': '86400',
  });

  if (options.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return new Response(null, { status: 204, headers });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: Response, request: Request, options: CorsOptions = defaultOptions): Response {
  const allowedOrigin = getAllowedOrigin(request, options);

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', (options.methods || defaultOptions.methods || []).join(', '));
    response.headers.set('Access-Control-Allow-Headers', (options.allowedHeaders || defaultOptions.allowedHeaders || []).join(', '));

    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return response;
}

/**
 * Create CORS-enabled response
 */
export function corsResponse(
  body: BodyInit | null,
  init: ResponseInit = {},
  request: Request,
  options: CorsOptions = defaultOptions
): Response {
  const response = new Response(body, init);
  return addCorsHeaders(response, request, options);
}

