/**
 * This file is a Puter Worker, which acts as the backend API for Simplex.
 * It handles project storage (saving, listing, and getting projects) in Puter's KV store,
 * and uses Clerk for user authentication to ensure users can only access their own data.
 */
import { createClerkClient } from '@clerk/backend'

// A simple router for the worker
const routes = [];
const router = {
    post: (path, handler) => routes.push({ method: 'POST', path, handler }),
    get: (path, handler) => routes.push({ method: 'GET', path, handler }),
    handle: async (req) => {
        const url = new URL(req.url);
        const route = routes.find(r => r.method === req.method && r.path === url.pathname);
        if (route) return route.handler({ req });
        return new Response('Not Found', { status: 404 });
    }
};

// clerk: The Clerk backend client used to verify user session tokens and manage authentication.
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const PROJECT_PREFIX = 'simplex_project_';

// jsonError: A helper function to return standardized JSON error responses with proper headers and CORS support.
const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ status, message, ...extra }), { 
        status,
        headers: {
             'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

// getUserId: An async helper that extracts the Bearer token from the Authorization header and verifies it with Clerk to return the unique userId.
const getUserId = async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null
        }
        const token = authHeader.split(' ')[1]
        const requestState = await clerk.authenticateRequest(req)
        return requestState.toAuth().userId
    } catch (e) {
        console.error('Clerk Auth Error:', e)
        return null
    }
}

// POST /api/projects/save: Receives project data, adds user metadata, and saves it both to a user-specific list and as an individual record in Puter KV.
router.post('/api/projects/save', async ({ req }) => {
    try {
        const userId = await getUserId(req)
        if (!userId) {
            return jsonError(401, 'Unauthorized')
        }

        const body = await req.json()
        const { project } = body

        if (!project) {
            return jsonError(400, 'Project data is required')
        }

        // Add user-specific logic: save to puter.kv with userId prefix
        const PROJECTS_KEY = `simplex_projects_${userId}`
        let existingProjects = await puter.kv.get(PROJECTS_KEY) || []
        if (!Array.isArray(existingProjects)) existingProjects = []
        
        // Ensure the project ID is set
        const projectId = project.id || Date.now().toString()
        const index = existingProjects.findIndex(p => p.id === projectId)
        
        const updatedProject = {
            ...project,
            id: projectId,
            userId,
            updatedAt: new Date().toISOString()
        }

        if (index !== -1) {
            existingProjects[index] = updatedProject
        } else {
            existingProjects.unshift(updatedProject)
        }

        await puter.kv.set(PROJECTS_KEY, existingProjects)

        // Also save as individual project for the new GET /get endpoint
        const INDIVIDUAL_PROJECT_KEY = `${PROJECT_PREFIX}${projectId}`;
        await puter.kv.set(INDIVIDUAL_PROJECT_KEY, updatedProject);

        return new Response(JSON.stringify({ 
            status: 200, 
            message: 'Project saved successfully',
            project: updatedProject
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })

    } catch (e) {
        return jsonError(500, 'Failed to save project', {message: e.message || 'Unknown error'})
    }
})

// GET /api/projects/list: Lists all project keys from Puter KV, fetches their contents, and filters them to return only the projects belonging to the authenticated user.
router.get('/api/projects/list', async ({ req }) => {
    try {
        const userId = await getUserId(req)
        if (!userId) {
            return jsonError(401, 'Unauthorized')
        }

        // List all keys starting with PROJECT_PREFIX
        // Note: Puter.js kv.list() returns an array of keys
        const keys = await puter.kv.list(PROJECT_PREFIX) || []
        
        // Fetch values for all these keys
        const projectPromises = keys.map(key => puter.kv.get(key))
        const allProjects = await Promise.all(projectPromises)
        
        // Filter to only include projects belonging to this user
        const userProjects = allProjects.filter(p => p && p.userId === userId)

        return new Response(JSON.stringify({ 
            status: 200, 
            projects: userProjects 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' })
    }
})

// GET /api/projects/get: Fetches a single project by its ID from Puter KV and verifies that the requesting user is the owner before returning it.
router.get('/api/projects/get', async ({ req }) => {
    try {
        const userId = await getUserId(req)
        if (!userId) {
            return jsonError(401, 'Unauthorized')
        }

        const url = new URL(req.url)
        const id = url.searchParams.get('id')

        if (!id) {
            return jsonError(400, 'Project ID is required')
        }

        const projectKey = `${PROJECT_PREFIX}${id}`
        const project = await puter.kv.get(projectKey)

        if (!project) {
            return jsonError(404, 'Project not found')
        }

        // Check ownership
        if (project.userId !== userId) {
            return jsonError(403, 'Forbidden: You do not own this project')
        }

        return new Response(JSON.stringify({ 
            status: 200, 
            project 
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' })
    }
})

// Puter worker entry point
export default {
    fetch: (req) => router.handle(req)
}