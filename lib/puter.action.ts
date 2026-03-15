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

const normalizeLegacyVisibility = (project: any): DesignItem => {
  if ('isPublic' in project) {
    const { isPublic, ...restProject } = project;
    return {
      ...restProject,
      visibility: isPublic ? "public" : "private"
    } as DesignItem;
  }
  return project as DesignItem;
};

export const createProject = async ({ item, visibility }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
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

  const payload: DesignItem = {
    ...rest,
    sourceImage: resolveSource,
    renderedImage: resolvedRender,
    visibility: visibility || item.visibility || "private",
  };

  try {
    // Call the pute worker to store project in kv
    const PROJECTS_KEY = "simplex_projects";
    const result = await puter.kv.get(PROJECTS_KEY);
    const existingProjects = Array.isArray(result) ? result : [];
    
    // Convert legacy isPublic to visibility for all projects
    const normalizedProjects: DesignItem[] = existingProjects.map(normalizeLegacyVisibility);

    // Check if the project already exists, if it does, update it, otherwise prepend
    const index = normalizedProjects.findIndex((p: DesignItem) => p.id === payload.id);
    if (index !== -1) {
      normalizedProjects[index] = payload;
      await puter.kv.set(PROJECTS_KEY, normalizedProjects);
    } else {
      await puter.kv.set(PROJECTS_KEY, [payload, ...normalizedProjects]);
    }

    return payload;
  } catch (e) {
    console.error(`Failed to store project: ${e}`);
    return null;
  }
};

export const getProjectById = async (id: string): Promise<DesignItem | null> => {
  try {
    const PROJECTS_KEY = "simplex_projects";
    const result = await puter.kv.get(PROJECTS_KEY);
    const existingProjects = Array.isArray(result) ? result : [];
    const project = existingProjects.find((p: any) => p.id === id);
    if (!project) return null;

    // Handle legacy conversion
    return normalizeLegacyVisibility(project);
  } catch (e) {
    console.error(`Failed to fetch project ${id}: ${e}`);
    return null;
  }
};

export const getProjects = async (): Promise<DesignItem[]> => {
  try {
    const PROJECTS_KEY = "simplex_projects";
    const result = await puter.kv.get(PROJECTS_KEY);
    const projects = Array.isArray(result) ? result : [];
    
    // Normalize all projects for consistency
    return projects.map(normalizeLegacyVisibility);
  } catch (e) {
    console.error(`Failed to fetch projects: ${e}`);
    return [];
  }
};

export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    const PROJECTS_KEY = "simplex_projects";
    const result = await puter.kv.get(PROJECTS_KEY);
    const existingProjects = Array.isArray(result) ? result : [];
    const filteredProjects = existingProjects.filter((p: any) => p.id !== id);
    
    if (filteredProjects.length === existingProjects.length) {
      return false; // Not found
    }
    
    await puter.kv.set(PROJECTS_KEY, filteredProjects);
    return true;
  } catch (e) {
    console.error(`Failed to delete project ${id}: ${e}`);
    return false;
  }
};