// Comparador de Pokémon con Chart.js
let pokemon1Data = null;
let pokemon2Data = null;
let statsChart = null;

// Exponer variables y funciones para el sistema de idiomas
window.pokemon1Data = null;
window.pokemon2Data = null;

// Cargar tema
const currentTheme = localStorage.getItem('pokedex-theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Toggle tema
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.className = currentTheme === 'dark' ? 'theme-toggle sun-icon' : 'theme-toggle moon-icon';
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.className = isDark ? 'theme-toggle sun-icon' : 'theme-toggle moon-icon';
        localStorage.setItem('pokedex-theme', isDark ? 'dark' : 'light');
        
        // Actualizar gráfico
        if (statsChart) {
            updateChartTheme();
        }
    });
}

// Búsqueda con debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Buscar Pokémon
const searchPokemon = debounce(async (query, slotNumber) => {
    if (!query || query.length < 2) return;
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        if (response.ok) {
            const data = await response.json();
            await loadPokemonData(data, slotNumber);
        }
    } catch (error) {
        console.error('Error buscando Pokémon:', error);
    }
}, 500);

// Cargar Pokémon aleatorio
async function loadRandomPokemon(slotNumber) {
    const randomId = Math.floor(Math.random() * 898) + 1; // Gen 1-8
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        await loadPokemonData(data, slotNumber);
    } catch (error) {
        console.error('Error cargando Pokémon aleatorio:', error);
    }
}

// Cargar datos del Pokémon
async function loadPokemonData(data, slotNumber) {
    // Obtener especies para descripción
    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    
    // Usar sprite animado si está disponible
    const animatedSprite = data.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
    const officialArtwork = data.sprites.other?.['official-artwork']?.front_default;
    const pokemonSprite = animatedSprite || officialArtwork || data.sprites.front_default;
    
    const pokemonData = {
        id: data.id,
        name: data.name,
        sprite: pokemonSprite,
        types: data.types.map(t => t.type.name),
        stats: {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            'special-attack': data.stats[3].base_stat,
            'special-defense': data.stats[4].base_stat,
            speed: data.stats[5].base_stat
        },
        totalStats: data.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
        height: data.height / 10,
        weight: data.weight / 10,
        abilities: data.abilities.map(a => a.ability.name)
    };

    if (slotNumber === 1) {
        pokemon1Data = pokemonData;
        window.pokemon1Data = pokemonData;
        displaySelectedPokemon(pokemonData, 'selected1');
    } else {
        pokemon2Data = pokemonData;
        window.pokemon2Data = pokemonData;
        displaySelectedPokemon(pokemonData, 'selected2');
    }

    if (pokemon1Data && pokemon2Data) {
        displayComparison();
    }
}

