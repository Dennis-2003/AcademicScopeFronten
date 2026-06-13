# Reglas de Diseño e Interfaz (UI Rules)

Este documento contiene las reglas de diseño y experiencia de usuario que deben seguirse al momento de desarrollar o modificar componentes en la aplicación AcademicScope.

## 1. Cabeceras y Layout Uniforme (Lienzo Único)
Para mantener una experiencia visual limpia, fluida y sin interrupciones, las cabeceras superiores (Top Bars) del layout principal deben seguir estas directrices:

- **Sin Fondos ni Efectos de Vidrio:** Las cabeceras principales no deben tener colores de fondo sólidos, bordes separadores, sombras pesadas ni efectos de desenfoque (`backdrop-blur`). Deben utilizar `bg-transparent` para fusionarse perfectamente con el color de fondo del layout principal.
- **Desplazamiento Natural (No Sticky):** Está prohibido el uso de la propiedad `sticky top-0` o `fixed` para las cabeceras superiores del Dashboard. La cabecera debe desplazarse hacia arriba de manera natural junto con el resto del contenido de la página al hacer scroll.
- **Propósito:** Esto evita que componentes con colores vibrantes (como banners o gráficos) generen "manchas" visuales o parezcan cortados abruptamente al pasar por debajo de barras semitransparentes, garantizando que toda la interfaz se sienta como un lienzo uniforme e ininterrumpido.

## 2. Modales y Overlays
Para garantizar que los modales (ventanas emergentes) siempre se muestren correctamente y no se rompan ni corten por reglas de flexbox o estilos de los contenedores padre, se deben seguir estas reglas:

- **Uso de Portales (`createPortal`)**: Los modales siempre deben renderizarse directamente en el `document.body` utilizando la función `createPortal` de React. Esto permite "escapar" de cualquier contexto de apilamiento (stacking context) provocado por animaciones como `animate-fade-in` o propiedades `transform` en los contenedores superiores.
- **Modales Centrados sobre Drawers Laterales**: Es preferible utilizar modales convencionales centrados (`fixed inset-0 flex items-center justify-center`) en lugar de "Drawers" o paneles laterales. Los paneles laterales son muy propensos a desaparecer o cortarse cuando el contenedor principal tiene `overflow-x-hidden`.
- **Anchos Explícitos y Garantizados**: Nunca confíes únicamente en clases combinadas como `w-full max-w-lg` si el modal puede estar sujeto a un contexto flex desconocido. Fuerza anchos explícitos absolutos y combínalos con comportamientos responsivos asegurados, usando además la propiedad `shrink-0` para prevenir que flexbox aplaste el modal. Ejemplo correcto: `w-[90vw] md:w-[480px] shrink-0`.
