const serverURL = "http://trenduhd.xyz:8080"; // URL do servidor Xtream Codes
const username = "materprint";
const password = "Mater225";

const categoryFilter = document.getElementById("categoryFilter");
const movieList = document.getElementById("movieList");
const highlightPoster = document.getElementById("highlightPoster");
const highlightDescription = document.getElementById("highlightDescription");

let categories = [];
let movies = [];

// Carregar categorias de filmes
async function loadCategories() {
    try {
        const response = await fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`);
        categories = await response.json();

        if (categories && categories.length > 0) {
            populateCategoryFilter(categories);
        }
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        alert("Erro ao carregar categorias.");
    }
}

// Preencher o filtro de categorias
function populateCategoryFilter(categories) {
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.category_id;
        option.textContent = category.category_name;
        categoryFilter.appendChild(option);
    });
}

// Carregar filmes de uma categoria
async function loadMovies(categoryId = "all") {
    try {
        movieList.innerHTML = ""; // Limpar lista antes de carregar
        let url = `${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
        if (categoryId !== "all") {
            url += `&category_id=${categoryId}`;
        }
        const response = await fetch(url);
        movies = await response.json();

        if (movies && movies.length > 0) {
            displayMovies(movies);
            updateHighlight(movies[0]); // Usar o primeiro filme como destaque
        }
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        alert("Erro ao carregar filmes.");
    }
}

// Exibir filmes como cards
function displayMovies(movies) {
    movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        movieCard.innerHTML = `
            <img src="${movie.stream_icon || "https://via.placeholder.com/200x300"}" alt="${movie.name}">
            <h3>${movie.name}</h3>
            <div class="showtimes">
                <span>15:00</span>
                <span>17:00</span>
                <span>19:00</span>
            </div>
        `;
        movieCard.addEventListener("click", () => redirectToDetails(movie));
        movieList.appendChild(movieCard);
    });
}

// Atualizar destaque do filme
function updateHighlight(movie) {
    highlightPoster.src = movie.stream_icon || "https://via.placeholder.com/300x450";
    highlightDescription.textContent = movie.name;
}

// Redirecionar para página de detalhes do filme
function redirectToDetails(movie) {
    const url = `details.html?name=${encodeURIComponent(movie.name)}&stream_id=${movie.stream_id}&icon=${encodeURIComponent(movie.stream_icon || "")}`;
    window.location.href = url;
}

// Eventos
categoryFilter.addEventListener("change", (event) => {
    const categoryId = event.target.value;
    loadMovies(categoryId);
});

// Inicializar página
loadCategories();
loadMovies();
