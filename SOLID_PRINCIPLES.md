# Principios SOLID en React ⚛️

Este documento establece las directrices para aplicar los principios **SOLID** en el desarrollo frontend de **AcademicScope** utilizando React. 

Aunque SOLID nació en la Programación Orientada a Objetos, sus conceptos son fundamentales para crear componentes escalables, mantenibles y robustos en React.

---

## 1. Single Responsibility Principle (SRP)
**"Un componente debe tener una única razón para cambiar."**

En React, esto significa que un componente debe enfocarse en *una sola cosa*. Si un componente maneja la UI, la obtención de datos (fetch), y la lógica de negocio compleja, está haciendo demasiado.

### ❌ Mal ejemplo:
Un componente de lista de usuarios que también hace el fetch a la API y formatea las fechas.
```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name} - Registrado: {new Date(u.createdAt).toLocaleDateString()}</li>
      ))}
    </ul>
  );
}
```

### ✅ Buen ejemplo:
Separar la lógica en un **Custom Hook** y extraer el formateo a una función de utilidad.
```jsx
// useUsers.js (Custom Hook maneja la lógica de datos)
function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { /* fetch logic */ }, []);
  return users;
}

// UserList.jsx (Solo renderiza UI)
function UserList() {
  const users = useUsers();
  return (
    <ul>
      {users.map(user => <UserListItem key={user.id} user={user} />)}
    </ul>
  );
}
```

---

## 2. Open/Closed Principle (OCP)
**"Los componentes deben estar abiertos para la extensión, pero cerrados para la modificación."**

No deberías tener que modificar un componente existente para añadir nuevas funcionalidades si puedes evitarlo. Usa la composición (`children`) o *Render Props*.

### ❌ Mal ejemplo:
Un botón con demasiadas condicionales internas (`if type === 'primary'`, `if type === 'danger'`).
```jsx
function Button({ text, isDanger }) {
  return <button className={isDanger ? 'bg-red-500' : 'bg-blue-500'}>{text}</button>;
}
```

### ✅ Buen ejemplo:
Un componente base que permite inyectar contenido y extender estilos.
```jsx
function Button({ children, className, ...props }) {
  return (
    <button className={`base-btn-styles ${className}`} {...props}>
      {children}
    </button>
  );
}

// Extendemos sin modificar el Button original
function DangerButton(props) {
  return <Button className="bg-red-500 text-white" {...props} />;
}
```

---

## 3. Liskov Substitution Principle (LSP)
**"Los subtipos deben ser sustituibles por sus tipos base."**

En React, si dos componentes implementan la misma "interfaz" (esperan las mismas props básicas), deberían poder intercambiarse sin romper la app.

### ✅ Buen ejemplo:
Si tienes un `<TextInput />` y decides crear un `<PasswordInput />`, el `PasswordInput` debería seguir aceptando props nativas como `value`, `onChange`, `placeholder`, igual que el `TextInput`.
```jsx
function PasswordInput(props) {
  return <TextInput type="password" {...props} />;
}
```

---

## 4. Interface Segregation Principle (ISP)
**"Ningún cliente debería verse forzado a depender de métodos (o props) que no utiliza."**

No pases objetos gigantes a un componente si este solo necesita una o dos propiedades. Pasa los datos específicos.

### ❌ Mal ejemplo:
Pasar todo el objeto `user` (con contraseñas, tokens, metadata) solo para mostrar el avatar.
```jsx
function Avatar({ user }) {
  return <img src={user.profile.avatarUrl} alt={user.name} />;
}
```

### ✅ Buen ejemplo:
Pasar solo las props que el componente realmente consume.
```jsx
function Avatar({ imageUrl, altText }) {
  return <img src={imageUrl} alt={altText} />;
}

// Uso:
<Avatar imageUrl={user.profile.avatarUrl} altText={user.name} />
```

---

## 5. Dependency Inversion Principle (DIP)
**"Depende de abstracciones, no de implementaciones concretas."**

En lugar de importar servicios (como `axios` o la API local) directamente dentro del árbol de componentes, inyéctalos a través de **Context API**, **Custom Hooks** o **Props**.

### ❌ Mal ejemplo:
Importar directamente `api.js` en el componente.
```jsx
import api from '../services/api';

function LoginForm() {
  const handleLogin = () => api.post('/login', data);
}
```

### ✅ Buen ejemplo:
Inyectar la dependencia a través de un Contexto o Hook (como ya hacemos con `useAuth()`).
```jsx
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  // El componente no sabe cómo se hace el login internamente, 
  // solo usa la abstracción provista por useAuth.
  const { login } = useAuth();
  
  const handleSubmit = () => login(dni, password);
}
```

---

## Resumen de la Arquitectura en AcademicScope

1. **Vistas / Páginas (`src/pages/`)**: Componentes "tontos" que se enfocan en layout. Usan hooks para obtener datos.
2. **Lógica de Negocio (`src/hooks/` o Contextos)**: Extrae el estado complejo y llamadas a servicios.
3. **Servicios (`src/services/`)**: Abstracciones de llamadas HTTP. Nunca deben contener lógica de UI.
4. **Componentes Reutilizables (`src/components/ui/`)**: Pequeños, modulares, y que siguen OCP e ISP.

Aplicando estos principios logramos un código **Predecible, Testeable y Escalable**.
