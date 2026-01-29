import React, { useEffect, useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import { documentsApi } from '../api/documents';
import { format } from 'date-fns';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const docs = await documentsApi.list();
            setDocuments(docs);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUploadSuccess = (newDoc) => {
        setDocuments(prev => [newDoc, ...prev]);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Documentos</h1>
                <p className="text-gray-600 dark:text-gray-400">Sube y gestiona tus archivos PDF.</p>
            </header>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Subir Nuevo</h2>
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Mis Documentos</h2>
                {loading ? (
                    <p>Cargando...</p>
                ) : documents.length === 0 ? (
                    <p className="text-gray-500">No has subido ningún documento.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {doc.filename}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {doc.content_type}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Documents;
