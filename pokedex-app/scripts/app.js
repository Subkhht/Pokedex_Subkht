const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=9999';

let allPokemon = [];
let favorites = JSON.parse(localStorage.getItem('pokemon-favorites')) || [];
let currentPage = 1;
const pokemonPerPage = 20;

// Función de debounce para optimizar búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar spinner de carga
function showLoading(container) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

// Mostrar mensaje de error
function showError(container, message) {
    container.innerHTML = `<p style="color: #e52d27; text-align: center; padding: 2rem;">${message}</p>`;
}

// Tabla de tipos defensiva (multiplicadores)
const typeChart = {
    normal: {
        rock: 0.5,
        ghost: 0,
        steel: 0.5,
        fighting: 2
    },
    fire: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 2,
        bug: 2,
        rock: 0.5,
        dragon: 0.5,
        steel: 2
    },
    water: {
        fire: 2,
        water: 0.5,
        grass: 0.5,
        ground: 2,
        rock: 2,
        dragon: 0.5,
        steel: 0.5
    },
    electric: {
        electric: 0.5,
        ground: 0,
        flying: 2,
        steel: 0.5,
        water: 2,
        grass: 0.5,
        dragon: 0.5
    },
    grass: {
        fire: 0.5,
        water: 2,
        grass: 0.5,
        poison: 0.5,
        ground: 2,
        flying: 0.5,
        bug: 0.5,
        rock: 2,
        dragon: 0.5,
        steel: 0.5
    },
    ice: {
        fire: 0.5,
        water: 0.5,
        grass: 2,
        ice: 0.5,
        ground: 2,
        flying: 2,
        dragon: 2,
        steel: 0.5,
        fighting: 2,
        rock: 2
    },
    fighting: {
        flying: 0.5,
        poison: 0.5,
        psychic: 0.5,
        bug: 0.5,
        ghost: 0,
        dark: 2,
        steel: 2,
        ice: 2,
        normal: 2,
        rock: 2,
        fairy: 0.5
    },
    poison: {
        grass: 2,
        poison: 0.5,
        ground: 0.5,
        rock: 0.5,
        ghost: 0.5,
        steel: 0,
        fairy: 2,
        fighting: 0.5,
        bug: 0.5
    },
    ground: {
        water: 2,
        grass: 0.5,
        ice: 2,
        poison: 2,
        rock: 2,
        electric: 2,
        bug: 0.5,
        fighting: 2,
        steel: 2
    },
    flying: {
        electric: 0.5,
        ice: 0.5,
        rock: 0.5,
        grass: 2,
        fighting: 2,
        bug: 2,
        steel: 0.5,
        dragon: 0.5
    },
    psychic: {
        fighting: 2,
        poison: 2,
        psychic: 0.5,
        steel: 0.5,
        dark: 0,
        ghost: 2
    },
    bug: {
        fire: 0.5,
        flying: 0.5,
        rock: 0.5,
        grass: 2,
        fighting: 0.5,
        ground: 0.5,
        steel: 0.5,
        fairy: 0.5,
        dragon: 0.5,
        psychic: 2,
        ghost: 0.5,
        dark: 2
    },
    rock: {
        fire: 2,
        ice: 2,
        fighting: 0.5,
        ground: 0.5,
        flying: 2,
        bug: 2,
        steel: 0.5,
        water: 2,
        grass: 0.5
    },
    ghost: {
        normal: 0,
        psychic: 2,
        ghost: 2,
        dark: 0.5,
        steel: 0.5,
        poison: 0.5,
        bug: 0.5
    },
    dragon: {
        ice: 2,
        dragon: 2,
        fairy: 0,
        fire: 0.5,
        water: 0.5,
        grass: 0.5,
        electric: 0.5,
        steel: 0.5
    },
    dark: {
        fighting: 0.5,
        dark: 0.5,
        fairy: 0.5,
        psychic: 2,
        ghost: 2,
        steel: 0.5,
        bug: 2
    },
    steel: {
        fire: 0.5,
        water: 0.5,
        electric: 0.5,
        ice: 2,
        rock: 2,
        fairy: 2,
        steel: 0.5,
        normal: 0.5,
        grass: 0.5,
        psychic: 0.5,
        dragon: 0.5,
        flying: 0.5,
        bug: 0.5,
        poison: 0
    },
    fairy: {
        fire: 0.5,
        poison: 0.5,
        steel: 0.5,
        fighting: 2,
        dragon: 2,
        dark: 2,
        bug: 0.5,
        flying: 0.5,
        grass: 0.5,
        ground: 0.5,
        psychic: 0.5,
        rock: 0.5,
        ghost: 0.5
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const isFavoritesPage = window.location.pathname.endsWith('favorites.html');

    if (isFavoritesPage) {
        loadFavoritesView();
    } else {
        fetchPokemonData();
        const searchInput = document.getElementById('search');
        if (searchInput) {
            // Usar debounce para optimizar la búsqueda
            const debouncedSearch = debounce((e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                currentPage = 1; // Reiniciar paginación
                const filtered = allPokemon.filter(p => p.name.includes(searchTerm));
                displayPokemon(filtered);
            }, 300);
            
            searchInput.addEventListener('input', debouncedSearch);
        }
    }

    // Activar tema oscuro si está guardado
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeToggle();
    }

    // Listener para cambio de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Función para cambiar tema
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggle();
}

