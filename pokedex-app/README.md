# Aplicación Pokédex

¡Bienvenido/a a la aplicación Pokédex! Este proyecto es una aplicación web sencilla que permite buscar y explorar Pokémon de manera visual.

## Estructura del Proyecto

````
pokedex-app 
├── src 
│ ├── index.html # Documento HTML principal 
│ ├── styles 
│ │ └── main.css # Estilos de la aplicación 
│ ├── scripts 
│ │ └── app.js # Lógica JavaScript para obtener y mostrar los Pokémon 
│ └── assets 
│ └── types # Imágenes de los tipos de Pokémon (bug.png, fire.png, etc.) 
│ └── pokedex.png # Icono de Pokédex para la pestaña 
└── README.md # Documentación del proyecto
````

## Cómo usar la Pokédex

1. **Clona el repositorio**:
   
   ``git clone <repository-url>``
   

2. **Navega al directorio del proyecto**:
   
   ``cd pokedex-app``
   
3. **Abre el archivo `index.html`** en tu navegador para ver la aplicación.

## Características

- **Búsqueda por nombre:** Escribe el nombre de un Pokémon para buscarlo. No se muestran resultados hasta que escribes.
- **Lista visual:** Los Pokémon aparecen en tarjetas con su nombre y número.
- **Ver detalles:** Al hacer clic en "Ver detalles", se muestra la imagen, número, altura, peso y tipos del Pokémon.
- **Tipos visuales:** Los tipos aparecen como "badges" coloridos con su icono, integrados en la ficha.
- **Scroll automático:** Al ver detalles, la página sube automáticamente a la sección de detalles.
- **Diseño tipo Pokédex:** Inspirado en la Pokédex clásica, con colores y bordes característicos.
- **Cantidad de Pokémon:** Trae los 1025 Pokémon actuales

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- [PokéAPI](https://pokeapi.co/) para obtener los datos de los Pokémon

## Recursos adicionales

- Imágenes de tipos de Pokémon: carpeta `src/assets/types/`
- Fuente tipo Pokémon: puedes descargarla de [dafont.com](https://www.dafont.com/es/pokemon.font) y colocarla en `src/styles/fonts/` si quieres el logo más auténtico.

## Contribuir

Si quieres contribuir a este proyecto, haz un fork del repositorio y envía un pull request con tus mejoras.

## Licencia

Este proyecto es open-source y está disponible bajo la [Licencia MIT](LICENSE).
