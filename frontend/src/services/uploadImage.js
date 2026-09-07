import initSupabase from "./supabase";

const supabase = initSupabase;
const BUCKET_NAME = "images";

/**
 * Uploads a file into an 'avatars' directory with a globally unique filename.
 * Automatically computes and returns the public URL instantly.
 */
async function uploadAndGetPublicUrl(
  file,
  userId = "anonymous",
  oldAvatarPath = null,
) {
  if (!file) throw new Error("No file provided for upload");

  try {
    // create a unique path to prevent naming collisions and organize folders
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filePath = `avatars/${userId}-${uniqueFileName}.${fileExtension}`;

    // perform upload operation with cache-control for fast CDN distribution
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // false ensures we never accidentally corrupt someone else's file
      });

    if (error) throw error;

    //performance Win: getPublicUrl is synchronous. No 'await' needed.
    // This removes an unnecessary network round-trip request entirely.
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (oldAvatarPath) {
      await deleteImage(oldAvatarPath);
    }

    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload error details:", err);
    throw err;
  }
}

/**
 * Removes a file asset from storage using its complete path or relative URL context.
 */
async function deleteImage(path) {
  if (!path) return;
  try {
    // Extract relative storage path if a full URL string was passed in accidentally
    const storagePath = path.includes("/storage/v1/object/public/")
      ? path.split(`${BUCKET_NAME}/`).pop()
      : path;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);
    if (error) throw error;
  } catch (err) {
    console.error("Delete asset error:", err);
    throw err;
  }
}

/**
 * Retrieves standard public URLs synchronously from an existing path reference.
 */
function getImgPublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Fetches an image URL as a blob and forces the browser to download it.
 * @param {string} imageUrl - The full public URL of the avatar image.
 * @param {string} username - Used to name the downloaded file cleanly.
 */
async function downloadProfileImage(imageUrl, username = "user") {
  if (!imageUrl) return;

  try {
    //  fetch the image data directly as raw binary data (Blob)
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();

    // create a local temporary object URL in memory
    const blobUrl = window.URL.createObjectURL(blob);

    // create a hidden anchor link element
    const link = document.createElement("a");
    link.href = blobUrl;

    // Clean filename: e.g., "jane_smith-avatar.jpg"
    const fileExtension = imageUrl.split(".").pop().split(/[?#]/)[0] || "jpg";
    link.download = `${username}-avatar.${fileExtension}`;

    // append to DOM, click it programmatically, and clean up immediately
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl); // free up browser memory allocation
  } catch (error) {
    console.error("Failed to download image asset:", error);
    throw error;
  }
}

export {
  uploadAndGetPublicUrl,
  deleteImage,
  getImgPublicUrl,
  downloadProfileImage,
};
