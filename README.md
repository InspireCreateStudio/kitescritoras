# Kit Escritoras

App para planificar tu novela romántica de principio a fin: la historia, la escritura diaria, el lanzamiento, las redes, los pedidos, las cuentas y la prensa.

Funciona como el Planner: se instala en el móvil y en el ordenador, y va sin conexión. Los datos se guardan en el navegador de cada aparato. Usa «Copia de seguridad» para pasarlos de un aparato a otro.

**Abrir la app:** https://inspirecreatestudio.github.io/kitescritoras/

## Archivos

- `index.html`: la estructura de la página
- `app.css`: el diseño (colores, letras, móvil)
- `app.js`: todo el funcionamiento
- `sw.js`: hace que funcione sin conexión y se actualice sola
- `manifest.webmanifest` y los `.png`: nombre e iconos para instalarla

Al cambiar `app.js` o `app.css`, sube también `sw.js` con la `VERSION` cambiada (ks-v4, ks-v5…) para que los aparatos que ya la tienen instalada se actualicen.
