const serverURL = "http://trenduhd.xyz:8080"; // URL do servidor Xtream Codes
const username = "materprint";
const password = "Mater225";

const categoryFilter = document.getElementById("categoryFilter");
const movieList = document.getElementById("movieList");
const highlightPoster = document.getElementById("highlightPoster");
const highlightDescription = document.getElementById("highlightDescription");

let categories = [];
let movies = [];
let series = [];

// Carregar categorias de filmes e séries
async function loadCategories() {
    try {
        const [vodResponse, seriesResponse] = await Promise.all([
            fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`),
            fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_series_categories`),
        ]);

        const vodCategories = await vodResponse.json();
        const seriesCategories = await seriesResponse.json();

        categories = [...vodCategories, ...seriesCategories]; // Combina as categorias
        populateCategoryFilter(categories);
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

// Carregar conteúdos (filmes ou séries) de uma categoria
async function loadContent(categoryId = "all") {
    try {
        movieList.innerHTML = ""; // Limpar lista antes de carregar

        const vodPromise = fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`);
        const seriesPromise = fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_series`);

        const [vodResponse, seriesResponse] = await Promise.all([vodPromise, seriesPromise]);
        movies = await vodResponse.json();
        series = await seriesResponse.json();

        let contentList = [...movies, ...series]; // Combina filmes e séries

        // Filtrar por categoria, se aplicável
        if (categoryId !== "all") {
            contentList = contentList.filter((content) => content.category_id === categoryId);
        }

        displayMovies(contentList);
        if (contentList.length > 0) {
            updateHighlight(contentList[0]); // Usar o primeiro item como destaque
        }
    } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        alert("Erro ao carregar filmes e séries.");
    }
}

// Exibir conteúdo (filmes ou séries) como cards
function displayMovies(contentList) {
    contentList.forEach((content) => {
        const contentCard = document.createElement("div");
        contentCard.className = "movie-card";
        contentCard.innerHTML = `
            <img src="${content.stream_icon || "https://via.placeholder.com/200x300"}" alt="${content.name}">
            <h3>${content.name}</h3>
        `;
        contentCard.addEventListener("click", () => redirectToDetails(content));
        movieList.appendChild(contentCard);
    });
}

// Atualizar destaque do dia
function updateHighlight(content) {
    highlightPoster.src = content.stream_icon || "https://via.placeholder.com/300x450";
    highlightDescription.textContent = content.name || "Destaque do Dia";
}

// Redirecionar para página de detalhes
function redirectToDetails(content) {
    const type = content.stream_type === "movie" ? "movie" : "series";
    const url = `details.html?type=${type}&name=${encodeURIComponent(content.name)}&stream_id=${content.stream_id}&icon=${encodeURIComponent(content.stream_icon || "")}`;
    window.location.href = url;
}

// Eventos
categoryFilter.addEventListener("change", (event) => {
    const categoryId = event.target.value;
    loadContent(categoryId);
});

// Inicializar página
loadCategories();
loadContent();
