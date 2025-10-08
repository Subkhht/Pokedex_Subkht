const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=9999';

let allPokemon = [];
let favorites = JSON.parse(localStorage.getItem('pokemon-favorites')) || [];
let favoritesDetails = JSON.parse(localStorage.getItem('pokemon-favorites-details')) || {};
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

// Botón Sorpréndeme
function showRandomPokemon() {
    if (allPokemon.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];
    showPokemonDetails(randomPokemon.url);
    
    // Animación del botón
    const btn = document.getElementById('surprise-btn');
    if (btn) {
        btn.style.transform = 'scale(1.2) rotate(360deg)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 500);
    }
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

        // Botón Sorpréndeme
        const surpriseBtn = document.getElementById('surprise-btn');
        if (surpriseBtn) {
            surpriseBtn.addEventListener('click', showRandomPokemon);
            surpriseBtn.addEventListener('mouseenter', () => {
                surpriseBtn.style.transform = 'scale(1.1)';
            });
            surpriseBtn.addEventListener('mouseleave', () => {
                surpriseBtn.style.transform = 'scale(1)';
            });
        }
    }

    // Activar tema oscuro si está guardado
    const theme = localStorage.getItem('pokedex-theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Listener para cambio de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Inicializar icono
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.className = isDark ? 'theme-toggle moon-icon' : 'theme-toggle sun-icon';
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            if (isDark) {
                themeToggle.className = 'theme-toggle moon-icon';
                localStorage.setItem('pokedex-theme', 'dark');
            } else {
                themeToggle.className = 'theme-toggle sun-icon';
                localStorage.setItem('pokedex-theme', 'light');
            }
        });
    }
});

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

    // Agregar imagen animada del Pokémon
    const spriteContainer = document.createElement('div');
    spriteContainer.className = 'card-sprite-container';
    
    const spriteImg = document.createElement('img');
    spriteImg.className = 'card-pokemon-sprite';
    spriteImg.alt = pokemon.name;
    spriteImg.loading = 'lazy';
    
    // Intentar cargar sprite animado de Gen 5, si no existe usar el estático
    fetch(pokemon.url)
        .then(res => res.json())
        .then(data => {
            const animatedSprite = data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
            const staticSprite = data.sprites.front_default;
            spriteImg.src = animatedSprite || staticSprite || '/pokedex-app/assets/placeholder.png';
        })
        .catch(() => {
            spriteImg.src = '/pokedex-app/assets/placeholder.png';
        });
    
    spriteContainer.appendChild(spriteImg);

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

    card.appendChild(spriteContainer);
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
            <div style="position: relative; display: inline-block;">
                <img src="${data.sprites.versions['generation-v']['black-white'].animated?.front_default || data.sprites.front_default || '/pokedex-app/assets/placeholder.png'}" 
                    alt="${data.name}" 
                    class="pokemon-sprite clickable-sprite"
                    style="image-rendering: pixelated;"
                    data-pokemon='${JSON.stringify({
            description,
            statsHtml,
            defensiveHtml,
            name: data.name,
            speciesUrl: data.species.url
        })}'>
                <button id="toggle-shiny" style="position: absolute; bottom: -10px; right: -10px; background: linear-gradient(135deg, #ffcb05, #e52d27); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: transform 0.2s;" title="Ver forma shiny">✨</button>
            </div>
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

        // Toggle shiny
        const shinyBtn = detailsDiv.querySelector('#toggle-shiny');
        const spriteImg = detailsDiv.querySelector('.pokemon-sprite');
        let isShiny = false;
        
        if (shinyBtn && spriteImg) {
            shinyBtn.addEventListener('click', () => {
                isShiny = !isShiny;
                if (isShiny) {
                    spriteImg.src = data.sprites.versions['generation-v']['black-white'].animated?.front_shiny || 
                                   data.sprites.front_shiny || 
                                   data.sprites.front_default;
                    shinyBtn.textContent = '⭐';
                    shinyBtn.style.transform = 'scale(1.2) rotate(360deg)';
                } else {
                    spriteImg.src = data.sprites.versions['generation-v']['black-white'].animated?.front_default || 
                                   data.sprites.front_default;
                    shinyBtn.textContent = '✨';
                    shinyBtn.style.transform = 'scale(1)';
                }
                setTimeout(() => {
                    shinyBtn.style.transform = 'scale(1)';
                }, 300);
            });
            
            shinyBtn.addEventListener('mouseenter', () => {
                shinyBtn.style.transform = 'scale(1.15) rotate(20deg)';
            });
            
            shinyBtn.addEventListener('mouseleave', () => {
                if (!isShiny) shinyBtn.style.transform = 'scale(1)';
            });
        }

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
                    
                    <div style="margin-top: 1.5rem;">
                        <button id="load-moves-btn" style="background: linear-gradient(90deg, #3b4cca, #e52d27); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 3px 10px rgba(59,76,202,0.3);">
                            📚 Ver Movimientos
                        </button>
                    </div>
                    <div id="moves-section" style="display: none; margin-top: 1.5rem;"></div>
                `;
                extendedDetails.style.display = 'block';
                sprite.title = 'Clic para ocultar detalles';
                
                // Event listener para cargar movimientos
                const loadMovesBtn = document.getElementById('load-moves-btn');
                if (loadMovesBtn) {
                    loadMovesBtn.addEventListener('click', async () => {
                        await loadPokemonMoves(data);
                        loadMovesBtn.style.display = 'none';
                    });
                }
            }
        });

        document.getElementById('pokemon-details').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
        document.getElementById('details').innerHTML = '<p>No se pudieron cargar los detalles.</p>';
    }
}

// === SISTEMA DE MOVIMIENTOS ===
async function loadPokemonMoves(pokemonData) {
    const movesSection = document.getElementById('moves-section');
    if (!movesSection) return;
    
    movesSection.innerHTML = '<div class="loading-spinner"></div>';
    movesSection.style.display = 'block';
    
    try {
        // Limitar a los primeros 20 movimientos para rendimiento
        const movesToLoad = pokemonData.moves.slice(0, 20);
        
        const movesDetails = await Promise.all(
            movesToLoad.map(async (moveEntry) => {
                try {
                    const response = await fetch(moveEntry.move.url);
                    const moveData = await response.json();
                    
                    // Obtener método de aprendizaje
                    const learnMethod = moveEntry.version_group_details[0];
                    const methodName = learnMethod.move_learn_method.name;
                    const level = learnMethod.level_learned_at;
                    
                    let learnMethodText = '';
                    switch(methodName) {
                        case 'level-up':
                            learnMethodText = `Nivel ${level}`;
                            break;
                        case 'machine':
                            learnMethodText = 'MT/MO';
                            break;
                        case 'egg':
                            learnMethodText = 'Huevo';
                            break;
                        case 'tutor':
                            learnMethodText = 'Tutor';
                            break;
                        default:
                            learnMethodText = methodName;
                    }
                    
                    return {
                        name: moveData.name,
                        displayName: moveData.name.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        type: moveData.type.name,
                        power: moveData.power || '-',
                        accuracy: moveData.accuracy || '-',
                        pp: moveData.pp || '-',
                        damageClass: moveData.damage_class.name,
                        learnMethod: learnMethodText,
                        effect: moveData.effect_entries.find(e => e.language.name === 'en')?.short_effect || 'No disponible'
                    };
                } catch (error) {
                    console.error(`Error cargando movimiento ${moveEntry.move.name}:`, error);
                    return null;
                }
            })
        );
        
        const validMoves = movesDetails.filter(m => m !== null);
        
        if (validMoves.length === 0) {
            movesSection.innerHTML = '<p>No se pudieron cargar los movimientos.</p>';
            return;
        }
        
        // Ordenar por método de aprendizaje
        validMoves.sort((a, b) => {
            if (a.learnMethod.includes('Nivel') && b.learnMethod.includes('Nivel')) {
                const levelA = parseInt(a.learnMethod.match(/\d+/)?.[0] || 0);
                const levelB = parseInt(b.learnMethod.match(/\d+/)?.[0] || 0);
                return levelA - levelB;
            }
            return a.learnMethod.localeCompare(b.learnMethod);
        });
        
        let movesHtml = `
            <h4>Movimientos (${validMoves.length} de ${pokemonData.moves.length} totales)</h4>
            <div class="moves-filter-container">
                <input type="text" 
                    id="move-search" 
                    placeholder="Buscar movimiento..." 
                    class="filter-input-small"
                    style="width: 200px; margin-bottom: 1rem;">
                <select id="move-type-filter" class="filter-select" style="margin-left: 0.5rem;">
                    <option value="">Todos los tipos</option>
                    <option value="normal">Normal</option>
                    <option value="fire">Fuego</option>
                    <option value="water">Agua</option>
                    <option value="electric">Eléctrico</option>
                    <option value="grass">Planta</option>
                    <option value="ice">Hielo</option>
                    <option value="fighting">Lucha</option>
                    <option value="poison">Veneno</option>
                    <option value="ground">Tierra</option>
                    <option value="flying">Volador</option>
                    <option value="psychic">Psíquico</option>
                    <option value="bug">Bicho</option>
                    <option value="rock">Roca</option>
                    <option value="ghost">Fantasma</option>
                    <option value="dragon">Dragón</option>
                    <option value="dark">Siniestro</option>
                    <option value="steel">Acero</option>
                    <option value="fairy">Hada</option>
                </select>
            </div>
            <div class="moves-table-container">
                <table class="moves-table">
                    <thead>
                        <tr>
                            <th>Movimiento</th>
                            <th>Tipo</th>
                            <th>Categoría</th>
                            <th>Poder</th>
                            <th>Precisión</th>
                            <th>PP</th>
                            <th>Aprendizaje</th>
                        </tr>
                    </thead>
                    <tbody id="moves-table-body">
                        ${validMoves.map(move => `
                            <tr class="move-row" data-move-name="${move.displayName.toLowerCase()}" data-move-type="${move.type}">
                                <td><strong>${move.displayName}</strong></td>
                                <td><img src="pokedex-app/assets/types/${move.type}.png" alt="${move.type}" class="type-icon" title="${move.type}"></td>
                                <td><span class="damage-class ${move.damageClass}">${getDamageClassName(move.damageClass)}</span></td>
                                <td>${move.power}</td>
                                <td>${move.accuracy === '-' ? '-' : move.accuracy + '%'}</td>
                                <td>${move.pp}</td>
                                <td><span class="learn-method">${move.learnMethod}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        movesSection.innerHTML = movesHtml;
        
        // Añadir filtros
        const moveSearch = document.getElementById('move-search');
        const moveTypeFilter = document.getElementById('move-type-filter');
        
        const filterMoves = () => {
            const searchTerm = moveSearch.value.toLowerCase();
            const selectedType = moveTypeFilter.value;
            
            document.querySelectorAll('.move-row').forEach(row => {
                const moveName = row.dataset.moveName;
                const moveType = row.dataset.moveType;
                
                const matchesSearch = moveName.includes(searchTerm);
                const matchesType = !selectedType || moveType === selectedType;
                
                row.style.display = (matchesSearch && matchesType) ? '' : 'none';
            });
        };
        
        moveSearch.addEventListener('input', debounce(filterMoves, 200));
        moveTypeFilter.addEventListener('change', filterMoves);
        
    } catch (error) {
        console.error('Error cargando movimientos:', error);
        movesSection.innerHTML = '<p>Error al cargar movimientos.</p>';
    }
}

function getDamageClassName(damageClass) {
    const names = {
        'physical': 'Físico',
        'special': 'Especial',
        'status': 'Estado'
    };
    return names[damageClass] || damageClass;
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

        // Obtener detalles guardados del favorito
        const details = favoritesDetails[data.name] || { rating: 0, tags: [], notes: '' };

        // Usar sprite animado si está disponible
        const animatedSprite = data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
        const pokemonSprite = animatedSprite || data.sprites.front_default || '/pokedex-app/assets/placeholder.png';

        card.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${pokemonSprite}" 
                alt="${data.name}" class="pokemon-sprite animated-sprite">
            <p><strong>ID:</strong> #${data.id}</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <div class="stats">${statsHtml}</div>
            ${defensiveHtml}
            <p class="description">${description}</p>
            
            <!-- Sistema de calificación -->
            <div class="star-rating" data-pokemon="${data.name}">
                <span class="star ${details.rating >= 1 ? 'active' : ''}" data-rating="1">★</span>
                <span class="star ${details.rating >= 2 ? 'active' : ''}" data-rating="2">★</span>
                <span class="star ${details.rating >= 3 ? 'active' : ''}" data-rating="3">★</span>
                <span class="star ${details.rating >= 4 ? 'active' : ''}" data-rating="4">★</span>
                <span class="star ${details.rating >= 5 ? 'active' : ''}" data-rating="5">★</span>
            </div>
            
            <!-- Tags personalizados -->
            <div class="favorite-tags">
                <input type="text" 
                    class="tag-input" 
                    placeholder="Agregar tag..." 
                    data-pokemon="${data.name}">
                <div class="tags-container">
                    ${details.tags.map(tag => 
                        `<span class="tag">${tag} <button class="remove-tag" data-tag="${tag}" data-pokemon="${data.name}">×</button></span>`
                    ).join('')}
                </div>
            </div>
            
            <!-- Notas personales -->
            <div class="favorite-notes">
                <textarea 
                    class="notes-input" 
                    placeholder="Escribe tus notas..."
                    data-pokemon="${data.name}">${details.notes}</textarea>
                <button class="save-notes" data-pokemon="${data.name}">Guardar notas</button>
            </div>
            
            <button class="remove-favorite" data-name="${data.name}">Eliminar de favoritos</button>
        `;

        // Event listeners para estrellas
        const stars = card.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                saveFavoriteRating(data.name, rating);
                updateStarDisplay(card, rating);
            });
        });

        // Event listener para tags
        const tagInput = card.querySelector('.tag-input');
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && tagInput.value.trim()) {
                addFavoriteTag(data.name, tagInput.value.trim());
                tagInput.value = '';
                loadFavoritesView();
            }
        });

        // Event listeners para remover tags
        const removeTags = card.querySelectorAll('.remove-tag');
        removeTags.forEach(btn => {
            btn.addEventListener('click', () => {
                removeFavoriteTag(data.name, btn.dataset.tag);
                loadFavoritesView();
            });
        });

        // Event listener para notas
        const saveNotesBtn = card.querySelector('.save-notes');
        saveNotesBtn.addEventListener('click', () => {
            const notesInput = card.querySelector('.notes-input');
            saveFavoriteNotes(data.name, notesInput.value);
        });

        const removeBtn = card.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', () => {
            favorites = favorites.filter(fav => fav.name !== data.name);
            delete favoritesDetails[data.name];
            saveFavorites();
            saveFavoritesDetails();
            loadFavoritesView();
        });

    } catch (error) {
        card.innerHTML = `<p>Error al cargar ${pokemonData.name}</p>`;
        console.error('Error en favorito:', error);
    }

    return card;
}

