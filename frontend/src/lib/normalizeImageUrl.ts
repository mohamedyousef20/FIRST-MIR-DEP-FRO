export function normalizeImageUrl(url?: string | null): string {
  // Return placeholder if no URL provided
  if (!url) {
    return "/placeholder.svg";
  }

  let cleaned = url.trim();

  // Fix common malformed protocol delimiter (e.g. "https:res.cloudinary.com...")
  if (cleaned.startsWith("https:") && !cleaned.startsWith("https://")) {
    cleaned = cleaned.replace(/^https:/, "https://");
  } else if (cleaned.startsWith("http:") && !cleaned.startsWith("http://")) {
    cleaned = cleaned.replace(/^http:/, "http://");
  }

  // Ensure a slash after the Cloudinary domain
  cleaned = cleaned.replace(
    /(https?:\/\/res\.cloudinary\.com)(?!\/)/,
    "$1/",
  );

  // Ensure 'image/upload' segment has proper slashes
  // 1. between cloud-name and 'image'
  // cleaned = cleaned.replace(/(res\.cloudinary\.com\/[^/]+)(?=image\/upload|imageupload)/, "$1/");
  // 2. between 'image' and 'upload'
  cleaned = cleaned.replace(/imageupload/, "image/upload");
  // 3. ensure slash after 'upload'
  cleaned = cleaned.replace(/image\/upload(?!\/)/, "image/upload/");

  return cleaned;
}
