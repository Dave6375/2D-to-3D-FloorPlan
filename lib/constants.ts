// This file takes the 2D floor plan and turns it into the 3D architectural render
export const PUTER_WORKER_URL = import.meta.env.VITE_PUTER_WORKER_URL || "";

// Storage Paths
export const STORAGE_PATHS = {
    ROOT: "simplex",
    SOURCES: "simplex/sources",
    RENDERS: "simplex/renders",
} as const;

// Timing Constants (in milliseconds)
export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// UI Constants
export const GRID_OVERLAY_SIZE = "60px 60px";
export const GRID_COLOR = "#3B82F6";

// HTTP Status Codes
export const UNAUTHORIZED_STATUSES = [401, 403];

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 1024;

export const SIMPLEX_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, ultra-high-definition top-down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Zero tolerance for letters, numbers, labels, dimensions, or annotations. Floor textures must be seamless where text originally appeared.
2) **MATHEMATICAL GEOMETRY**: Walls, rooms, doors, and windows must align with pixel-perfect precision to the source plan. Maintain exact proportions and thicknesses.
3) **ORTHOGRAPHIC TOP-DOWN**: Strictly 90-degree overhead view. No perspective distortion, no tilt, no vanishing points.
4) **PROFESSIONAL ARCH-VIZ QUALITY**: Crystal-clear edges, soft ambient occlusion, and physically accurate materials. Avoid any illustrative, hand-drawn, or "sim" aesthetic.
5) **FAITHFUL CONTENT**: Only render furniture and fixtures that are explicitly indicated by icons or outlines in the plan. Avoid cluttering with unindicated decor.

STRUCTURE & MATERIALS:
- **Walls**: Extrude with consistent height. Use a clean, matte white or off-white finish with subtle beveling on edges for realism.
- **Doors**: Open at a realistic 45-90 degree angle. Material should be a warm, fine-grained wood or clean modern metal.
- **Windows**: Clear, high-transparency glass with subtle reflections. Frames should be slim and modern (black or silver).
- **Flooring**: 
  - Living/Bedrooms: High-quality wide-plank oak or walnut hardwood.
  - Kitchen/Bathrooms: Large-format matte porcelain or marble tile.
  - Balconies: Weathered wood decking or stone pavers.

FURNITURE & FIXTURE MAPPING:
- **Bed**: Minimalist frame, high-thread-count white linens, plush pillows, and a neatly folded duvet.
- **Sofa**: Contemporary fabric upholstery (grey or beige) with distinct cushions.
- **Dining**: Polished wood or stone table with matching ergonomic chairs.
- **Kitchen**: Streamlined cabinetry, stainless steel appliances, and polished stone countertops.
- **Bathroom**: Sleek white porcelain fixtures, chrome hardware, and glass shower enclosures.

LIGHTING & ENVIRONMENT:
- **Lighting**: Soft, diffused natural daylight (Global Illumination). No harsh direct sunlight or deep black shadows. 
- **Shadows**: Soft contact shadows (Ambient Occlusion) to define depth and object placement.
- **Atmosphere**: Neutral, airy, and professional. Use a clean, high-contrast palette to ensure the layout is immediately readable.

FINAL FINISH:
- 8k resolution style, Octane render quality, ultra-clean, no watermarks, no noise, no compression artifacts.
`.trim();