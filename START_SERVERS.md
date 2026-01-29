# 🚀 Cómo Iniciar los Servidores

## Opción 1: Ambos servidores en terminales separadas

### Terminal 1 - Backend (FastAPI)
```bash
cd /home/luis/Desktop/Ecco-IA/backend
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend (Vite + React)
```bash
cd /home/luis/Desktop/Ecco-IA/frontend
npm run dev
```

---

## Opción 2: Usando el Makefile (requiere ajustes para Linux)

```bash
cd /home/luis/Desktop/Ecco-IA
make dev
```

**Nota:** El Makefile actual tiene rutas de Windows (`.venv/Scripts/`). Para Linux usar `.venv/bin/`.

---

## URLs de Acceso

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Backend Docs** | http://localhost:8000/docs |

---

## Detener los Servidores

### Detener desde la terminal
Presiona `Ctrl + C` en cada terminal

### Detener por comando
```bash
# Detener frontend
pkill -f "npm run dev"

# Detener backend
pkill -f "uvicorn app.main:app"
```

---

## Reiniciar Base de Datos (si es necesario)

```bash
cd backend
rm -f sql_app.db sql_app.db-shm sql_app.db-wal
.venv/bin/python init_db.py
```