// Mostrar Pokémon seleccionado
function displaySelectedPokemon(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <img src="${data.sprite}" alt="${data.name}" 
             style="width: 80px; height: 80px; image-rendering: pixelated; animation: pokemonPulse 2s ease-in-out infinite;">
        <p style="font-weight: bold; text-transform: capitalize; margin: 0.5rem 0;">${data.name}</p>
        <p style="color: #666; margin: 0;">Total: ${data.totalStats}</p>
    `;
}

// Mostrar comparación completa
function displayComparison() {
    const resultDiv = document.getElementById('comparison-result');
    resultDiv.style.display = 'block';

    // Panel 1
    const panel1 = document.getElementById('pokemon1-details');
    panel1.innerHTML = generatePokemonPanel(pokemon1Data);

    // Panel 2
    const panel2 = document.getElementById('pokemon2-details');
    panel2.innerHTML = generatePokemonPanel(pokemon2Data);

    // Determinar ganador por stats totales
    if (pokemon1Data.totalStats > pokemon2Data.totalStats) {
        document.getElementById('panel1').classList.add('winner');
        document.getElementById('panel2').classList.remove('winner');
    } else if (pokemon2Data.totalStats > pokemon1Data.totalStats) {
        document.getElementById('panel2').classList.add('winner');
        document.getElementById('panel1').classList.remove('winner');
    } else {
        document.getElementById('panel1').classList.remove('winner');
        document.getElementById('panel2').classList.remove('winner');
    }

    // Crear gráfico
    createStatsChart();

    // Análisis de enfrentamiento
    displayMatchupAnalysis();

    // Scroll suave
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generar panel de Pokémon
function generatePokemonPanel(data) {
    const typesHtml = data.types.map(type => 
        `<img src="pokedex-app/assets/types/${type}.png" alt="${type}" class="type-icon" style="width: 28px; height: 28px;">`
    ).join('');

    const winner = (pokemon1Data && pokemon2Data && 
                   ((data === pokemon1Data && pokemon1Data.totalStats > pokemon2Data.totalStats) ||
                    (data === pokemon2Data && pokemon2Data.totalStats > pokemon1Data.totalStats)));

    return `
        <h3 style="color: #e52d27; text-transform: capitalize; margin-top: 0;">${data.name} #${data.id}</h3>
        ${winner ? '<span class="winner-badge">🏆 Ganador</span>' : ''}
        <img src="${data.sprite}" alt="${data.name}">
        <div style="margin: 1rem 0;">
            <strong>Tipos:</strong><br>${typesHtml}
        </div>
        <div class="total-stats">Total Stats: ${data.totalStats}</div>
        <div class="stat-comparison">
            ${Object.entries(data.stats).map(([stat, value]) => {
                const otherData = data === pokemon1Data ? pokemon2Data : pokemon1Data;
                const isHigher = value > otherData.stats[stat];
                return `
                    <div class="stat-row">
                        <span class="stat-name">${getStatName(stat)}</span>
                        <span class="stat-value ${isHigher ? 'higher' : ''}">${value}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top: 1rem;">
            <strong data-i18n="label_height">Altura:</strong> ${data.height}m<br>
            <strong data-i18n="label_weight">Peso:</strong> ${data.weight}kg
        </div>
    `;
}

// Crear gráfico de estadísticas
function createStatsChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (statsChart) {
        statsChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#fff' : '#333';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    statsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [t('label_hp'), t('label_attack'), t('label_defense'), t('label_special_attack'), t('label_special_defense'), t('label_speed')],
            datasets: [
                {
                    label: pokemon1Data.name,
                    data: Object.values(pokemon1Data.stats),
                    backgroundColor: 'rgba(59, 76, 202, 0.2)',
                    borderColor: '#3b4cca',
                    borderWidth: 2,
                    pointBackgroundColor: '#3b4cca',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3b4cca'
                },
                {
                    label: pokemon2Data.name,
                    data: Object.values(pokemon2Data.stats),
                    backgroundColor: 'rgba(229, 45, 39, 0.2)',
                    borderColor: '#e52d27',
                    borderWidth: 2,
                    pointBackgroundColor: '#e52d27',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#e52d27'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 255,
                    ticks: {
                        stepSize: 50,
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    },
                    pointLabels: {
                        color: textColor,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        textTransform: 'capitalize'
                    }
                }
            }
        }
    });
}

// Exponer función para el sistema de idiomas
window.createStatsChart = createStatsChart;

// Actualizar tema del gráfico
function updateChartTheme() {
    if (statsChart) {
        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#fff' : '#333';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        
        statsChart.options.scales.r.ticks.color = textColor;
        statsChart.options.scales.r.grid.color = gridColor;
        statsChart.options.scales.r.pointLabels.color = textColor;
        statsChart.options.plugins.legend.labels.color = textColor;
        statsChart.update();
    }
}

