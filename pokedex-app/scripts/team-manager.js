// Sistema mejorado de constructor de equipos con múltiples equipos

let savedTeams = JSON.parse(localStorage.getItem('pokemon-teams')) || {};
let currentTeamId = localStorage.getItem('current-team-id') || 'team-1';

// Asegurar que existe el equipo actual
if (!savedTeams[currentTeamId]) {
    savedTeams[currentTeamId] = {
        name: 'Equipo 1',
        pokemon: [],
        created: new Date().toISOString()
    };
    saveTeams();
}

// Guardar equipos en localStorage
function saveTeams() {
    localStorage.setItem('pokemon-teams', JSON.stringify(savedTeams));
}

// Crear nuevo equipo
function createNewTeam() {
    const teamCount = Object.keys(savedTeams).length + 1;
    const newTeamId = `team-${Date.now()}`;
    
    savedTeams[newTeamId] = {
        name: `Equipo ${teamCount}`,
        pokemon: [],
        created: new Date().toISOString()
    };
    
    currentTeamId = newTeamId;
    localStorage.setItem('current-team-id', currentTeamId);
    saveTeams();
    updateTeamSelector();
    loadCurrentTeam();
    showNotification('Nuevo equipo creado');
}

// Eliminar equipo
function deleteTeam(teamId) {
    if (Object.keys(savedTeams).length <= 1) {
        showNotification('No puedes eliminar el último equipo', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
        delete savedTeams[teamId];
        
        if (currentTeamId === teamId) {
            currentTeamId = Object.keys(savedTeams)[0];
            localStorage.setItem('current-team-id', currentTeamId);
        }
        
        saveTeams();
        updateTeamSelector();
        loadCurrentTeam();
        showNotification('Equipo eliminado');
    }
}

// Renombrar equipo
function renameTeam(teamId, newName) {
    if (savedTeams[teamId]) {
        savedTeams[teamId].name = newName;
        saveTeams();
        updateTeamSelector();
    }
}

// Cambiar equipo activo
function switchTeam(teamId) {
    if (savedTeams[teamId]) {
        currentTeamId = teamId;
        localStorage.setItem('current-team-id', currentTeamId);
        loadCurrentTeam();
    }
}

// Actualizar selector de equipos
function updateTeamSelector() {
    const selector = document.getElementById('team-selector');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    Object.entries(savedTeams).forEach(([teamId, team]) => {
        const option = document.createElement('option');
        option.value = teamId;
        option.textContent = `${team.name} (${team.pokemon.length}/6)`;
        option.selected = teamId === currentTeamId;
        selector.appendChild(option);
    });
}

// Cargar equipo actual
function loadCurrentTeam() {
    const team = savedTeams[currentTeamId];
    if (!team) return;
    
    // Actualizar nombre del equipo
    const teamNameEl = document.getElementById('current-team-name');
    if (teamNameEl) {
        teamNameEl.textContent = team.name;
    }
    
    // Renderizar slots del equipo
    renderTeamSlots(team.pokemon);
    
    // Actualizar análisis
    updateTeamAnalysis(team.pokemon);
}

// Renderizar slots del equipo
function renderTeamSlots(pokemon) {
    const container = document.getElementById('team-slots-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const slot = document.createElement('div');
        slot.className = 'team-slot';
        slot.dataset.index = i;
        
        if (pokemon[i]) {
            const poke = pokemon[i];
            slot.innerHTML = `
                <img src="${poke.sprite}" alt="${poke.name}" class="slot-sprite">
                <div class="slot-name">${poke.name}</div>
                <div class="slot-types">
                    ${poke.types.map(t => `<img src="pokedex-app/assets/types/${t}.png" alt="${t}" class="type-icon-small">`).join('')}
                </div>
                <button class="remove-from-team" onclick="removePokemonFromTeam(${i})">×</button>
            `;
        } else {
            slot.innerHTML = `
                <div class="empty-slot">
                    <div class="empty-icon">+</div>
                    <div>Vacío</div>
                </div>
            `;
        }
        
        container.appendChild(slot);
    }
}

// Agregar Pokémon al equipo
function addPokemonToTeam(pokemonData) {
    const team = savedTeams[currentTeamId];
    
    if (team.pokemon.length >= 6) {
        showNotification('El equipo ya está completo (máx. 6)', 'warning');
        return;
    }
    
    // Verificar si ya existe en el equipo
    if (team.pokemon.some(p => p.name === pokemonData.name)) {
        showNotification('Este Pokémon ya está en el equipo', 'warning');
        return;
    }
    
    team.pokemon.push({
        name: pokemonData.name,
        sprite: pokemonData.sprite,
        types: pokemonData.types,
        stats: pokemonData.stats
    });
    
    saveTeams();
    loadCurrentTeam();
    showNotification(`${pokemonData.name} agregado al equipo`);
}

// Remover Pokémon del equipo
function removePokemonFromTeam(index) {
    const team = savedTeams[currentTeamId];
    team.pokemon.splice(index, 1);
    saveTeams();
    loadCurrentTeam();
    showNotification('Pokémon eliminado del equipo');
}

// Análisis del equipo
function updateTeamAnalysis(pokemon) {
    if (pokemon.length === 0) {
        document.getElementById('team-analysis').innerHTML = '<p>Agrega Pokémon a tu equipo para ver el análisis.</p>';
        return;
    }
    
    // Cobertura de tipos ofensiva
    const offensiveCoverage = calculateOffensiveCoverage(pokemon);
    
    // Cobertura de tipos defensiva
    const defensiveCoverage = calculateDefensiveCoverage(pokemon);
    
    // Estadísticas promedio
    const avgStats = calculateAverageStats(pokemon);
    
    // Sugerencias
    const suggestions = generateTeamSuggestions(pokemon, defensiveCoverage);
    
    const analysisHtml = `
        <div class="analysis-section">
            <h3>📊 Estadísticas Promedio</h3>
            <div class="stats-bars">
                <div class="stat-bar">
                    <span>HP: ${avgStats.hp}</span>
                    <div class="bar"><div class="fill" style="width: ${(avgStats.hp/255)*100}%; background: #FF5959;"></div></div>
                </div>
                <div class="stat-bar">
                    <span>Ataque: ${avgStats.attack}</span>
                    <div class="bar"><div class="fill" style="width: ${(avgStats.attack/255)*100}%; background: #F5AC78;"></div></div>
                </div>
                <div class="stat-bar">
                    <span>Defensa: ${avgStats.defense}</span>
                    <div class="bar"><div class="fill" style="width: ${(avgStats.defense/255)*100}%; background: #FAE078;"></div></div>
                </div>
                <div class="stat-bar">
                    <span>Velocidad: ${avgStats.speed}</span>
                    <div class="bar"><div class="fill" style="width: ${(avgStats.speed/255)*100}%; background: #9DB7F5;"></div></div>
                </div>
            </div>
        </div>
        
        <div class="analysis-section">
            <h3>🛡️ Debilidades del Equipo</h3>
            <div class="weakness-grid">
                ${Object.entries(defensiveCoverage)
                    .filter(([type, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => `
                        <div class="weakness-item ${count >= 3 ? 'critical' : count >= 2 ? 'high' : 'medium'}">
                            <img src="pokedex-app/assets/types/${type}.png" alt="${type}" class="type-icon">
                            <span>×${count}</span>
                        </div>
                    `).join('')}
            </div>
        </div>
        
        <div class="analysis-section">
            <h3>💡 Sugerencias</h3>
            <ul class="suggestions-list">
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
    `;
    
    document.getElementById('team-analysis').innerHTML = analysisHtml;
}

function calculateOffensiveCoverage(pokemon) {
    const coverage = {};
    pokemon.forEach(p => {
        p.types.forEach(type => {
            coverage[type] = (coverage[type] || 0) + 1;
        });
    });
    return coverage;
}

function calculateDefensiveCoverage(pokemon) {
    const weaknesses = {};
    
    pokemon.forEach(p => {
        const pokeWeaknesses = getTypeWeaknesses(p.types);
        pokeWeaknesses.forEach(type => {
            weaknesses[type] = (weaknesses[type] || 0) + 1;
        });
    });
    
    return weaknesses;
}

function getTypeWeaknesses(types) {
    // Implementación simplificada - debería usar la tabla completa de tipos
    const weaknessMap = {
        'normal': ['fighting'],
        'fire': ['water', 'ground', 'rock'],
        'water': ['electric', 'grass'],
        'electric': ['ground'],
        'grass': ['fire', 'ice', 'poison', 'flying', 'bug'],
        'ice': ['fire', 'fighting', 'rock', 'steel'],
        'fighting': ['flying', 'psychic', 'fairy'],
        'poison': ['ground', 'psychic'],
        'ground': ['water', 'grass', 'ice'],
        'flying': ['electric', 'ice', 'rock'],
        'psychic': ['bug', 'ghost', 'dark'],
        'bug': ['fire', 'flying', 'rock'],
        'rock': ['water', 'grass', 'fighting', 'ground', 'steel'],
        'ghost': ['ghost', 'dark'],
        'dragon': ['ice', 'dragon', 'fairy'],
        'dark': ['fighting', 'bug', 'fairy'],
        'steel': ['fire', 'fighting', 'ground'],
        'fairy': ['poison', 'steel']
    };
    
    let allWeaknesses = [];
    types.forEach(type => {
        if (weaknessMap[type]) {
            allWeaknesses = allWeaknesses.concat(weaknessMap[type]);
        }
    });
    
    return [...new Set(allWeaknesses)];
}

function calculateAverageStats(pokemon) {
    const totals = { hp: 0, attack: 0, defense: 0, speed: 0 };
    
    pokemon.forEach(p => {
        if (p.stats) {
            totals.hp += p.stats.hp || 0;
            totals.attack += p.stats.attack || 0;
            totals.defense += p.stats.defense || 0;
            totals.speed += p.stats.speed || 0;
        }
    });
    
    const count = pokemon.length || 1;
    return {
        hp: Math.round(totals.hp / count),
        attack: Math.round(totals.attack / count),
        defense: Math.round(totals.defense / count),
        speed: Math.round(totals.speed / count)
    };
}

function generateTeamSuggestions(pokemon, weaknesses) {
    const suggestions = [];
    
    if (pokemon.length < 6) {
        suggestions.push(`Agrega ${6 - pokemon.length} Pokémon más para completar tu equipo.`);
    }
    
    // Detectar debilidades críticas
    const criticalWeaknesses = Object.entries(weaknesses)
        .filter(([type, count]) => count >= 3)
        .map(([type]) => type);
    
    if (criticalWeaknesses.length > 0) {
        suggestions.push(`⚠️ Tu equipo es muy débil contra: ${criticalWeaknesses.join(', ')}. Considera agregar resistencias.`);
    }
    
    // Verificar variedad de tipos
    const typeCount = new Set(pokemon.flatMap(p => p.types)).size;
    if (typeCount < 4 && pokemon.length >= 3) {
        suggestions.push('Considera agregar más variedad de tipos para mejor cobertura.');
    }
    
    // Sugerir balance ofensivo/defensivo
    const avgStats = calculateAverageStats(pokemon);
    if (avgStats.attack > avgStats.defense + 30) {
        suggestions.push('Tu equipo es muy ofensivo. Considera agregar un tanque defensivo.');
    } else if (avgStats.defense > avgStats.attack + 30) {
        suggestions.push('Tu equipo es muy defensivo. Considera agregar un atacante fuerte.');
    }
    
    if (suggestions.length === 0) {
        suggestions.push('¡Tu equipo tiene buen balance! 👍');
    }
    
    return suggestions;
}

// Exportar equipo
function exportTeam() {
    const team = savedTeams[currentTeamId];
    const dataStr = JSON.stringify(team, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${team.name.replace(/\s/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Equipo exportado');
}

// Importar equipo
function importTeam(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const teamData = JSON.parse(e.target.result);
            const newTeamId = `team-${Date.now()}`;
            
            savedTeams[newTeamId] = {
                name: teamData.name || 'Equipo Importado',
                pokemon: teamData.pokemon || [],
                created: new Date().toISOString()
            };
            
            currentTeamId = newTeamId;
            localStorage.setItem('current-team-id', currentTeamId);
            saveTeams();
            updateTeamSelector();
            loadCurrentTeam();
            showNotification('Equipo importado exitosamente');
        } catch (error) {
            showNotification('Error al importar equipo', 'error');
            console.error('Error:', error);
        }
    };
    reader.readAsText(file);
}

// Notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    updateTeamSelector();
    loadCurrentTeam();
    
    // Event listeners
    const teamSelector = document.getElementById('team-selector');
    if (teamSelector) {
        teamSelector.addEventListener('change', (e) => switchTeam(e.target.value));
    }
    
    const newTeamBtn = document.getElementById('new-team-btn');
    if (newTeamBtn) {
        newTeamBtn.addEventListener('click', createNewTeam);
    }
    
    const deleteTeamBtn = document.getElementById('delete-team-btn');
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', () => deleteTeam(currentTeamId));
    }
    
    const exportBtn = document.getElementById('export-team-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTeam);
    }
    
    const importBtn = document.getElementById('import-team-btn');
    const importInput = document.getElementById('import-file-input');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importTeam(e.target.files[0]);
            }
        });
    }
});

// Estilos para animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
