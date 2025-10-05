# 🎮 Pokédex Interactiva

Una aplicación web moderna y completa para explorar el mundo Pokémon con funcionalidades avanzadas y diseño profesional.

## ✨ Características Principales

### 🔍 Exploración de Pokémon
- **Lista completa** de más de 1000 Pokémon disponibles
- **Búsqueda inteligente** con debouncing para optimizar rendimiento
- **Paginación automática** (20 Pokémon por página)
- **Filtros avanzados** por tipo y generación
- **Detalles completos** con estadísticas, tipos y evoluciones
- **Tabla de efectividad** mostrando fortalezas y debilidades

### 🎨 Diseño y Experiencia de Usuario
- **Diseño responsivo** que se adapta a todos los dispositivos
- **Modo oscuro/claro** con persistencia en localStorage
- **Animaciones fluidas** y transiciones suaves
- **Efectos hover interactivos** con transformaciones 3D
- **Loading spinners** animados durante la carga
- **Scroll to top** button para mejor navegación

### ⚔️ Simulador de Batallas
- **Sistema de combate** con cálculo de efectividad de tipos
- **Autocompletado** para búsqueda rápida de Pokémon
- **Análisis de daño** basado en tipos y estadísticas
- **Animaciones de batalla** con efectos visuales (shake, pulse, glow)
- **Cálculo de ventajas** y desventajas en tiempo real

### ⭐ Sistema de Favoritos
- **Guarda tus Pokémon favoritos** con persistencia
- **Vista detallada** de cada favorito
- **Gestión fácil** para agregar o eliminar
- **Grid responsivo** adaptable

### 🛠️ Constructor de Equipos
- **Crea equipos personalizados** de hasta 6 Pokémon
- **Análisis de cobertura** de tipos del equipo
- **Evaluación de fortalezas** y debilidades

## 🚀 Tecnologías Utilizadas

- **HTML5** - Estructura semántica y accesible
- **CSS3** - Diseño moderno con animaciones y gradientes
- **JavaScript ES6+** - Programación funcional y async/await
- **PokéAPI** - Base de datos completa de Pokémon
- **LocalStorage** - Persistencia de datos del usuario

## 📦 Estructura del Proyecto

```
Pokedex_Subkht/
├── index.html              # Página principal
├── favorites.html          # Página de favoritos
├── team-builder.html       # Constructor de equipos
├── battle_simulador.html   # Simulador de batallas
└── pokedex-app/
    ├── assets/             # Imágenes e iconos
    ├── scripts/            # Lógica JavaScript
    └── styles/             # Estilos CSS
```

## 🎯 Mejoras Implementadas

### 1. Animaciones CSS Avanzadas
- Fade in up para elementos
- Pulse animations para indicadores
- Shimmer effect en barras de estadísticas
- Hover effects con transformaciones 3D
- Background animations sutiles

### 2. Sistema de Filtros Inteligente
- Filtro por tipo (18 tipos disponibles)
- Filtro por generación (Gen I-VIII)
- Combinación de múltiples filtros
- Botón de reset para limpiar filtros

### 3. Interfaz Mejorada
- Gradientes animados en el fondo
- Sombras dinámicas con profundidad
- Transiciones suaves en interacciones
- Feedback visual inmediato

### 4. JavaScript Optimizado
- Función debounce para búsquedas eficientes
- Error handling robusto
- Async/await para llamadas a la API
- Paginación para mejor rendimiento

## 📱 Responsive Design

Optimizado para:
- **Desktop** (1920px+)
- **Laptop** (1024px - 1919px)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔧 Cómo Usar

1. **Clonar el repositorio**
```bash
git clone https://github.com/Subkhht/Pokedex_Subkht.git
```

2. **Abrir el proyecto**
   - Simplemente abre `index.html` en tu navegador
   - No requiere instalación de dependencias

3. **Explorar**
   - Usa la barra de búsqueda para encontrar Pokémon
   - Aplica filtros por tipo y generación
   - Haz clic en "Ver detalles" para información completa
   - Prueba el simulador de batallas
   - Guarda tus favoritos

## 👤 Autor

**Subkht**
- GitHub: [@Subkhht](https://github.com/Subkhht)

## 🙏 Agradecimientos

- [PokéAPI](https://pokeapi.co/) - Por proporcionar los datos de Pokémon
- Nintendo/Game Freak - Por crear el universo Pokémon

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
- [PokéAPI](https://pokeapi.co/) para obtener los datos de los Pokémon

## Recursos adicionales

- Imágenes de tipos de Pokémon: carpeta `src/assets/types/`
- Fuente tipo Pokémon: puedes descargarla de [dafont.com](https://www.dafont.com/es/pokemon.font) y colocarla en `src/styles/fonts/` si quieres el logo más auténtico.

## Contribuir

Si quieres contribuir a este proyecto, haz un fork del repositorio y envía un pull request con tus mejoras.

## Licencia

Este proyecto es open-source y está disponible bajo la [Licencia MIT](LICENSE).
