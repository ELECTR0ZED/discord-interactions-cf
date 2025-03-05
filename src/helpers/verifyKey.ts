import { Buffer } from 'node:buffer';

export default async function verifyKey(
    headers: Headers,
    body: string,
    publicKey: string
  ): Promise<boolean> {
    const signature = headers.get("x-signature-ed25519") || "";
    const timestamp = headers.get("x-signature-timestamp") || "";
  
    if (!signature || !timestamp) {
      return false;
    }
  
    try {
      const encoder = new TextEncoder();
      const keyData = Uint8Array.from(Buffer.from(publicKey, "hex"));
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
        false,
        ["verify"]
      );
  
      const data = encoder.encode(timestamp + body);
      const signatureData = Uint8Array.from(Buffer.from(signature, "hex"));
  
      return await crypto.subtle.verify("NODE-ED25519", key, signatureData, data);
    } catch (error) {
      console.error("Failed to verify request:", error);
      return false;
    }
  }
  