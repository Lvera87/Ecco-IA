import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const BillUploadModal = ({ isOpen, onClose, onDataParsed }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setError(null);
        setParsedData(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) return;

        console.log("BillUpload: Starting upload for file:", file.name);
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log("BillUpload: Sending request to /api/v1/analysis/upload-bill");
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:8000/api/v1/analysis/upload-bill', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("BillUpload: Upload failed with status", response.status, err);
                throw new Error(err.detail || 'Fallo al subir archivo');
            }

            const data = await response.json();
            console.log("BillUpload: Received parsed data:", data);
            setParsedData(data);
        } catch (err) {
            console.error("BillUpload: Error caught:", err);
            setError(err.message);
        } finally {
            setIsUploading(false);
            console.log("BillUpload: Upload process finished");
        }
    };

    const handleConfirm = () => {
        if (onDataParsed && parsedData) {
            onDataParsed(parsedData);
            handleClose();
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Subir Factura</h2>
                        <p className="text-sm text-slate-500">Analizaremos tu consumo con IA.</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {!parsedData ? (
                    <div className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`border - 2 border - dashed rounded - xl p - 8 text - center cursor - pointer transition - colors
                                ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'} `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <UploadCloud size={24} className="text-primary" />
                                </div>
                                {file ? (
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <FileText size={16} />
                                        {file.name}
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">
                                            Arrastra tu factura aquí
                                        </p>
                                        <p className="text-xs">PDF, JPG o PNG (Máx 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="w-full bg-primary text-white"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                'Procesar Factura'
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span className="font-medium">¡Análisis Completado!</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Card className="p-3 bg-slate-50 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold">Periodo</p>
                                <p className="font-bold text-sm truncate">
                                    {parsedData.period_start} - {parsedData.period_end}
                                </p>
                            </Card>
                            <Card className="p-3 bg-slate-50 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold">Consumo</p>
                                <p className="font-bold text-sm text-primary">{parsedData.total_kwh} kWh</p>
                            </Card>
                            <Card className="p-3 bg-slate-50 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold">Total a Pagar</p>
                                <p className="font-bold text-sm text-emerald-600">${parsedData.total_cost?.toLocaleString()}</p>
                            </Card>
                            <Card className="p-3 bg-slate-50 dark:bg-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold">Estrato</p>
                                <p className="font-bold text-sm">{parsedData.stratum || 'N/A'}</p>
                            </Card>
                        </div>

                        <Button
                            onClick={handleConfirm}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Confirmar y Guardar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillUploadModal;
