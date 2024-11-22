const serverURL = "http://trenduhd.xyz:8080"; // Substitua pela URL do seu servidor
const username = "materprint";
const password = "Mater225";

const movieList = document.getElementById("movieList");
const categoryFilter = document.getElementById("categoryFilter");

// Função para carregar as categorias
function loadCategories() {
    fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`)
        .then(response => response.json())
        .then(categories => {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.category_id;
                option.textContent = category.category_name;
                categoryFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar categorias:", error);
        });
}

// Função para carregar os filmes
function loadMovies(categoryId = "all") {
    fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`)
        .then(response => response.json())
        .then(movies => {
            movieList.innerHTML = ""; // Limpar lista antes de recarregar

            // Filtrar por categoria, se aplicável
            const filteredMovies = categoryId === "all" ? movies : movies.filter(movie => movie.category_id === categoryId);

            filteredMovies.forEach(movie => {
                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";
                movieCard.innerHTML = `
                    <img src="${movie.stream_icon || 'https://via.placeholder.com/200x300'}" alt="${movie.name}">
                    <h3>${movie.name}</h3>
                    <button onclick="redirectToDetails('${movie.stream_id}')">Ver Detalhes</button>
                `;
                movieList.appendChild(movieCard);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar filmes:", error);
        });
}

// Função para redirecionar para a página de detalhes
function redirectToDetails(streamId) {
    window.location.href = `details.html?type=movie&stream_id=${streamId}`;
}

// Evento para mudança de categoria
categoryFilter.addEventListener("change", (event) => {
    const categoryId = event.target.value;
    loadMovies(categoryId);
});

// Inicializar a página
loadCategories();
loadMovies();