// Análisis de enfrentamiento (efectividad de tipos)
function displayMatchupAnalysis() {
    const container = document.getElementById('matchup-analysis');
    
    const effectiveness1vs2 = calculateTypeEffectiveness(pokemon1Data.types, pokemon2Data.types);
    const effectiveness2vs1 = calculateTypeEffectiveness(pokemon2Data.types, pokemon1Data.types);

    container.innerHTML = `
        <div class="advantage-analysis">
            <h3 style="text-align: center; color: #e52d27;" data-i18n="compare_matchup">Análisis de Enfrentamiento</h3>
            
            <div class="advantage-section">
                <h4>${pokemon1Data.name.toUpperCase()} vs ${pokemon2Data.name.toUpperCase()}</h4>
                <p><strong data-i18n="compare_damage_multiplier">Multiplicador de daño:</strong> ${effectiveness1vs2}x</p>
                ${getEffectivenessDescription(effectiveness1vs2, pokemon1Data.name, pokemon2Data.name)}
            </div>

            <div class="advantage-section">
                <h4>${pokemon2Data.name.toUpperCase()} vs ${pokemon1Data.name.toUpperCase()}</h4>
                <p><strong data-i18n="compare_damage_multiplier">Multiplicador de daño:</strong> ${effectiveness2vs1}x</p>
                ${getEffectivenessDescription(effectiveness2vs1, pokemon2Data.name, pokemon1Data.name)}
            </div>

            <div class="advantage-section">
                <h4 data-i18n="compare_conclusion">Conclusión</h4>
                ${getMatchupConclusion(effectiveness1vs2, effectiveness2vs1)}
            </div>
        </div>
    `;
    
    // Aplicar traducciones a los elementos recién creados
    if (typeof setLanguage === 'function') {
        const currentLang = localStorage.getItem('pokedex-language') || 'es';
        setLanguage(currentLang);
    }
}

// Exponer función para el sistema de idiomas
window.displayMatchupAnalysis = displayMatchupAnalysis;

// Calcular efectividad de tipos (ataque vs defensa)
function calculateTypeEffectiveness(attackerTypes, defenderTypes) {
    const typeChart = getTypeChart();
    let maxMultiplier = 0;

    // Calcular la mejor efectividad entre todos los tipos del atacante
    attackerTypes.forEach(atkType => {
        let currentMultiplier = 1;
        
        // Multiplicar por la efectividad contra cada tipo del defensor
        defenderTypes.forEach(defType => {
            if (typeChart[atkType] && typeChart[atkType][defType] !== undefined) {
                currentMultiplier *= typeChart[atkType][defType];
            }
        });
        
        // Guardar el mejor multiplicador
        if (currentMultiplier > maxMultiplier) {
            maxMultiplier = currentMultiplier;
        }
    });

    return maxMultiplier;
}

// Descripción de efectividad
function getEffectivenessDescription(multiplier, attacker, defender) {
    if (multiplier >= 2) {
        return `<p style="color: #4caf50; font-weight: bold;">${t('compare_super_effective').replace('{attacker}', attacker).replace('{defender}', defender)}</p>`;
    } else if (multiplier > 1) {
        return `<p style="color: #8bc34a;">${t('compare_effective').replace('{attacker}', attacker).replace('{defender}', defender)}</p>`;
    } else if (multiplier === 1) {
        return `<p style="color: #999;">${t('compare_neutral')}</p>`;
    } else if (multiplier > 0) {
        return `<p style="color: #ff9800;">${t('compare_not_effective').replace('{attacker}', attacker).replace('{defender}', defender)}</p>`;
    } else {
        return `<p style="color: #f44336; font-weight: bold;">${t('compare_no_effect').replace('{attacker}', attacker).replace('{defender}', defender)}</p>`;
    }
}

// Conclusión del matchup
function getMatchupConclusion(eff1, eff2) {
    if (eff1 > eff2) {
        return `<p style="font-weight: bold; color: #3b4cca;">${t('compare_advantage_1').replace('{pokemon1}', pokemon1Data.name)}</p>`;
    } else if (eff2 > eff1) {
        return `<p style="font-weight: bold; color: #e52d27;">${t('compare_advantage_2').replace('{pokemon2}', pokemon2Data.name)}</p>`;
    } else {
        return `<p style="font-weight: bold; color: #999;">${t('compare_balanced')}</p>`;
    }
}