// Funciones auxiliares para favoritos
function saveFavoriteRating(pokemonName, rating) {
    if (!favoritesDetails[pokemonName]) {
        favoritesDetails[pokemonName] = { rating: 0, tags: [], notes: '' };
    }
    favoritesDetails[pokemonName].rating = rating;
    saveFavoritesDetails();
}

function addFavoriteTag(pokemonName, tag) {
    if (!favoritesDetails[pokemonName]) {
        favoritesDetails[pokemonName] = { rating: 0, tags: [], notes: '' };
    }
    if (!favoritesDetails[pokemonName].tags.includes(tag)) {
        favoritesDetails[pokemonName].tags.push(tag);
        saveFavoritesDetails();
    }
}

function removeFavoriteTag(pokemonName, tag) {
    if (favoritesDetails[pokemonName]) {
        favoritesDetails[pokemonName].tags = favoritesDetails[pokemonName].tags.filter(t => t !== tag);
        saveFavoritesDetails();
    }
}

function saveFavoriteNotes(pokemonName, notes) {
    if (!favoritesDetails[pokemonName]) {
        favoritesDetails[pokemonName] = { rating: 0, tags: [], notes: '' };
    }
    favoritesDetails[pokemonName].notes = notes;
    saveFavoritesDetails();
    
    // Mostrar feedback visual
    const btn = document.querySelector(`.save-notes[data-pokemon="${pokemonName}"]`);
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Guardado';
        btn.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }
}

