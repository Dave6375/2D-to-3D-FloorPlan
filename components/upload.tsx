import React from 'react'
import {useAuth, useUser} from "@clerk/react-router";
import {useNavigate} from "react-router";
import {UploadIcon, CheckCircle2, X, ImageIcon} from "lucide-react";

interface UploadProps {
    onComplete?: (base64Image: string) => Promise<boolean>;
}

const Upload = ({ onComplete }: UploadProps) => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    // State Field to check if there has been a file uploaded or not.
    const [file, setFile] = React.useState<File | null>(null);

    // isDragging state to check if the user is dragging a file over the dropzone.
    const [isDragging, setIsDragging] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [status, setStatus] = React.useState<'idle' | 'uploading' | 'completed'>('idle');

    // This is to check if a user is signed in or not, Clerk can take a moment to load auth state.
    const handleUpload = (selectedFile: File) => {
        if (!isSignedIn) {
            navigate('/sign-in');
            return
        }

        setFile(selectedFile);
        setStatus('uploading');
        setProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStatus('completed');
                    
                    // Call onComplete when done
                    if (onComplete) {
                        onComplete('data:image/png;base64,sample');
                    }
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    }

    // When the file input changes, grab the first selected file. If there is one, start uploading it
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleUpload(selectedFile);
        }
    }

    // When the user drags something over this element, allow the drop behavior and mark the UI as currently dragging.
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const onDragLeave = () => {
        setIsDragging(false);
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile) {
            handleUpload(selectedFile);
        }
    }

    const reset = () => {
        setFile(null);
        setProgress(0);
        setStatus('idle');
    }

    // This function will allow the users to know that they have dragged a file dropzone via the dynamic class name.
    // so we have if currently dragging we have a class of is dragging else it's left empty
    return (
        <div className='upload'>
            {status === 'idle' ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <input
                        type='file'
                        className='drop-input'
                        accept='.jpg, .jpeg, .png'
                        disabled={!isSignedIn}
                        onChange={onFileChange}
                    />

                    <div className='drop-content'>
                        <div className='drop-icon'>
                            <UploadIcon className='icon' />
                        </div>
                        <p>
                            {isSignedIn ? (
                                'Click to upload or just drag and drop your file here.'
                            ): ('Sign in or sign up with Clerk to upload your files.') }
                        </p>
                        <p className='help'>Supports JPG, PNG up to 50MB</p>
                    </div>
                </div>
            ) : (
                <div className='upload-status'>
                    <div className='status-content'>
                        <div className='status-icon'>
                            {status === 'completed' ? (
                                <CheckCircle2 className='check' />
                            ) : (
                                <UploadIcon className='animate-bounce' />
                            )}
                        </div>
                        <h3>{file?.name}</h3>
                        <div className='progress'>
                            <div className='bar' style={{ width: `${progress}%` }} />
                        </div>
                        <p className='status-text'>
                            {status === 'uploading' ? `Uploading... ${progress}%` : 'Upload Complete'}
                        </p>
                    </div>
                    <button onClick={reset} className='absolute top-4 right-4 text-zinc-400 hover:text-black'>
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
export default Upload
