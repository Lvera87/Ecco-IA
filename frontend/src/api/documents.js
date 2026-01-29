import client from './client';

export const documentsApi = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // El backend espera el archivo en el campo 'file'
        const response = await client.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    list: async () => {
        const response = await client.get('/documents/');
        return response.data;
    }
};
