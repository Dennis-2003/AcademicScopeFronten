# AcademicScope Dashboard

## Requisitos
- React 18+
- Tailwind CSS v3
- lucide-react

```bash
npm install lucide-react
```

## Uso
```jsx
// App.jsx o donde quieras renderizarlo
import Dashboard from "./Dashboard";

export default function App() {
  return <Dashboard />;
}
```

## Conectar a tu API REST (Spring Boot)

Reemplaza el bloque de constantes al inicio del archivo con un `useEffect` + `fetch`:

```jsx
const [stats, setStats] = useState(null);

useEffect(() => {
  Promise.all([
    fetch("http://localhost:8080/api/students/count").then(r => r.json()),
    fetch("http://localhost:8080/api/courses/count").then(r => r.json()),
    fetch("http://localhost:8080/api/teachers/count").then(r => r.json()),
    fetch("http://localhost:8080/api/tutors/count").then(r => r.json()),
  ]).then(([students, courses, teachers, tutors]) => {
    setStats({ students, courses, teachers, tutors });
  });
}, []);
```

Luego pasa `stats` a los componentes en vez de usar las constantes `STATS`.

## Fuentes de Google
El componente carga **Syne** desde Google Fonts automáticamente vía `@import` en el `<style>` embebido.
Si prefieres cargarlo en `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
y quita el `@import` del componente.

## Estructura del componente
```
Dashboard.jsx
├── StatCard          — card de métricas con contador animado y barra
├── QuickLink         — botón de acceso rápido con efecto shimmer
├── ActivityItem      — fila de actividad reciente
├── OccupationBar     — barra de progreso animada
├── LiveClock         — reloj analógico en tiempo real
└── SparkChart        — gráfico de líneas SVG dual
```
