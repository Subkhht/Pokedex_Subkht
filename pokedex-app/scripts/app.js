const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=9999';

let allPokemon = [];
let favorites = JSON.parse(localStorage.getItem('pokemon-favorites')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const isFavoritesPage = window.location.pathname.endsWith('favorites.html');

    if (isFavoritesPage) {
        loadFavoritesView();
    } else {
        fetchPokemonData();
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = allPokemon.filter(p => p.name.includes(searchTerm));
                displayPokemon(filtered);
            });
        }
    }
});

async function fetchPokemonData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        allPokemon = data.results;
        // No mostramos Pokémon al cargar
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

function displayPokemon(pokemonList) {
    const container = document.getElementById('pokemon-items');
    container.innerHTML = '';

    if (pokemonList.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron Pokémon.</p>';
        return;
    }

    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        container.appendChild(card);
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('li');
    card.classList.add('pokemon-card');

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
    detailsButton.addEventListener('click', () => {
        showPokemonDetails(pokemon.url);
    });

    card.appendChild(nameContainer);
    card.appendChild(detailsButton);
    return card;
}

// === FUNCIÓN PARA OBTENER CADENA EVOLUTIVA CON CONDICIONES COMPLETAS ===
async function getEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionChainUrl = speciesData.evolution_chain.url;

        const chainResponse = await fetch(evolutionChainUrl);
        const chainData = await chainResponse.json();

        const evolutions = [];
        let current = chainData.chain;

        while (current && current.evolves_to.length > 0) {
            const next = current.evolves_to[0];
            let condition = '→';

            if (next.evolution_details && next.evolution_details.length > 0) {
                const detail = next.evolution_details[0];
                const trigger = detail.trigger.name;

                if (trigger === 'level-up') {
                    if (detail.min_level) {
                        condition = `↓ lvl ${detail.min_level}`;
                    } else if (detail.time_of_day) {
                        condition = `↓ ${detail.time_of_day === 'day' ? 'de día' : 'de noche'}`;
                    } else if (detail.min_happiness) {
                        condition = `↓ por Amistad`;
                    } else if (detail.known_move_type) {
                        const moveType = detail.known_move_type.name
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());
                        condition = `↓ con movimiento ${moveType}`;
                    } else {
                        condition = '↓ al subir nivel';
                    }
                } else if (trigger === 'use-item' && detail.item) {
                    const stoneName = detail.item.name
                        .replace(/-stone$/, '')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    condition = `↓ con Piedra ${stoneName}`;
                } else if (trigger === 'trade') {
                    condition = '↓ al Intercambiar';
                } else if (trigger === 'shed') {
                    condition = '↓ al Mudar';
                } else if (trigger === 'spin') {
                    condition = '↓ al Girar';
                } else {
                    condition = '↓';
                }
            }

            evolutions.push({
                speciesUrl: current.species.url,
                condition: condition
            });
            current = next;
        }

        // Añadir el último Pokémon
        if (current) {
            evolutions.push({
                speciesUrl: current.species.url,
                condition: null
            });
        }

        return evolutions;
    } catch (error) {
        console.error('Error al obtener cadena evolutiva:', error);
        return [];
    }
}

