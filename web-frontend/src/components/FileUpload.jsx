import React, { useState, useRef } from 'react';
import api from '../api';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
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
        setMessage('');

        try {
            const response = await api.post('upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Upload successful!');
            setFile(null); // Reset file after success
            onUploadSuccess(response.data);
        } catch (error) {
            setMessage('Upload failed. Please try again.');
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
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-full ${dragActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        {file ? (
                            <File className={`h-8 w-8 ${dragActive ? 'text-primary-600' : 'text-gray-500'}`} />
                        ) : (
                            <UploadCloud className={`h-8 w-8 ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                        )}
                    </div>

                    <div>
                        {file ? (
                            <p className="font-medium text-gray-900">{file.name}</p>
                        ) : (
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">
                                    <span
                                        onClick={() => inputRef.current?.click()}
                                        className="text-primary-600 hover:underline cursor-pointer"
                                    >
                                        Click to upload
                                    </span>
                                    {' '}or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {file && (
                        <div className="flex gap-3 mt-2">
                            <Button
                                onClick={() => setFile(null)}
                                variant="secondary"
                                className="text-sm py-1.5 h-auto text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100"
                            >
                                Remove
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="text-sm py-1.5 h-auto"
                            >
                                {uploading ? 'Uploading...' : 'Upload File'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.includes('success')
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.includes('success') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
