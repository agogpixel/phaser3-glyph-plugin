export type CharLike = number | string;

export const charBytesLength = 2;

export function getCharBytes(charlike: CharLike) {
  const code = typeof charlike === 'number' ? charlike : charlike.charCodeAt(0);
  const bytes = new Uint8Array(charBytesLength);

  bytes[0] = (code >> 8) & 0xff;
  bytes[1] = code & 0xff;

  return bytes;
}

export function getChar(bytes: Uint8Array, start = 0) {
  if (!bytes.length || bytes.length % charBytesLength !== 0) {
    throw new Error(`Invalid chars length: ${bytes.length} (must be non-zero multiple of ${charBytesLength})`);
  } else if (start % charBytesLength !== 0) {
    throw new Error(`Invalid start index: ${start} (must be a multiple of ${charBytesLength})`);
  } else if (start > bytes.length - charBytesLength) {
    throw new Error(`Invalid start: ${start} (must be less than or equal to ${bytes.length - charBytesLength})`);
  }

  return String.fromCharCode(((bytes[start] & 0xff) << 8) | (bytes[start + 1] & 0xff));
}
