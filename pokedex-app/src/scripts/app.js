const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1025';

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemonData();
});

let allPokemon = [];

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
    const card = document.createElement('div');
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

        const detailsDiv = document.getElementById('details');
        const typesHtml = data.types.map(t =>
            `<img src="${getTypeIcon(t.type.name)}" alt="${t.type.name}" title="${t.type.name}" class="type-icon">`
        ).join(' ');

        detailsDiv.innerHTML = `
            <h3>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h3>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Altura:</strong> ${data.height / 10} m</p>
            <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
            <p><strong>Tipo:</strong> ${typesHtml}</p>
        `;

        // Scroll automático a la sección de detalles
        document.getElementById('pokemon-details').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
    }
}

function getTypeIcon(typeName) {
    return `assets/types/${typeName}.png`;
}