function updateStarDisplay(card, rating) {
    const stars = card.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function saveFavoritesDetails() {
    localStorage.setItem('pokemon-favorites-details', JSON.stringify(favoritesDetails));
}

async function loadFavoritesView() {
    const container = document.getElementById('favorites-items');
    container.innerHTML = '';

    if (favorites.length === 0) {
        container.innerHTML = '<p class="no-results">No tienes Pokémon favoritos aún.</p>';
        return;
    }

    // Obtener filtros
    const tagFilter = document.getElementById('filter-tags')?.value.toLowerCase() || '';
    const ratingFilter = parseInt(document.getElementById('filter-rating')?.value || '0');
    const sortOption = document.getElementById('sort-favorites')?.value || 'default';

    // Filtrar favoritos
    let filteredFavorites = favorites.filter(fav => {
        const details = favoritesDetails[fav.name] || { rating: 0, tags: [], notes: '' };
        
        // Filtrar por rating
        if (ratingFilter > 0 && details.rating < ratingFilter) {
            return false;
        }
        
        // Filtrar por tags
        if (tagFilter && !details.tags.some(tag => tag.toLowerCase().includes(tagFilter))) {
            return false;
        }
        
        return true;
    });

    // Ordenar favoritos
    filteredFavorites.sort((a, b) => {
        const detailsA = favoritesDetails[a.name] || { rating: 0, tags: [], notes: '' };
        const detailsB = favoritesDetails[b.name] || { rating: 0, tags: [], notes: '' };
        
        switch (sortOption) {
            case 'rating-desc':
                return detailsB.rating - detailsA.rating;
            case 'rating-asc':
                return detailsA.rating - detailsB.rating;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    if (filteredFavorites.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron favoritos con esos filtros.</p>';
        return;
    }

    const cards = await Promise.all(filteredFavorites.map(createFavoriteCard));
    cards.forEach(card => container.appendChild(card));
}

// Inicializar filtros de favoritos
function initializeFavoritesFilters() {
    const filterTags = document.getElementById('filter-tags');
    const filterRating = document.getElementById('filter-rating');
    const sortFavorites = document.getElementById('sort-favorites');

    if (filterTags) {
        filterTags.addEventListener('input', debounce(loadFavoritesView, 300));
    }
    if (filterRating) {
        filterRating.addEventListener('change', loadFavoritesView);
    }
    if (sortFavorites) {
        sortFavorites.addEventListener('change', loadFavoritesView);
    }
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

// === FILTROS Y SCROLL TO TOP ===
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Filtro por tipo (usar API de tipos para mejor rendimiento)
    if (typeFilter && typeFilter.value) {
        const selectedType = typeFilter.value;
        const container = document.getElementById('pokemon-items');
        showLoading(container);
        
        try {
            // Usar la API de tipos que devuelve todos los Pokémon de ese tipo
            const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
            const typeData = await typeResponse.json();
            
            // Extraer los nombres de Pokémon de ese tipo
            const pokemonOfType = typeData.pokemon.map(p => p.pokemon.name);
            
            // Filtrar la lista actual por los Pokémon de ese tipo
            filtered = filtered.filter(p => pokemonOfType.includes(p.name));
        } catch (error) {
            console.error('Error applying type filter:', error);
            showError(container, 'Error al filtrar por tipo. Inténtalo de nuevo.');
        }
    }
    
    currentPage = 1;
    displayPokemon(filtered);
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar favoritos si estamos en la página de favoritos
    if (window.location.pathname.includes('favorites.html')) {
        initializeFavoritesFilters();
    }
    
    // Inicializar filtros avanzados
    initializeAdvancedFilters();
});

// === FILTROS AVANZADOS ===
let advancedFiltersVisible = false;
let advancedFiltersApplied = {
    minAttack: 0,
    minDefense: 0,
    minHP: 0,
    minSpeed: 0,
    ability: '',
    color: '',
    habitat: '',
    maxWeight: null,
    maxHeight: null
};

function initializeAdvancedFilters() {
    const toggleBtn = document.getElementById('toggle-advanced-filters');
    const advancedDiv = document.getElementById('advanced-filters');
    const applyBtn = document.getElementById('apply-advanced-filters');
    const clearBtn = document.getElementById('clear-advanced-filters');
    
    // Actualizar valores de sliders en tiempo real
    const sliders = [
        { slider: 'min-attack', display: 'attack-value' },
        { slider: 'min-defense', display: 'defense-value' },
        { slider: 'min-hp', display: 'hp-value' },
        { slider: 'min-speed', display: 'speed-value' }
    ];
    
    sliders.forEach(({ slider, display }) => {
        const sliderEl = document.getElementById(slider);
        const displayEl = document.getElementById(display);
        if (sliderEl && displayEl) {
            sliderEl.addEventListener('input', () => {
                displayEl.textContent = sliderEl.value;
            });
        }
    });
    
    // Toggle visibilidad
    if (toggleBtn && advancedDiv) {
        toggleBtn.addEventListener('click', () => {
            advancedFiltersVisible = !advancedFiltersVisible;
            advancedDiv.style.display = advancedFiltersVisible ? 'block' : 'none';
            toggleBtn.textContent = advancedFiltersVisible ? '🔍 Ocultar Filtros' : '🔍 Filtros Avanzados';
        });
    }
    
    // Aplicar filtros
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            applyAdvancedFilters();
        });
    }
    
    // Limpiar filtros
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearAdvancedFilters();
        });
    }
}

