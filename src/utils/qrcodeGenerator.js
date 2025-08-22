"use client";

import { useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");

  const generateQrCode = async () => {
    try {
      const url = await QRCode.toDataURL(text, { width: 300 });
      setQrCode(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">QR Code Generator</h1>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL"
        className="border p-2 rounded w-80"
      />

      <button
        onClick={generateQrCode}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate QR
      </button>

      {qrCode && (
        <div className="mt-4">
          <Image
            height={500}
            width={500}
            src={qrCode}
            alt="Generated QR Code"
            className="border rounded"
          />
          <a
            href={qrCode}
            download="qrcode.png"
            className="block mt-2 text-blue-500 underline"
          >
            Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}
