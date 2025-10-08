// Sistema de internacionalización (i18n)

const translations = {
    es: {
        // Navegación
        nav_pokedex: 'Pokédex',
        nav_favorites: 'Favoritos',
        nav_team_builder: 'Constructor de Equipos',
        nav_compare: 'Comparar',
        
        // Búsqueda y filtros
        search_placeholder: 'Buscar Pokémon...',
        filter_all_types: 'Todos los tipos',
        filter_all_generations: 'Todas las generaciones',
        filter_all_ratings: 'Todas las calificaciones',
        filter_tags_placeholder: 'Filtrar por tags...',
        sort_default: 'Orden por defecto',
        sort_rating_desc: 'Mayor calificación',
        sort_rating_asc: 'Menor calificación',
        sort_name_asc: 'Nombre (A-Z)',
        sort_name_desc: 'Nombre (Z-A)',
        
        // Botones
        btn_surprise: 'Sorpréndeme',
        btn_add_favorite: 'Agregar a favoritos',
        btn_remove_favorite: 'Eliminar de favoritos',
        btn_save_notes: 'Guardar notas',
        btn_export_team: 'Exportar equipo',
        btn_import_team: 'Importar equipo',
        btn_reset_filters: 'Resetear filtros',
        btn_compare: 'Comparar',
        
        // Detalles de Pokémon
        label_id: 'ID',
        label_type: 'Tipo',
        label_types: 'Tipos',
        label_height: 'Altura',
        label_weight: 'Peso',
        label_abilities: 'Habilidades',
        label_stats: 'Estadísticas',
        label_hp: 'HP',
        label_attack: 'Ataque',
        label_defense: 'Defensa',
        label_special_attack: 'At. Esp.',
        label_special_defense: 'Def. Esp.',
        label_speed: 'Velocidad',
        label_total: 'Total',
        label_description: 'Descripción',
        
        // Favoritos
        favorites_title: 'Mis Pokémon Favoritos',
        favorites_empty: 'No tienes Pokémon favoritos aún.',
        favorites_no_results: 'No se encontraron favoritos con esos filtros.',
        tag_input_placeholder: 'Agregar tag...',
        notes_placeholder: 'Escribe tus notas...',
        notes_saved: '✓ Guardado',
        rating_stars: 'estrellas',
        
        // Comparación
        compare_title: 'Comparador de Pokémon',
        compare_select1: 'Seleccionar primer Pokémon',
        compare_select2: 'Seleccionar segundo Pokémon',
        compare_vs: 'VS',
        compare_matchup: 'Análisis de Enfrentamiento',
        compare_advantages: 'Ventajas',
        compare_weaknesses: 'Debilidades',
        compare_stats_comparison: 'Comparación de Estadísticas',
        compare_damage_multiplier: 'Multiplicador de daño',
        compare_conclusion: 'Conclusión',
        compare_super_effective: '¡Súper efectivo! {attacker} tiene gran ventaja sobre {defender}.',
        compare_effective: 'Efectivo. {attacker} tiene ventaja sobre {defender}.',
        compare_neutral: 'Daño neutral. Enfrentamiento equilibrado en tipos.',
        compare_not_effective: 'No muy efectivo. {defender} resiste los ataques de {attacker}.',
        compare_no_effect: 'Sin efecto. {defender} es inmune a los ataques de {attacker}.',
        compare_advantage_1: '{pokemon1} tiene ventaja de tipos en este enfrentamiento.',
        compare_advantage_2: '{pokemon2} tiene ventaja de tipos en este enfrentamiento.',
        compare_balanced: 'Ambos Pokémon están equilibrados en efectividad de tipos.',
        
        // Constructor de equipos
        team_builder_title: 'Constructor de Equipos',
        team_add_pokemon: 'Agregar Pokémon',
        team_analysis: 'Análisis del Equipo',
        team_type_coverage: 'Cobertura de Tipos',
        team_suggestions: 'Sugerencias',
        
        // Mensajes
        loading: 'Cargando...',
        error_loading: 'Error al cargar',
        no_results: 'No se encontraron resultados',
        
        // Footer
        footer_text: 'Pokédex por Subkht',
        
        // Tema
        theme_toggle: 'Cambiar tema',
        
        // Movimientos
        moves_title: 'Movimientos',
        moves_power: 'Poder',
        moves_accuracy: 'Precisión',
        moves_pp: 'PP',
        moves_type: 'Tipo',
        moves_category: 'Categoría',
        moves_learn_method: 'Método de aprendizaje'
    },
    
    en: {
        // Navigation
        nav_pokedex: 'Pokédex',
        nav_favorites: 'Favorites',
        nav_team_builder: 'Team Builder',
        nav_compare: 'Compare',
        
        // Search and filters
        search_placeholder: 'Search Pokémon...',
        filter_all_types: 'All types',
        filter_all_generations: 'All generations',
        filter_all_ratings: 'All ratings',
        filter_tags_placeholder: 'Filter by tags...',
        sort_default: 'Default order',
        sort_rating_desc: 'Highest rating',
        sort_rating_asc: 'Lowest rating',
        sort_name_asc: 'Name (A-Z)',
        sort_name_desc: 'Name (Z-A)',
        
        // Buttons
        btn_surprise: 'Surprise me',
        btn_add_favorite: 'Add to favorites',
        btn_remove_favorite: 'Remove from favorites',
        btn_save_notes: 'Save notes',
        btn_export_team: 'Export team',
        btn_import_team: 'Import team',
        btn_reset_filters: 'Reset filters',
        btn_compare: 'Compare',
        
        // Pokémon details
        label_id: 'ID',
        label_type: 'Type',
        label_types: 'Types',
        label_height: 'Height',
        label_weight: 'Weight',
        label_abilities: 'Abilities',
        label_stats: 'Stats',
        label_hp: 'HP',
        label_attack: 'Attack',
        label_defense: 'Defense',
        label_special_attack: 'Sp. Atk',
        label_special_defense: 'Sp. Def',
        label_speed: 'Speed',
        label_total: 'Total',
        label_description: 'Description',
        
        // Favorites
        favorites_title: 'My Favorite Pokémon',
        favorites_empty: "You don't have any favorite Pokémon yet.",
        favorites_no_results: 'No favorites found with those filters.',
        tag_input_placeholder: 'Add tag...',
        notes_placeholder: 'Write your notes...',
        notes_saved: '✓ Saved',
        rating_stars: 'stars',
        
        // Comparison
        compare_title: 'Pokémon Comparison',
        compare_select1: 'Select first Pokémon',
        compare_select2: 'Select second Pokémon',
        compare_vs: 'VS',
        compare_matchup: 'Matchup Analysis',
        compare_advantages: 'Advantages',
        compare_weaknesses: 'Weaknesses',
        compare_stats_comparison: 'Stats Comparison',
        compare_damage_multiplier: 'Damage multiplier',
        compare_conclusion: 'Conclusion',
        compare_super_effective: 'Super effective! {attacker} has a great advantage over {defender}.',
        compare_effective: 'Effective. {attacker} has an advantage over {defender}.',
        compare_neutral: 'Neutral damage. Balanced type matchup.',
        compare_not_effective: 'Not very effective. {defender} resists {attacker}\'s attacks.',
        compare_no_effect: 'No effect. {defender} is immune to {attacker}\'s attacks.',
        compare_advantage_1: '{pokemon1} has a type advantage in this matchup.',
        compare_advantage_2: '{pokemon2} has a type advantage in this matchup.',
        compare_balanced: 'Both Pokémon are balanced in type effectiveness.',
        
        // Team builder
        team_builder_title: 'Team Builder',
        team_add_pokemon: 'Add Pokémon',
        team_analysis: 'Team Analysis',
        team_type_coverage: 'Type Coverage',
        team_suggestions: 'Suggestions',
        
        // Messages
        loading: 'Loading...',
        error_loading: 'Error loading',
        no_results: 'No results found',
        
        // Footer
        footer_text: 'Pokédex by Subkht',
        
        // Theme
        theme_toggle: 'Toggle theme',
        
        // Moves
        moves_title: 'Moves',
        moves_power: 'Power',
        moves_accuracy: 'Accuracy',
        moves_pp: 'PP',
        moves_type: 'Type',
        moves_category: 'Category',
        moves_learn_method: 'Learn method'
    },
    
    ja: {
        // ナビゲーション
        nav_pokedex: 'ポケモン図鑑',
        nav_favorites: 'お気に入り',
        nav_team_builder: 'チームビルダー',
        nav_compare: '比較',
        
        // 検索とフィルター
        search_placeholder: 'ポケモンを検索...',
        filter_all_types: 'すべてのタイプ',
        filter_all_generations: 'すべての世代',
        filter_all_ratings: 'すべての評価',
        filter_tags_placeholder: 'タグでフィルター...',
        sort_default: 'デフォルトの順序',
        sort_rating_desc: '評価の高い順',
        sort_rating_asc: '評価の低い順',
        sort_name_asc: '名前（あ-ん）',
        sort_name_desc: '名前（ん-あ）',
        
        // ボタン
        btn_surprise: 'サプライズ',
        btn_add_favorite: 'お気に入りに追加',
        btn_remove_favorite: 'お気に入りから削除',
        btn_save_notes: 'メモを保存',
        btn_export_team: 'チームをエクスポート',
        btn_import_team: 'チームをインポート',
        btn_reset_filters: 'フィルターをリセット',
        btn_compare: '比較',
        
        // ポケモン詳細
        label_id: 'ID',
        label_type: 'タイプ',
        label_types: 'タイプ',
        label_height: '高さ',
        label_weight: '重さ',
        label_abilities: '特性',
        label_stats: 'ステータス',
        label_hp: 'HP',
        label_attack: '攻撃',
        label_defense: '防御',
        label_special_attack: '特攻',
        label_special_defense: '特防',
        label_speed: '素早さ',
        label_total: '合計',
        label_description: '説明',
        
        // お気に入り
        favorites_title: 'お気に入りのポケモン',
        favorites_empty: 'お気に入りのポケモンがまだありません。',
        favorites_no_results: 'そのフィルターでお気に入りが見つかりませんでした。',
        tag_input_placeholder: 'タグを追加...',
        notes_placeholder: 'メモを書く...',
        notes_saved: '✓ 保存されました',
        rating_stars: '星',
        
        // 比較
        compare_title: 'ポケモン比較',
        compare_select1: '最初のポケモンを選択',
        compare_select2: '2番目のポケモンを選択',
        compare_vs: 'VS',
        compare_matchup: '対戦分析',
        compare_advantages: '有利',
        compare_weaknesses: '不利',
        compare_stats_comparison: 'ステータス比較',
        compare_damage_multiplier: 'ダメージ倍率',
        compare_conclusion: '結論',
        compare_super_effective: '効果は抜群だ！{attacker}は{defender}に対して大きな有利があります。',
        compare_effective: '効果的。{attacker}は{defender}に対して有利です。',
        compare_neutral: '通常のダメージ。タイプ相性は互角です。',
        compare_not_effective: '効果はいまひとつだ。{defender}は{attacker}の攻撃に抵抗します。',
        compare_no_effect: '効果がないようだ。{defender}は{attacker}の攻撃に免疫があります。',
        compare_advantage_1: '{pokemon1}はこの対戦でタイプ有利があります。',
        compare_advantage_2: '{pokemon2}はこの対戦でタイプ有利があります。',
        compare_balanced: '両方のポケモンはタイプ相性でバランスが取れています。',
        
        // チームビルダー
        team_builder_title: 'チームビルダー',
        team_add_pokemon: 'ポケモンを追加',
        team_analysis: 'チーム分析',
        team_type_coverage: 'タイプカバレッジ',
        team_suggestions: '提案',
        
        // メッセージ
        loading: '読み込み中...',
        error_loading: '読み込みエラー',
        no_results: '結果が見つかりません',
        
        // フッター
        footer_text: 'Subkhtによるポケモン図鑑',
        
        // テーマ
        theme_toggle: 'テーマ切り替え',
        
        // 技
        moves_title: '技',
        moves_power: '威力',
        moves_accuracy: '命中率',
        moves_pp: 'PP',
        moves_type: 'タイプ',
        moves_category: 'カテゴリー',
        moves_learn_method: '習得方法'
    }
};

