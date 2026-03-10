import { useLocation, useParams } from 'react-router'
import React from 'react'
import { getProjectById } from '../../lib/puter.action'

const VisualizerId = () => {
    const location = useLocation()
    const { id } = useParams()
    const [project, setProject] = React.useState<{
        initialImage: string | null;
        initialRendered: string | null;
        name: string | null;
    }>({
        initialImage: location.state?.initialImage || null,
        initialRendered: location.state?.initialRendered || null,
        name: location.state?.name || null
    })
    const [loading, setLoading] = React.useState(!project.initialImage && !!id)

    React.useEffect(() => {
        const fetchProject = async () => {
            if (!project.initialImage && id) {
                setLoading(true)
                const data = await getProjectById(id)
                if (data) {
                    setProject({
                        initialImage: data.sourceImage,
                        initialRendered: data.renderedImage || null,
                        name: data.name || null
                    })
                }
                setLoading(false)
            }
        }
        fetchProject()
    }, [id, project.initialImage])

    if (loading) {
        return <div className='visualizer'>Loading project...</div>
    }

    const { initialImage, name } = project

    return (
        <section>
            <h1> {name || 'Untitled Project'}</h1>

            <div className='visualizer'>
                {initialImage ? (
                    <div className='image-container'>
                        <h2>Source Image</h2>
                        <img src={initialImage} alt='Source' />
                    </div>
                ) : (
                    <div className='error'>Project not found or no image available.</div>
                )}
            </div>
        </section>
    )
}
export default VisualizerId


