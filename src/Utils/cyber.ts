// // a function to encrypt passwords
async function hash(
  text: string
): Promise<string> {
  if (!text) return "";
  const salt = import.meta.env.VITE_SALT;
  if (!salt)
    throw new Error(
      "VITE_SALT environment variable is not defined"
    );
  const encoder = new TextEncoder();
  const data = encoder.encode(text + salt);
  const hashBuffer =
    await window.crypto.subtle.digest(
      "SHA-512",
      data
    );
  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

const cyber = { hash };
export default cyber;
