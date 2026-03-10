// This file will handle the upload of the images to the puter.com hoster domain

/**
 * This is the shipping manager.
 * Its job is something like:
 * Take the image, figure out where it should live online, and get me a public link.
 */
import puter from "@heyputer/puter.js";
import {
  createHostingSlug,
  fetchBlobFromUrl,
  getHostedUrl,
  getImageExtension,
  HOSTING_CONFIG_KEY,
  imageUrlToPngBlob,
  isHostedUrl,
} from "./utils";

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
  const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

  /**
   * If a subdomain name already exists, the function returns it immediately. or more accurately, reuses it
   *  So this function avoids creating a new hosting config every time. Nice and efficient. Very “don’t reinvent the subdomain.”
   */
  if (existing?.subdomain) return { subdomain: existing.subdomain };

  // If no config was found, it generates a new candidate subdomain.
  const subdomain = createHostingSlug();

  // Inside the try block, it attempts to create hosting:
  // create a hosting site with the given subdomain
  try {
    const created = await puter.hosting.create(subdomain, ".");

    /**
     * Instead of trusting the original generated string, it uses the subdomain returned by the hosting API.
     * Now that hosting is successfully created, the config is saved in key-value storage.
     *
     * Basically, it does use the generated subdomain name as the request name and sends it to puter api and puter creates hosting/domain
     * the api returns the actual subdomain that was created
     */
    const config = { subdomain: created.subdomain };
    await puter.kv.set(HOSTING_CONFIG_KEY, config);

    return config;
  } catch (e) {
    console.warn(`Could not find subdomain: ${e}`);
    return null;
  }
};


/**
 *
 * uploadImageToHosting takes an image URL and tries to store
 * that image in your Puter hosting space, then returns the final hosted URL.
 * if it succeeds, it returns:
 * ```
 * { url: "https://..." }
 * ```
 *
 * If it fails, it returns:
 * ```
 * null
 * ```
 * @param hosting
 * @param url
 * @param projectId
 * @param label
 */
export const uploadImageToHosting = async ({
  hosting,
  url,
  projectId,
  label,
    // HostedAsset basically an object with a url or null where as
    // its hosting/upload failed
}: StoreHostedImageParams): Promise<HostedAsset | null> => {

  if (!hosting || !url) return null;
  // CHeck whether the URL is already a hosted Puter url, so the function avioids re uploading
  //  an image that's already in the right place
  if (isHostedUrl(url)) return { url };

  try {
    // converts the image url into file data
    const resolved =
      label === "rendered"
          // if the image is a rendered image, it converts it into a png blob
          // because usally renderd images are normalized this way so the output is predictable
        ? await imageUrlToPngBlob(url).then((blob) => (blob ? { blob, contentType: "image/png" } : null))

          // if the label is not rendered so likely, the source image it just
          // fetches the image from the url and returns the blob content type: fetch as-is
        : await fetchBlobFromUrl(url);

    // if it couldn't resolve the image into a blob, it returns null
    if (!resolved) return null;

    // figures out the content type of image like 'image/png', 'image/jpeg'
    const contentType = resolved.contentType || resolved.blob.type || "";
    // This determines the file extension based on the content type and/or the URL. e.g.: png, jpg, webp
    const ext = getImageExtension(contentType, url);

    /**
     * builds the directory and file path, creates a storage location
     * projectId = 123
     * label = source
     * ext = png
     * example: filePath = projects/123/source.png
     */
    const dir = `projects/${projectId}`;
    const filePath = `${dir}/${label}.${ext}`;

    // This wraps the blob into a file object
    const file = new File([resolved.blob], `${label}.${ext}`, {
      type: contentType,
    });

    /**
     *  This creates the project directory in Puter's file system
     *  the createMissingParent: means it can create parent folders too.
     *  So if project/123 doesn't exist, it will create both project123 folders
     */
    await puter.fs.mkdir(dir, { createMissingParents: true });

    /**
     * write the file to puter storage
     *  this actually uploads/saves the file
     */
    await puter.fs.write(filePath, file);
    const hostedUrl = getHostedUrl({ subdomain: hosting.subdomain }, filePath);


    /**
     * Build the public hosted URL
     * Now that the file exists in hosting storage, the code builds the public URL for it
     * https://your-subdomain/.../projects/123/source.jpg
     */
    return hostedUrl ? { url: hostedUrl } : null;
  } catch (e) {
    console.error(`Failed to store hosted image: ${e}`);
    return null;
  }
};

/**
 * This function is basically:
 * Make sure hosting info and image URL exist
 * If the image is already hosted, return it
 * Otherwise, turn the image into a Blob (Blob is a file-like object of immutable, raw data. They can be read as text or binary data, or converted into a ReadableStream so its methods can be used for processing the data.)
 * Figure out the file type and file name
 * Write the file into Puter storage
 * Build the public hosted URL
 * Return that URL
 */
