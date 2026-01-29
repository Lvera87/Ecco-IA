import React, { useState } from 'react';
import { documentsApi } from '../api/documents';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Solo se permiten archivos PDF');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        console.log("DocumentUpload: Starting upload for file:", file.name);

        try {
            const result = await documentsApi.upload(file);
            console.log("DocumentUpload: Success", result);
            setSuccess('Archivo subido correctamente');
            setFile(null);
            // Reset input value usually requires a ref, but simple null works for state
            if (onUploadSuccess) onUploadSuccess(result);
        } catch (err) {
            console.error("DocumentUpload: Error", err);
            setError('Error al subir el archivo. Inténtalo de nuevo.');
        } finally {
            setUploading(false);
            console.log("DocumentUpload: Finished");
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Subir Documento PDF</h3>

            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-4 py-2 rounded font-bold text-white transition-colors
            ${!file || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
            </div>
        </div>
    );
};

export default DocumentUpload;