async function applyAdvancedFilters() {
    // Recopilar valores de filtros
    advancedFiltersApplied = {
        minAttack: parseInt(document.getElementById('min-attack')?.value || 0),
        minDefense: parseInt(document.getElementById('min-defense')?.value || 0),
        minHP: parseInt(document.getElementById('min-hp')?.value || 0),
        minSpeed: parseInt(document.getElementById('min-speed')?.value || 0),
        ability: document.getElementById('ability-filter')?.value.toLowerCase().trim() || '',
        color: document.getElementById('color-filter')?.value || '',
        habitat: document.getElementById('habitat-filter')?.value || '',
        maxWeight: parseFloat(document.getElementById('max-weight')?.value || null),
        maxHeight: parseFloat(document.getElementById('max-height')?.value || null)
    };
    
    const container = document.getElementById('pokemon-items');
    if (!container) return;
    
    showLoading(container);
    
    // Filtrar con los filtros existentes primero
    let filtered = allPokemon;
    
    // Aplicar filtros básicos
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedType = document.getElementById('type-filter')?.value || '';
    const selectedGen = document.getElementById('gen-filter')?.value || '';
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.includes(searchTerm));
    }
    
    // Filtrar con filtros avanzados (requiere fetch de cada Pokémon)
    const detailedFilter = await Promise.all(
        filtered.slice(0, 200).map(async (pokemon) => { // Limitar a 200 para rendimiento
            try {
                const response = await fetch(pokemon.url);
                const data = await response.json();
                
                // Verificar estadísticas
                const stats = {
                    attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
                    defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
                    hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
                    speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
                };
                
                if (stats.attack < advancedFiltersApplied.minAttack) return null;
                if (stats.defense < advancedFiltersApplied.minDefense) return null;
                if (stats.hp < advancedFiltersApplied.minHP) return null;
                if (stats.speed < advancedFiltersApplied.minSpeed) return null;
                
                // Verificar peso y altura
                if (advancedFiltersApplied.maxWeight && (data.weight / 10) > advancedFiltersApplied.maxWeight) return null;
                if (advancedFiltersApplied.maxHeight && (data.height / 10) > advancedFiltersApplied.maxHeight) return null;
                
                // Verificar tipo
                if (selectedType && !data.types.some(t => t.type.name === selectedType)) return null;
                
                // Verificar generación
                if (selectedGen) {
                    const genRanges = {
                        '1': [1, 151], '2': [152, 251], '3': [252, 386],
                        '4': [387, 493], '5': [494, 649], '6': [650, 721],
                        '7': [722, 809], '8': [810, 905]
                    };
                    const [min, max] = genRanges[selectedGen];
                    if (data.id < min || data.id > max) return null;
                }
                
                // Verificar habilidad
                if (advancedFiltersApplied.ability) {
                    const hasAbility = data.abilities.some(a => 
                        a.ability.name.toLowerCase().includes(advancedFiltersApplied.ability)
                    );
                    if (!hasAbility) return null;
                }
                
                // Verificar color y hábitat (requiere species data)
                if (advancedFiltersApplied.color || advancedFiltersApplied.habitat) {
                    const speciesResponse = await fetch(data.species.url);
                    const speciesData = await speciesResponse.json();
                    
                    if (advancedFiltersApplied.color && speciesData.color.name !== advancedFiltersApplied.color) {
                        return null;
                    }
                    
                    if (advancedFiltersApplied.habitat && speciesData.habitat?.name !== advancedFiltersApplied.habitat) {
                        return null;
                    }
                }
                
                return pokemon;
            } catch (error) {
                console.error(`Error filtrando ${pokemon.name}:`, error);
                return null;
            }
        })
    );
    
    const filteredResults = detailedFilter.filter(p => p !== null);
    
    currentPage = 1;
    displayPokemon(filteredResults);
    
    // Mostrar mensaje con resultados
    if (filteredResults.length === 0) {
        container.innerHTML = '<p class="no-results" style="text-align: center; color: #999; padding: 2rem;">No se encontraron Pokémon con esos filtros avanzados. Intenta ajustar los criterios.</p>';
    }
}

function clearAdvancedFilters() {
    // Resetear valores
    document.getElementById('min-attack').value = 0;
    document.getElementById('min-defense').value = 0;
    document.getElementById('min-hp').value = 0;
    document.getElementById('min-speed').value = 0;
    document.getElementById('attack-value').textContent = '0';
    document.getElementById('defense-value').textContent = '0';
    document.getElementById('hp-value').textContent = '0';
    document.getElementById('speed-value').textContent = '0';
    document.getElementById('ability-filter').value = '';
    document.getElementById('color-filter').value = '';
    document.getElementById('habitat-filter').value = '';
    document.getElementById('max-weight').value = '';
    document.getElementById('max-height').value = '';
    
    advancedFiltersApplied = {
        minAttack: 0,
        minDefense: 0,
        minHP: 0,
        minSpeed: 0,
        ability: '',
        color: '',
        habitat: '',
        maxWeight: null,
        maxHeight: null
    };
    
    // Recargar lista completa
    displayPokemon(allPokemon);
}