// === MOSTRAR DETALLES DEL POKÉMON ===
async function showPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const isFavorite = favorites.some(fav => fav.url === url);

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

        const detailsDiv = document.getElementById('details');
        detailsDiv.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || '/assets/placeholder.png'}" 
                alt="${data.name}" 
                class="pokemon-sprite clickable-sprite"
                data-pokemon='${JSON.stringify({
            description,
            statsHtml,
            name: data.name,
            speciesUrl: data.species.url
        })}'>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            
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

        // Evento de clic en la imagen (con evolución completa)
        const sprite = detailsDiv.querySelector('.clickable-sprite');
        const extendedDetails = document.getElementById('extended-details');

        sprite.addEventListener('click', async () => {
            if (extendedDetails.style.display === 'block') {
                extendedDetails.style.display = 'none';
                sprite.title = 'Clic para ver descripción y estadísticas';
            } else {
                const pokemonData = JSON.parse(sprite.dataset.pokemon);

                // Obtener cadena evolutiva con condiciones
                const evolutionData = await getEvolutionChain(pokemonData.speciesUrl);

                let evolutionHtml = '';
                if (evolutionData.length > 0) {
                    // Obtener datos de todos los Pokémon en la cadena
                    const pokemonPromises = evolutionData.map(async (item) => {
                        try {
                            const res = await fetch(item.speciesUrl.replace('pokemon-species', 'pokemon'));
                            const pokeData = await res.json();
                            return {
                                name: pokeData.name,
                                sprite: pokeData.sprites.front_default || '/assets/placeholder.png'
                            };
                        } catch {
                            return { name: '?', sprite: '/assets/placeholder.png' };
                        }
                    });

                    const pokemonList = await Promise.all(pokemonPromises);

                    // Generar HTML
                    let evoHtml = '';
                    for (let i = 0; i < pokemonList.length; i++) {
                        evoHtml += `
                            <div class="evo-item">
                                <img src="${pokemonList[i].sprite}" alt="${pokemonList[i].name}" class="evo-sprite">
                                <div class="evo-name">${pokemonList[i].name.charAt(0).toUpperCase() + pokemonList[i].name.slice(1)}</div>
                            </div>
                        `;
                        if (i < evolutionData.length && evolutionData[i].condition) {
                            evoHtml += `<div class="evo-arrow">${evolutionData[i].condition}</div>`;
                        }
                    }

                    evolutionHtml = `
                        <h4>Línea Evolutiva</h4>
                        <div class="evolution-chain">
                            ${evoHtml}
                        </div>
                    `;
                }

                extendedDetails.innerHTML = `
                    <h4>Descripción</h4>
                    <p class="description">${pokemonData.description}</p>
                    <h4>Estadísticas Base</h4>
                    <div class="stats-container">
                        ${pokemonData.statsHtml}
                    </div>
                    ${evolutionHtml}
                `;
                extendedDetails.style.display = 'block';
                sprite.title = 'Clic para ocultar detalles';
            }
        });

        document.getElementById('pokemon-details').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
        document.getElementById('details').innerHTML = '<p>No se pudieron cargar los detalles.</p>';
    }
}

// === FAVORITOS ===
async function createFavoriteCard(pokemonData) {
    const card = document.createElement('div');
    card.classList.add('favorite-card');
    card.innerHTML = '<p>Cargando...</p>';

    try {
        const response = await fetch(pokemonData.url);
        const data = await response.json();

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

        const typesHtml = data.types.map(t =>
            `<img src="${getTypeIcon(t.type.name)}" alt="${t.type.name}" class="type-icon">`
        ).join('');

        const statsHtml = data.stats.map(stat =>
            `<div><strong>${getStatName(stat.stat.name)}:</strong> ${stat.base_stat}</div>`
        ).join('');

        card.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || '/assets/placeholder.png'}" 
                alt="${data.name}" class="pokemon-sprite">
            <p><strong>ID:</strong> #${data.id}</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <div class="stats">${statsHtml}</div>
            <p class="description">${description}</p>
            <button class="remove-favorite" data-name="${data.name}">Eliminar de favoritos</button>
        `;

        const removeBtn = card.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', () => {
            favorites = favorites.filter(fav => fav.name !== data.name);
            saveFavorites();
            loadFavoritesView();
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

    const cards = await Promise.all(favorites.map(createFavoriteCard));
    cards.forEach(card => container.appendChild(card));
}

function saveFavorites() {
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
}

// === FUNCIONES AUXILIARES ===
function getTypeIcon(typeName) {
    return `pokedex-app/assets/types/${typeName}.png`;
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