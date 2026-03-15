import {useLocation, useNavigate, useParams} from 'react-router'
import React, {useEffect, useRef, useState} from 'react'
import { createProject, getProjectById } from '../../lib/puter.action'
import {generate3DView} from "../../lib/ai.action";
import {Download, RefreshCcw, ShareIcon} from "lucide-react";
import Button from "../../components/Button";

const VisualizerId = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const [project, setProject] = React.useState<{
        initialImage: string | null;
        initialRendered: string | null;
        name: string | null;
    }>({
        initialImage: location.state?.initialImage || null,
        initialRendered: location.state?.initialRender || location.state?.initialRendered || null,
        name: location.state?.name || null
    })
    const [loading, setLoading] = React.useState(!project.initialImage && !!id)


    const hasInitialGenerated = useRef(false)

    const [error, setError] = useState<string | null>(null)
    const [isProcesing, setIsProcessing] = useState(false)
    const [currentImage, setCurrentImage] = useState<string | null>(project.initialRendered || null)
    const [sliderPosition, setSliderPosition] = useState(50)

    useEffect(() => {
        if (project.initialRendered) {
            setCurrentImage(project.initialRendered)
        }
    }, [project.initialRendered])

    const initialImage = project.initialImage
    const initialRendered = project.initialRendered

    // Sends us back to the home page.
    const handleBack = () => navigate('/')

    const runGeneration = async () => {
        if(!initialImage || !id) return;

        try {
            setError(null)
            setIsProcessing(true)
            console.log(`[Visualizer] Starting 3D generation for project ${id}...`);
            const result = await generate3DView({ sourceImage: initialImage, projectId: id });

            if(result?.renderedImage) {
                console.log(`[Visualizer] 3D generation successful for project ${id}`);
                setCurrentImage(result.renderedImage)

                // update the project with the new rendered image
                const updatedProject = {
                    ...project,
                    initialRendered: result.renderedImage
                }
                setProject(updatedProject)

                // Persist the updated project to KV
                const data = await getProjectById(id)
                if (data) {
                    await createProject({
                        item: {
                            ...data,
                            renderedImage: result.renderedImage
                        }
                    })
                }
            } else {
                throw new Error("No image was returned from the AI generator.");
            }
        } catch (err: any) {
            console.error('Error generating 3D view:', err);
            setError(err.message || "An unexpected error occurred during rendering.");
        } finally {
            setIsProcessing(false)
        }
    }

    //whether we have an initial rendered image or not, we want to run the generation once when the component mounts, but only if we haven't already done so and if we have an initial image to work with.
    useEffect(() => {
        if (initialImage && !initialRendered && !hasInitialGenerated.current && !isProcesing) {
            hasInitialGenerated.current = true
            runGeneration()
        }
    }, [initialImage, initialRendered, isProcesing]);

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



    return (
        <div className='visualizer'>
            <div className='topbar'>
                <div className='brand' onClick={handleBack}>
                    <div className='name'>SIMPLEX</div>
                </div>
                <button className='btn btn--ghost exit' onClick={handleBack}>
                    Exit Visualizer
                </button>
            </div>

            <section className='content'>
                <div className='panel'>
                    <div className='panel-header'>
                        <div className='panel-meta'>
                            <h1>{project.name || 'Untitled Project'}</h1>
                            <p className='note'>Created by You</p>
                        </div>

                        <div className='panel-actions'>
                            <Button
                                size='sm'
                                onClick={() => {}}
                                className='export'
                                disabled={!currentImage}
                            >
                                <Download className='w-4 h-4 mr-2' /> Export
                            </Button>
                            <Button size='sm' onClick={() => {}} className='share'>
                                <ShareIcon className='w-4 h-4 mr-2' /> 
                                Share
                            </Button>
                        </div>
                    </div>

                    <div className={`render-area ${isProcesing ? 'is-processing' : ''} ${error ? 'has-error' : ''}`}>
                        {currentImage && initialImage && !error ? (
                            <div className="comparison-container" style={{ '--position': `${sliderPosition}%`, '--position-num': sliderPosition } as React.CSSProperties}>
                                <div className="image-after">
                                    <img src={currentImage} alt="3D Render" />
                                </div>
                                <div className="image-before">
                                    <img src={initialImage} alt="Original Floor Plan" />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderPosition}
                                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                                    className="comparison-slider"
                                />
                                <div className="slider-handle">
                                    <div className="handle-line"></div>
                                    <div className="handle-button">
                                        <div className="handle-arrows"></div>
                                    </div>
                                </div>
                                <div className="label-before">Before</div>
                                <div className="label-after">After</div>
                            </div>
                        ) : error ? (
                            <div className="render-error">
                                <div className="error-card">
                                    <span className="error-icon">!</span>
                                    <h3>Oops! Rendering Failed</h3>
                                    <p>{error}</p>
                                    <Button size="sm" onClick={runGeneration} className="retry-btn">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Retry Generation
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="render-placeholder">
                                {initialImage && (
                                    <img src={initialImage} alt='Original' className='render-fallback' />
                                )}
                            </div>
                        )}

                        {isProcesing && (
                            <div className='render-overlay'>
                                <div className='rendering-card'>
                                    <RefreshCcw className='spinner' />
                                    <span className='title'>Rendering...</span>
                                    <span className='subtitle'>Processing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
export default VisualizerId


