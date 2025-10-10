export function decodeEsewaData(encoded) {
  if (!encoded) {
    console.error("Base64 string is null or undefined");
    return null;
  }
  try {
    const standardBase64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(standardBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding base64 string:", error);
    return null;
  }
}
