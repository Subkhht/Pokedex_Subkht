const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=9999';

let allPokemon = [];
let favorites = JSON.parse(localStorage.getItem('pokemon-favorites')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemonData();
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allPokemon.filter(p => p.name.includes(searchTerm));
            displayPokemon(filtered);
        });
    }
    // Pestañas
    document.getElementById('tab-pokedex').addEventListener('click', () => {
        document.getElementById('tab-pokedex').classList.add('active');
        document.getElementById('tab-favorites').classList.remove('active');
        document.getElementById('pokedex-view').classList.add('active');
        document.getElementById('favorites-view').classList.remove('active');
    });

    document.getElementById('tab-favorites').addEventListener('click', () => {
        document.getElementById('tab-favorites').classList.add('active');
        document.getElementById('tab-pokedex').classList.remove('active');
        document.getElementById('favorites-view').classList.add('active');
        document.getElementById('pokedex-view').classList.remove('active');
        loadFavoritesView(); // Cargar favoritos al entrar
    });
});


async function fetchPokemonData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allPokemon = data.results;
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}
function displayPokemon(pokemonList) {
    const container = document.getElementById('pokemon-items');
    container.innerHTML = '';

    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        container.appendChild(card);
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('li');
    card.classList.add('pokemon-card');

    // Extraer el ID del Pokémon desde la URL
    const idMatch = pokemon.url.match(/\/pokemon\/(\d+)\//);
    const pokeId = idMatch ? idMatch[1] : '';

    const nameContainer = document.createElement('div');
    nameContainer.style.display = 'flex';
    nameContainer.style.alignItems = 'center';
    nameContainer.style.gap = '8px';

    const name = document.createElement('h2');
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const number = document.createElement('span');
    number.textContent = `#${pokeId}`;
    number.className = 'pokemon-number';

    nameContainer.appendChild(name);
    nameContainer.appendChild(number);

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Ver detalles';
    detailsButton.addEventListener('click', async () => {
        await showPokemonDetails(pokemon.url);
    });

    card.appendChild(nameContainer);
    card.appendChild(detailsButton);
    return card;
}

// Función para mostrar los detalles
async function showPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Verificar si ya está en favoritos
        const isFavorite = favorites.some(fav => fav.url === url);

        // Obtener la descripción (flavor text) en español
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // Buscar la descripción en español
        let description = 'Descripción no disponible.';
        const spanishEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'es'
        );
        if (spanishEntry) {
            description = spanishEntry.flavor_text
                .replace(/\f/g, ' ') // Reemplazar saltos de página por espacios
                .replace(/\s+/g, ' '); // Normalizar espacios
        }

        // Generar HTML de estadísticas
        const statsHtml = data.stats.map(stat => `
            <div class="stat-bar">
                <span class="stat-name">${getStatName(stat.stat.name)}:</span>
                <span class="stat-value">${stat.base_stat}</span>
                <div class="bar-container">
                    <div class="bar" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                </div>
            </div>
        `).join('');

        const typesHtml = data.types.map(t =>
            `<img src="${getTypeIcon(t.type.name)}" alt="Tipo ${t.type.name}" title="${t.type.name}" class="type-icon">`
        ).join('');

        // HTML con switch de favoritos
        const detailsDiv = document.getElementById('details');
        detailsDiv.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || 'assets/placeholder.png'}" 
                alt="${data.name}" 
                class="pokemon-sprite clickable-sprite"
                data-pokemon='${JSON.stringify({
            description,
            statsHtml,
            name: data.name
        })}'>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            
            <!-- Switch de favoritos -->
            <div class="favorite-toggle">
                <label class="favorite-switch">
                    <input type="checkbox" id="fav-switch" ${isFavorite ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <span class="fav-label">Favorito</span>
            </div>
            
            <div id="extended-details" style="display:none; margin-top: 1.5rem;"></div>
        `;

        // Evento del switch
        const favSwitch = detailsDiv.querySelector('#fav-switch');
        favSwitch.addEventListener('change', () => {
            const isChecked = favSwitch.checked;
            const pokemonData = {
                name: data.name,
                url: url,
                id: data.id
            };

            if (isChecked) {
                if (!favorites.some(fav => fav.url === url)) {
                    favorites.push(pokemonData);
                    saveFavorites();
                }
            } else {
                favorites = favorites.filter(fav => fav.url !== url);
                saveFavorites();
            }
        });

        // Añadir evento de clic a la imagen (sin cambios)
        const sprite = detailsDiv.querySelector('.clickable-sprite');
        const extendedDetails = document.getElementById('extended-details');

        sprite.addEventListener('click', () => {
            if (extendedDetails.style.display === 'block') {
                extendedDetails.style.display = 'none';
                sprite.title = 'Clic para ver descripción y estadísticas';
            } else {
                const pokemonData = JSON.parse(sprite.dataset.pokemon);
                extendedDetails.innerHTML = `
                    <h4>Descripción</h4>
                    <p class="description">${pokemonData.description}</p>
                    <h4>Estadísticas Base</h4>
                    <div class="stats-container">
                        ${pokemonData.statsHtml}
                    </div>
                `;
                extendedDetails.style.display = 'block';
                sprite.title = 'Clic para ocultar detalles';
            }
        });

        // Scroll suave
        document.getElementById('pokemon-details').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
        document.getElementById('details').innerHTML = '<p>No se pudieron cargar los detalles.</p>';
    }
}

async function createFavoriteCard(pokemonData) {
    const card = document.createElement('div');
    card.classList.add('favorite-card');
    card.innerHTML = '<p>Cargando...</p>';

    try {
        // Obtener datos completos del Pokémon
        const response = await fetch(pokemonData.url);
        const data = await response.json();

        // Obtener descripción
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        let description = 'Descripción no disponible.';
        const spanishEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'es'
        );
        if (spanishEntry) {
            description = spanishEntry.flavor_text
                .replace(/\f/g, ' ')
                .replace(/\s+/g, ' ');
        }

        // Iconos de tipo
        const typesHtml = data.types.map(t =>
            `<img src="${getTypeIcon(t.type.name)}" alt="${t.type.name}" class="type-icon">`
        ).join('');

        // Estadísticas (simplificadas)
        const statsHtml = data.stats.map(stat =>
            `<div><strong>${getStatName(stat.stat.name)}:</strong> ${stat.base_stat}</div>`
        ).join('');

        card.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || 'assets/placeholder.png'}" 
                alt="${data.name}" class="pokemon-sprite">
            <p><strong>ID:</strong> #${data.id}</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <div class="stats">${statsHtml}</div>
            <p class="description">${description}</p>
            <button class="remove-favorite" data-name="${data.name}">Eliminar de favoritos</button>
        `;

        // Evento para eliminar
        const removeBtn = card.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', () => {
            favorites = favorites.filter(fav => fav.name !== data.name);
            localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
            loadFavoritesView(); // Recargar vista
        });

    } catch (error) {
        card.innerHTML = `<p>Error al cargar ${pokemonData.name}</p>`;
        console.error('Error en favorito:', error);
    }

    return card;
}

async function loadFavoritesView() {
    const container = document.getElementById('favorites-items');
    container.innerHTML = '';

    if (favorites.length === 0) {
        container.innerHTML = '<p class="no-results">No tienes Pokémon favoritos aún.</p>';
        return;
    }

    // Crear todas las tarjetas en paralelo
    const cards = await Promise.all(favorites.map(createFavoriteCard));
    cards.forEach(card => container.appendChild(card));
}

function saveFavorites() {
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
}

function getTypeIcon(typeName) {
    return `assets/types/${typeName}.png`;
}

function getStatName(statName) {
    const names = {
        hp: 'HP',
        attack: 'Ataque',
        defense: 'Defensa',
        'special-attack': 'At. Esp.',
        'special-defense': 'Def. Esp.',
        speed: 'Velocidad'
    };
    return names[statName] || statName.charAt(0).toUpperCase() + statName.slice(1);
}