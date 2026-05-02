const axios = require("axios");

const testRequest = async (req, res) => {
  const { url, method = "GET", headers = {}, body } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    new URL(url);
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
      url,
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

    return res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      responseTime,
      isJson,
      data: responseData,
      headers: responseHeaders,
      size: Buffer.byteLength(response.data || "", "utf8"),
    });
  } catch (err) {
    const responseTime = Date.now() - startTime;

    if (err.code) {
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