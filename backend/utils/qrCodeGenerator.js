import QRCode from "qrcode";

export const generateQR = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    return qrDataUrl;
  } catch (err) {
    throw new Error("QR code generation failed: " + err.message);
  }
};