// Idioma actual
let currentLanguage = localStorage.getItem('pokedex-language') || 'es';

// Función para obtener traducción
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Función para cambiar idioma
function changeLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Idioma no soportado: ${lang}`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('pokedex-language', lang);
    updatePageTranslations();
}

// Actualizar todas las traducciones de la página
function updatePageTranslations() {
    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Actualizar atributos con data-i18n-attr
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const data = JSON.parse(element.dataset.i18nAttr);
        Object.keys(data).forEach(attr => {
            const translation = t(data[attr]);
            element.setAttribute(attr, translation);
        });
    });
    
    // Actualizar idioma del HTML
    document.documentElement.lang = currentLanguage;
    
    // Disparar evento personalizado para que otros scripts puedan reaccionar
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

// Inicializar selector de idioma
function initLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (!selector) return;
    
    selector.value = currentLanguage;
    
    selector.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
}

// Nombres de Pokémon en diferentes idiomas
async function getPokemonName(pokemonId, lang = currentLanguage) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const data = await response.json();
        
        const langMap = {
            'es': 'es',
            'en': 'en',
            'ja': 'ja'
        };
        
        const targetLang = langMap[lang] || 'en';
        const nameEntry = data.names.find(n => n.language.name === targetLang);
        
        return nameEntry ? nameEntry.name : data.name;
    } catch (error) {
        console.error('Error al obtener nombre del Pokémon:', error);
        return null;
    }
}

// Inicializar i18n cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSelector();
    updatePageTranslations();
});

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, changeLanguage, getPokemonName };
}
