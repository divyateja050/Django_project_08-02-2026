import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        const loadingToast = toast.loading('Uploading analysis...');

        try {
            const response = await api.post('upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Upload successful!', { id: loadingToast });
            setFile(null); // Reset file after success
            onUploadSuccess(response.data);
        } catch (error) {
            toast.error('Upload failed. Please try again.', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Upload Data</h3>
                    <p className="text-sm text-gray-500">Upload CSV files containing equipment parameters</p>
                </div>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer group ${dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-primary-100' : 'bg-slate-100 group-hover:bg-primary-50'}`}>
                        {file ? (
                            <File className={`h-8 w-8 ${dragActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
                        ) : (
                            <UploadCloud className={`h-8 w-8 ${dragActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
                        )}
                    </div>

                    <div>
                        {file ? (
                            <div className="text-center">
                                <p className="font-medium text-slate-900">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="font-medium text-slate-700 group-hover:text-primary-700 transition-colors">
                                    Click to select or drag and drop
                                </p>
                                <p className="text-xs text-slate-400">CSV files only (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {file && (
                        <div className="flex gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                                onClick={() => {
                                    setFile(null);
                                    if (inputRef.current) inputRef.current.value = "";
                                }}
                                variant="secondary"
                                className="text-sm py-1.5 h-auto text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100"
                            >
                                Remove
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="text-sm py-1.5 h-auto bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                {uploading ? 'Uploading...' : 'Upload Analysis'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default FileUpload;
