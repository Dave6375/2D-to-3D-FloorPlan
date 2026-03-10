import puter from '@heyputer/puter.js'
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

/**
 * ### Really simply:
 *
 * This file **takes a project, makes sure its images are stored somewhere usable, cleans up the data, and gives back the final version**.
 *
 * ### Step by step
 *
 * - gets the project data
 * - uploads the images
 * - uses the uploaded image links
 * - removes extra fields it doesn’t want
 * - returns the cleaned project data
 *
 * ### One important note
 *
 * It’s called `createProject`, but **it doesn’t actually save/create the project yet** — it just **prepares it**.
 *
 * So the simplest summary is:
 *
 * **“It gets a project ready to be saved.”**
 * @param item
 */

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  const projectId = item.id;

  const hosting = await getOrCreateHostingConfig();

  const hostedSource = projectId
    ? await uploadImageToHosting({
      hosting,
      url: item.sourceImage,
      projectId,
      label: "source",
    })
    : null;

  const hostedRender = projectId && item.renderedImage
    ? await uploadImageToHosting({
      hosting,
      url: item.renderedImage,
      projectId,
      label: "rendered",
    })
    : null;

  const resolveSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : "");

  if (!resolveSource) {
    console.warn("Failed to host source image, skipping save.");
    return null;
  }

  const resolvedRender = hostedRender?.url
    ? hostedRender?.url
    : item.renderedImage && isHostedUrl(item.renderedImage)
      ? item.renderedImage
      : undefined;

  const {
    sourcePath: _sourcePath,
    renderedPath: _renderedPath,
    publicPath: _publicPath,
    ...rest
  } = item;

  const payload = {
    ...rest,
    sourceImage: resolveSource,
    renderedImage: resolvedRender,
  };

  try {
    // Call the pute worker to store project in kv

    return payload;
  } catch (e) {
    console.error(`Failed to store project: ${e}`);
    return null;
  }
};