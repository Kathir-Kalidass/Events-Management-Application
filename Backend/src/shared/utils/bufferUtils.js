/**
 * Utility functions for handling buffer conversions
 */

/**
 * Safely convert various buffer-like objects to Node.js Buffer
 * @param {Buffer|Uint8Array|ArrayBuffer|string} data - Data to convert
 * @returns {Buffer} - Node.js Buffer object
 */
export const ensureBuffer = (data) => {
  if (!data) {
    return null;
  }

  // If it's already a Buffer, return as-is
  if (Buffer.isBuffer(data)) {
    return data;
  }

  // If it's a Uint8Array (common from Puppeteer), convert to Buffer
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  // If it's an ArrayBuffer, convert to Buffer
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  // If it's a string, assume it's base64 encoded
  if (typeof data === 'string') {
    return Buffer.from(data, 'base64');
  }

  // For any other type, try to convert using Buffer.from
  try {
    return Buffer.from(data);
  } catch (error) {
    console.error('Failed to convert data to Buffer:', error);
    throw new Error(`Cannot convert data of type ${typeof data} to Buffer`);
  }
};

/**
 * Validate that a buffer is valid and has content
 * @param {Buffer} buffer - Buffer to validate
 * @param {number} minSize - Minimum size in bytes (default: 1)
 * @returns {boolean} - True if buffer is valid
 */
export const isValidBuffer = (buffer, minSize = 1) => {
  return Buffer.isBuffer(buffer) && buffer.length >= minSize;
};

/**
 * Get buffer size in a human-readable format
 * @param {Buffer} buffer - Buffer to get size for
 * @returns {string} - Human-readable size (e.g., "1.2 MB")
 */
export const getBufferSizeString = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    return 'Invalid buffer';
  }

  const bytes = buffer.length;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  
  return `${size} ${sizes[i]}`;
};

/**
 * Convert buffer to base64 data URL
 * @param {Buffer} buffer - Buffer to convert
 * @param {string} mimeType - MIME type (e.g., 'image/png', 'application/pdf')
 * @returns {string} - Base64 data URL
 */
export const bufferToDataURL = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }
  
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Extract buffer from data URL
 * @param {string} dataURL - Data URL string
 * @returns {Buffer} - Extracted buffer
 */
export const dataURLToBuffer = (dataURL) => {
  if (typeof dataURL !== 'string' || !dataURL.startsWith('data:')) {
    throw new Error('Input must be a valid data URL');
  }
  
  const base64Data = dataURL.split(',')[1];
  return Buffer.from(base64Data, 'base64');
};

export default {
  ensureBuffer,
  isValidBuffer,
  getBufferSizeString,
  bufferToDataURL,
  dataURLToBuffer
};