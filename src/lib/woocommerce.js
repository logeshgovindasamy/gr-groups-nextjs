import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import https from "https";
import http from "http";
import dns from "dns";

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Must use 'localhost' (not '127.0.0.1') to match WordPress site_url for OAuth signature
const url = process.env.NEXT_PUBLIC_WP_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/Testwp";

// Force localhost to resolve to IPv4 127.0.0.1 (Windows can resolve to IPv6 ::1)
const ipv4Lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  if (hostname === "localhost") {
    if (options && options.all) {
      return callback(null, [{ address: "127.0.0.1", family: 4 }]);
    }
    return callback(null, "127.0.0.1", 4);
  }
  return dns.lookup(hostname, options, callback);
};

const wooCommerceApi = new WooCommerceRestApi({
  url,
  consumerKey: process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3",
  axiosConfig: {
    timeout: 30000, // 30 seconds — local WordPress/PHP is too salow
    headers: {
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    },
    httpAgent: new http.Agent({ lookup: ipv4Lookup, keepAlive: true, maxSockets: 2 }),
    httpsAgent: new https.Agent({ rejectUnauthorized: false, lookup: ipv4Lookup, keepAlive: true, maxSockets: 2 })
  }
});

/**
 * Concurrency limiter — prevents flooding the local PHP/Apache server.
 * Local XAMPP/WAMP typically only handles 1-5 PHP workers at a time;
 * firing many simultaneous WooCommerce REST calls causes all of them to queue
 * on the server side and eventually time out. This limiter keeps concurrent
 * requests at or below MAX_CONCURRENT.
 */
const MAX_CONCURRENT = 2;
let activeRequests = 0;
const requestQueue = [];

function runQueued(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject });
    processQueue();
  });
}

function processQueue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    const { fn, resolve, reject } = requestQueue.shift();
    activeRequests++;
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeRequests--;
        processQueue();
      });
  }
}

/**
 * Executes a WooCommerce API request with automatic retry logic and exponential backoff.
 * Requests are serialized through the concurrency queue above.
 */
async function requestWithRetry(method, endpoint, data = null, params = {}, retries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[WooCommerce REST Client] ${method.toUpperCase()} ${endpoint} - Attempt ${i + 1}`);
      const result = await runQueued(async () => {
        let response;
        if (method === "get") {
          response = await wooCommerceApi.get(endpoint, params);
        } else if (method === "post") {
          response = await wooCommerceApi.post(endpoint, data, params);
        } else if (method === "put") {
          response = await wooCommerceApi.put(endpoint, data, params);
        } else if (method === "delete") {
          response = await wooCommerceApi.delete(endpoint, params);
        }
        return response.data;
      });
      return result;
    } catch (error) {
      lastError = error;
      const statusCode = error.response?.status;
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`[WooCommerce REST Client Error] Attempt ${i + 1} failed: HTTP ${statusCode || "Network"} - ${errorMsg}`);

      // Do not retry client-side errors (400-499) except 429 Too Many Requests
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        throw error;
      }

      if (i < retries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        console.warn(`[WooCommerce REST Client] Retrying in ${backoffDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }
  throw lastError;
}

export const woocommerce = {
  get: (endpoint, params = {}) => requestWithRetry("get", endpoint, null, params),
  post: (endpoint, data, params = {}) => requestWithRetry("post", endpoint, data, params),
  put: (endpoint, data, params = {}) => requestWithRetry("put", endpoint, data, params),
  delete: (endpoint, params = {}) => requestWithRetry("delete", endpoint, null, params),
  raw: wooCommerceApi
};