// Actualizar icono del botón de tema
function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.className = isDark ? 'theme-toggle sun-icon' : 'theme-toggle moon-icon';
    }
}

async function fetchPokemonData() {
    const container = document.getElementById('pokemon-items');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allPokemon = data.results;
        displayPokemon(allPokemon);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        showError(container, 'Error al cargar los Pokémon. Por favor, intenta de nuevo más tarde.');
    }
}

function displayPokemon(pokemonList) {
    const container = document.getElementById('pokemon-items');
    if (!container) return;
    
    container.innerHTML = '';

    if (pokemonList.length === 0) {
        container.innerHTML = '<p class="no-results" style="text-align: center; color: #999; padding: 2rem;">No se encontraron Pokémon.</p>';
        return;
    }

    // Implementar paginación simple
    const startIndex = (currentPage - 1) * pokemonPerPage;
    const endIndex = startIndex + pokemonPerPage;
    const paginatedList = pokemonList.slice(startIndex, endIndex);

    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    paginatedList.forEach((pokemon, index) => {
        const card = createPokemonCard(pokemon);
        // Animación escalonada
        card.style.animation = `fadeInUp 0.4s ease-out ${index * 0.03}s backwards`;
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);

    // Agregar controles de paginación si hay más pokémon
    if (pokemonList.length > pokemonPerPage) {
        addPaginationControls(container, pokemonList);
    }
}

// Agregar controles de paginación
function addPaginationControls(container, pokemonList) {
    const totalPages = Math.ceil(pokemonList.length / pokemonPerPage);
    
    const paginationDiv = document.createElement('div');
    paginationDiv.style.cssText = 'display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; align-items: center;';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = '← Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.style.cssText = 'padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid #3b4cca; background: white; cursor: pointer; font-weight: bold;';
    if (currentPage === 1) prevButton.style.opacity = '0.5';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPokemon(pokemonList);
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    pageInfo.style.fontWeight = 'bold';
    
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente →';
    nextButton.disabled = currentPage === totalPages;
    nextButton.style.cssText = 'padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid #3b4cca; background: white; cursor: pointer; font-weight: bold;';
    if (currentPage === totalPages) nextButton.style.opacity = '0.5';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPokemon(pokemonList);
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);
    container.appendChild(paginationDiv);
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

// Obtener icono de tipo con la nueva ruta
function getTypeIcon(typeName) {
    return `pokedex-app/assets/types/${typeName}.png`;
}

// Calcular debilidades/resistencias
function calculateDefensiveMultipliers(types) {
    const multipliers = {};
    const allTypes = Object.keys(typeChart);

    allTypes.forEach(type => {
        let multiplier = 1;
        types.forEach(pokeType => {
            if (typeChart[pokeType] && typeChart[pokeType][type] !== undefined) {
                multiplier *= typeChart[pokeType][type];
            }
        });
        if (multiplier !== 1) {
            multipliers[type] = multiplier;
        }
    });

    return multipliers;
}

// Generar HTML de defensa con categorías claras e iconos
function generateDefensiveHtml(multipliers) {
    const superWeak = [];      // x4
    const weak = [];           // x2
    const resistant = [];      // x0.5
    const superResistant = []; // x0.25
    const immune = [];         // x0

    Object.entries(multipliers).forEach(([type, mult]) => {
        if (mult === 0) {
            immune.push(type);
        } else if (mult === 0.25) {
            superResistant.push(type);
        } else if (mult === 0.5) {
            resistant.push(type);
        } else if (mult === 2) {
            weak.push(type);
        } else if (mult === 4) {
            superWeak.push(type);
        }
        // Ignoramos x1 (daño normal)
    });

    let html = '<h4>Tabla de Efectividad</h4><table class="defense-table">';

    // Superefectivo a (x4)
    html += '<tr><td>Superefectivo contra:</td><td>';
    if (superWeak.length > 0) {
        html += superWeak.map(type => 
            `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" title="${type} (x4)" class="type-icon defense-icon">`
        ).join('');
    } else {
        html += 'Ninguno';
    }
    html += '</td></tr>';

    // Efectivo a (x2)
    html += '<tr><td>Efectivo contra:</td><td>';
    if (weak.length > 0) {
        html += weak.map(type => 
            `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" title="${type} (x2)" class="type-icon defense-icon">`
        ).join('');
    } else {
        html += 'Ninguno';
    }
    html += '</td></tr>';

    // Debil a (x0.5)
    html += '<tr><td>Debil contra:</td><td>';
    if (resistant.length > 0) {
        html += resistant.map(type => 
            `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" title="${type} (x0.5)" class="type-icon defense-icon">`
        ).join('');
    } else {
        html += 'Ninguno';
    }
    html += '</td></tr>';

    // Superdebil a (x0.25)
    html += '<tr><td>Superdebil contra:</td><td>';
    if (superResistant.length > 0) {
        html += superResistant.map(type => 
            `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" title="${type} (x0.25)" class="type-icon defense-icon">`
        ).join('');
    } else {
        html += 'Ninguno';
    }
    html += '</td></tr>';

    // Inmune a (x0)
    html += '<tr><td>Inmune a:</td><td>';
    if (immune.length > 0) {
        html += immune.map(type => 
            `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" title="${type} (inmune)" class="type-icon defense-icon">`
        ).join('');
    } else {
        html += 'Ninguno';
    }
    html += '</td></tr>';

    html += '</table>';
    return html;
}

// === FUNCIÓN PARA OBTENER CADENA EVOLUTIVA CON FLECHAS ↓ ===
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
            let condition = '↓'; // ← ¡Cambiado a flecha hacia abajo!

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

        // Calcular defensas
        const pokemonTypes = data.types.map(t => t.type.name);
        const defensiveMultipliers = calculateDefensiveMultipliers(pokemonTypes);
        const defensiveHtml = generateDefensiveHtml(defensiveMultipliers);

        const detailsDiv = document.getElementById('details');
        detailsDiv.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || '/pokedex-app/assets/placeholder.png'}" 
                alt="${data.name}" 
                class="pokemon-sprite clickable-sprite"
                data-pokemon='${JSON.stringify({
            description,
            statsHtml,
            defensiveHtml,
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

        const sprite = detailsDiv.querySelector('.clickable-sprite');
        const extendedDetails = document.getElementById('extended-details');

        sprite.addEventListener('click', async () => {
            if (extendedDetails.style.display === 'block') {
                extendedDetails.style.display = 'none';
                sprite.title = 'Clic para ver más detalles';
            } else {
                const pokemonData = JSON.parse(sprite.dataset.pokemon);

                const evolutionData = await getEvolutionChain(pokemonData.speciesUrl);
                let evolutionHtml = '';
                if (evolutionData.length > 0) {
                    const pokemonPromises = evolutionData.map(async (item) => {
                        try {
                            const res = await fetch(item.speciesUrl.replace('pokemon-species', 'pokemon'));
                            const pokeData = await res.json();
                            return {
                                name: pokeData.name,
                                sprite: pokeData.sprites.front_default || '/pokedex-app/assets/placeholder.png'
                            };
                        } catch {
                            return { name: '?', sprite: '/pokedex-app/assets/placeholder.png' };
                        }
                    });

                    const pokemonList = await Promise.all(pokemonPromises);
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
                    ${pokemonData.defensiveHtml}
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

        // Calcular defensas para favoritos
        const pokemonTypes = data.types.map(t => t.type.name);
        const defensiveMultipliers = calculateDefensiveMultipliers(pokemonTypes);
        const defensiveHtml = generateDefensiveHtml(defensiveMultipliers);

        card.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default || '/pokedex-app/assets/placeholder.png'}" 
                alt="${data.name}" class="pokemon-sprite">
            <p><strong>ID:</strong> #${data.id}</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <div class="stats">${statsHtml}</div>
            ${defensiveHtml}
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

// *** EXTRAS ***
function saveFavorites() {
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
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

// === MODO OSCURO ===
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Cargar tema guardado
    const currentTheme = localStorage.getItem('pokedex-theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.classList.add('moon-icon');
    } else {
        themeToggle.classList.add('sun-icon');
    }

    // Cambiar tema
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            themeToggle.classList.remove('sun-icon');
            themeToggle.classList.add('moon-icon');
            localStorage.setItem('pokedex-theme', 'dark');
        } else {
            themeToggle.classList.remove('moon-icon');
            themeToggle.classList.add('sun-icon');
            localStorage.setItem('pokedex-theme', 'light');
        }
    });
    
    // === FILTROS Y SCROLL TO TOP ===
    // Configurar filtros
    const typeFilter = document.getElementById('type-filter');
    const genFilter = document.getElementById('gen-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
    
    if (genFilter) {
        genFilter.addEventListener('change', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (typeFilter) typeFilter.value = '';
            if (genFilter) genFilter.value = '';
            const searchInput = document.getElementById('search');
            if (searchInput) searchInput.value = '';
            currentPage = 1;
            displayPokemon(allPokemon);
        });
    }
    
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Aplicar filtros de tipo y generación
async function applyFilters() {
    const typeFilter = document.getElementById('type-filter');
    const genFilter = document.getElementById('gen-filter');
    const searchInput = document.getElementById('search');
    
    let filtered = [...allPokemon];
    
    // Filtro de búsqueda por nombre
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(p => p.name.includes(searchTerm));
    }
    
    // Filtro por generación
    if (genFilter && genFilter.value) {
        const gen = parseInt(genFilter.value);
        const genRanges = {
            1: [1, 151],
            2: [152, 251],
            3: [252, 386],
            4: [387, 493],
            5: [494, 649],
            6: [650, 721],
            7: [722, 809],
            8: [810, 905]
        };
        
        const [min, max] = genRanges[gen];
        filtered = filtered.filter(p => {
            const idMatch = p.url.match(/\/pokemon\/(\d+)\//);
            const id = idMatch ? parseInt(idMatch[1]) : 0;
            return id >= min && id <= max;
        });
    }
    
    // Filtro por tipo (requiere llamada a la API, limitado para rendimiento)
    if (typeFilter && typeFilter.value) {
        const selectedType = typeFilter.value;
        const container = document.getElementById('pokemon-items');
        showLoading(container);
        
        try {
            const typeFiltered = [];
            // Limitar a los primeros 200 para evitar demasiadas peticiones
            const limitedFiltered = filtered.slice(0, 200);
            
            for (const pokemon of limitedFiltered) {
                try {
                    const response = await fetch(pokemon.url);
                    const data = await response.json();
                    const types = data.types.map(t => t.type.name);
                    if (types.includes(selectedType)) {
                        typeFiltered.push(pokemon);
                    }
                } catch (error) {
                    console.error('Error filtering by type:', error);
                }
            }
            filtered = typeFiltered;
        } catch (error) {
            console.error('Error applying type filter:', error);
        }
    }
    
    currentPage = 1;
    displayPokemon(filtered);
}