// src/api/iaService.js

// Construimos la URL base usando la configuración centralizada
import { API_BASE_URL } from '../config/env.js';

const API_URL = API_BASE_URL;

export const iaApi = {
    predict: async (payload) => {
        // 1. REVISAR SI HAY TOKEN
        const token = localStorage.getItem('ecco_access_token');

        console.group("🔍 DEPURACIÓN IA SERVICE");
        console.log("📍 URL:", `${API_URL}/ia/predict`);
        console.log("🔑 Token encontrado:", token ? "SÍ (Empieza por " + token.substring(0, 10) + "...)" : "❌ NO HAY TOKEN");
        console.log("📦 Payload a enviar:", payload);

        if (!token) {
            console.error("⛔ DETENIDO: No hay token de autenticación. El usuario debe loguearse.");
            console.groupEnd();
            throw new Error("No estás autenticado. Por favor inicia sesión.");
        }

        try {
            const response = await fetch(`${API_URL}/ia/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            console.log("Estatus HTTP:", response.status);

            if (!response.ok) {
                // Intentamos leer el error que manda el backend
                const errorData = await response.json().catch(() => ({ detail: "Error desconocido (no JSON)" }));
                console.error("❌ Error del Backend:", errorData);

                if (response.status === 401) throw new Error("Sesión vencida o inválida (401).");
                if (response.status === 422) throw new Error("Datos inválidos enviados al servidor (422).");
                if (response.status === 500) throw new Error("Error interno del servidor (500). Revisa la terminal de Python.");

                throw new Error(errorData.detail || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ ÉXITO - Respuesta recibida:", data);
            console.groupEnd();
            return data;

        } catch (error) {
            console.error("💥 Excepción en Fetch:", error);
            console.groupEnd();
            throw error;
        }
    }
};