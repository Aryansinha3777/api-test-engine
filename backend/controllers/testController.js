const axios = require("axios");
const RequestHistory = require("../models/RequestHistory");

// Resolves {{variableName}} patterns using the provided variables map
// e.g. "{{baseUrl}}/users" + { baseUrl: "http://localhost:3000" } => "http://localhost:3000/users"
function resolveVariables(str, variables = {}) {
  if (!str || typeof str !== "string") return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables.hasOwnProperty(key) ? variables[key] : match;
  });
}

const testRequest = async (req, res) => {
  const { url, method = "GET", headers = {}, body, environment } = req.body;

  // Build variables map from active environment { key: value, ... }
  const envVars = {};
  if (environment && Array.isArray(environment.variables)) {
    environment.variables.forEach(({ key, value }) => {
      if (key && key.trim()) envVars[key.trim()] = value || "";
    });
  }

  // Resolve {{variable}} in URL before validation
  const resolvedUrl = resolveVariables(url, envVars);

  if (!resolvedUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    new URL(resolvedUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
  const upperMethod = method.toUpperCase();
  if (!allowedMethods.includes(upperMethod)) {
    return res.status(400).json({ error: `Invalid method. Allowed: ${allowedMethods.join(", ")}` });
  }

  const startTime = Date.now();

  try {
    
    const cleanHeaders = {};
    Object.entries(headers).forEach(([k, v]) => {
      const cleanKey = k.trim();
      const cleanVal = typeof v === "string" ? v.trim() : v;
      if (cleanKey) cleanHeaders[cleanKey] = cleanVal;
    });

    const axiosConfig = {
      method: upperMethod,
      url: resolvedUrl,
      headers: cleanHeaders,
      validateStatus: () => true,
      responseType: "text",
      timeout: 30000,
    };

    if (["POST", "PUT", "PATCH"].includes(upperMethod) && body !== undefined) {
      axiosConfig.data = body;
      
      const hasContentType = Object.keys(cleanHeaders).some(
        (k) => k.toLowerCase() === "content-type"
      );
      if (!hasContentType) {
        axiosConfig.headers["Content-Type"] = "application/json";
      }
    }

    const response = await axios(axiosConfig);
    const responseTime = Date.now() - startTime;

    let responseData;
    let isJson = false;
    const contentType = response.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      try {
        responseData = JSON.parse(response.data);
        isJson = true;
      } catch {
        responseData = response.data;
      }
    } else {
      responseData = response.data;
    }

    const responseHeaders = {};
    Object.entries(response.headers).forEach(([key, val]) => {
      responseHeaders[key] = val;
    });

    const size = Buffer.byteLength(response.data || "", "utf8");

    // Auto-save to history. Awaited (not fire-and-forget) because on Vercel's
    // serverless functions, the process can freeze right after res.json() is
    // called — a background promise would never get a chance to finish.
    try {
      await RequestHistory.create({
        url: resolvedUrl,
        method: upperMethod,
        headers: cleanHeaders,
        body: axiosConfig.data || null,
        statusCode: response.status,
        responseTime,
        responseSize: size,
        success: true,
      });
    } catch {
      // History is a nice-to-have — never fail the main request because of it
    }

    return res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      isJson,
      data: responseData,
      headers: responseHeaders,
      size,
    });
  } catch (err) {
    const responseTime = Date.now() - startTime;

    if (err.code) {
      // Save failed/network error to history too (awaited - see note above)
      try {
        await RequestHistory.create({
          url,
          method: upperMethod,
          headers: {},
          body: null,
          statusCode: null,
          responseTime,
          responseSize: null,
          success: false,
          errorMessage: err.message,
        });
      } catch {
        // never fail the response because of a history write error
      }

      return res.status(200).json({
        success: false,
        error: true,
        errorCode: err.code,
        message: err.message,
        responseTime,
      });
    }

    console.error("Test route error:", err.message);
    return res.status(500).json({ error: "Failed to send request", details: err.message });
  }
};

module.exports = { testRequest };