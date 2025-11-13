import type { NextApiRequest, NextApiResponse } from 'next/types';

const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://be.tijarah360.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Temporarily enable proxy in production for CORS fix
  // if (process.env.NODE_ENV === 'production') {
  //   return res.status(404).json({
  //     error: 'Proxy not available in production',
  //     message: 'Use direct API calls in production environment'
  //   });
  // }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  // Construct the full URL with query parameters
  let url = `${PRODUCTION_API_URL}/${apiPath}`;

  // Add query parameters if they exist
  const queryString = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && value) {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else {
        queryString.append(key, value);
      }
    }
  });

  if (queryString.toString()) {
    url += `?${queryString.toString()}`;
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'User-Agent': 'Tijarah-Web-Proxy/1.0',
  };

  // Forward authorization header
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  // Forward content-type for POST/PUT/PATCH requests
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }

  // Forward the request to production API
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    console.log(`[PROXY] ${req.method} ${url}`);

    const response = await fetch(url, fetchOptions);
    const data = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Return the response
    res.status(response.status);

    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      url: url
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