// Nombres de stats usando el sistema de traducciones
function getStatName(stat) {
    const names = {
        hp: t('label_hp'),
        attack: t('label_attack'),
        defense: t('label_defense'),
        'special-attack': t('label_special_attack'),
        'special-defense': t('label_special_defense'),
        speed: t('label_speed')
    };
    return names[stat] || stat;
}

// Tabla de efectividad de tipos completa (Gen 1-9)
function getTypeChart() {
    return {
        normal: { 
            fighting: 2, 
            ghost: 0, 
            rock: 0.5, 
            steel: 0.5 
        },
        fire: { 
            fire: 0.5, 
            water: 0.5, 
            grass: 2, 
            ice: 2, 
            bug: 2, 
            rock: 0.5, 
            dragon: 0.5, 
            steel: 2,
            ground: 0.5
        },
        water: { 
            fire: 2, 
            water: 0.5, 
            grass: 0.5, 
            ground: 2, 
            rock: 2, 
            dragon: 0.5 
        },
        electric: { 
            water: 2, 
            electric: 0.5, 
            grass: 0.5, 
            ground: 0, 
            flying: 2, 
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
            steel: 0.5 
        },
        fighting: { 
            normal: 2, 
            ice: 2, 
            poison: 0.5, 
            flying: 0.5, 
            psychic: 0.5, 
            bug: 0.5, 
            rock: 2, 
            ghost: 0, 
            dark: 2, 
            steel: 2, 
            fairy: 0.5 
        },
        poison: { 
            grass: 2, 
            poison: 0.5, 
            ground: 0.5, 
            rock: 0.5, 
            ghost: 0.5, 
            steel: 0, 
            fairy: 2 
        },
        ground: { 
            fire: 2, 
            electric: 2, 
            grass: 0.5, 
            poison: 2, 
            flying: 0, 
            bug: 0.5, 
            rock: 2, 
            steel: 2 
        },
        flying: { 
            electric: 0.5, 
            grass: 2, 
            fighting: 2, 
            bug: 2, 
            rock: 0.5, 
            steel: 0.5 
        },
        psychic: { 
            fighting: 2, 
            poison: 2, 
            psychic: 0.5, 
            dark: 0, 
            steel: 0.5 
        },
        bug: { 
            fire: 0.5, 
            grass: 2, 
            fighting: 0.5, 
            poison: 0.5, 
            flying: 0.5, 
            psychic: 2, 
            ghost: 0.5, 
            dark: 2, 
            steel: 0.5, 
            fairy: 0.5 
        },
        rock: { 
            fire: 2, 
            ice: 2, 
            fighting: 0.5, 
            ground: 0.5, 
            flying: 2, 
            bug: 2, 
            steel: 0.5 
        },
        ghost: { 
            normal: 0, 
            psychic: 2, 
            ghost: 2, 
            dark: 0.5 
        },
        dragon: { 
            dragon: 2, 
            steel: 0.5, 
            fairy: 0 
        },
        dark: { 
            fighting: 0.5, 
            psychic: 2, 
            ghost: 2, 
            dark: 0.5, 
            fairy: 0.5 
        },
        steel: { 
            fire: 0.5, 
            water: 0.5, 
            electric: 0.5, 
            ice: 2, 
            rock: 2, 
            steel: 0.5, 
            fairy: 2 
        },
        fairy: { 
            fire: 0.5, 
            fighting: 2, 
            poison: 0.5, 
            dragon: 2, 
            dark: 2, 
            steel: 0.5 
        }
    };
}

// Event listeners
document.getElementById('search1').addEventListener('input', (e) => {
    searchPokemon(e.target.value, 1);
});

document.getElementById('search2').addEventListener('input', (e) => {
    searchPokemon(e.target.value, 2);
});

document.getElementById('random1').addEventListener('click', () => {
    loadRandomPokemon(1);
});

document.getElementById('random2').addEventListener('click', () => {
    loadRandomPokemon(2);
});
