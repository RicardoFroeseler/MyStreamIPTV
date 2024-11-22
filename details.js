const modalButton = document.getElementById("modalButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const backButton = document.getElementById("backButton");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const iframePlayer = document.getElementById("iframePlayer");

// Obter parâmetros da URL
const params = new URLSearchParams(window.location.search);
const movieName = params.get("name"); // Nome do filme passado pela URL
const type = params.get("type"); // 'movie' ou 'series'
const streamId = params.get("stream_id"); // ID do stream

// URL do servidor IPTV
const serverURL = "http://trenduhd.xyz:8080";
const username = "materprint";
const password = "Mater225";
let streamUrl;

// URL da API do TMDB
const tmdbApiKey = "cf811f120299a8eb4e63c3c3a39037ad"; // Sua chave de API do TMDB
const tmdbBaseURL = "https://api.themoviedb.org/3";
const tmdbImageBaseURL = "https://image.tmdb.org/t/p/original"; // URL para imagens em alta resolução

// Elementos da Página
const movieTitle = document.getElementById("movieTitle");
const movieDescription = document.getElementById("movieDescription");
const movieCast = document.getElementById("movieCast");
const movieGenre = document.getElementById("movieGenre");
const movieDuration = document.getElementById("movieDuration");
const movieReleaseDate = document.getElementById("movieReleaseDate");
const moviePoster = document.getElementById("moviePoster");
const movieBackground = document.getElementById("movieBackground");
const movieLogoContainer = document.createElement("div");
movieLogoContainer.id = "movieLogo";
movieTitle.appendChild(movieLogoContainer);

// Função para carregar detalhes do filme/série do IPTV
function loadDetails() {
    const action = type === "movie" ? "get_vod_info" : "get_series_info";
    const apiUrl = `${serverURL}/player_api.php?username=${username}&password=${password}&action=${action}&vod_id=${streamId}`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            const info = data.info;

            // Atualizar informações básicas do filme/série
            movieTitle.textContent = info.name || "Título não disponível";
            movieDescription.textContent = info.description || "Descrição não disponível.";
            movieCast.textContent = info.cast || "Elenco não disponível.";
            movieGenre.textContent = info.genre || "Gênero não disponível.";
            movieDuration.textContent = info.duration || "Duração não disponível.";
            movieReleaseDate.textContent = info.releasedate || "Data não disponível.";
            moviePoster.src = info.movie_image || "https://via.placeholder.com/300x450";

            // Configurar URL do Stream
            streamUrl = `${serverURL}/movie/${username}/${password}/${streamId}.mp4`;

            // Buscar informações adicionais do TMDB
            fetchAdditionalDetails(info.name);
        })
        .catch((error) => {
            console.error("Erro ao carregar os detalhes:", error);
            alert("Não foi possível carregar os detalhes do conteúdo.");
        });
}

// Função para buscar variações do nome no TMDB
function fetchAdditionalDetails(movieName) {
    const variations = generateNameVariations(movieName); // Gerar variações do nome
    tryFetchVariations(variations, 0); // Tentar buscar usando variações
}

// Gerar variações do nome
function generateNameVariations(name) {
    const variations = [name]; // Começar com o nome original

    // Remover caracteres especiais como parênteses e subtítulos
    if (name.includes("(")) variations.push(name.split("(")[0].trim());
    if (name.includes(":")) variations.push(name.split(":")[0].trim());

    // Adicionar tradução manual (exemplo)
    if (name.toLowerCase().includes("sorria")) variations.push("Smile 2");

    // Retornar lista de variações únicas
    return [...new Set(variations)];
}

// Tentar buscar variações no TMDB
function tryFetchVariations(variations, index) {
    if (index >= variations.length) {
        console.warn("Nenhuma correspondência encontrada após todas as tentativas. Usando fallback.");
        applyPosterAsBackground();
        return;
    }

    const searchURL = `${tmdbBaseURL}/search/${type === "movie" ? "movie" : "tv"}?api_key=${tmdbApiKey}&query=${encodeURIComponent(variations[index])}`;

    fetch(searchURL)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const movie = data.results[0]; // Primeiro resultado encontrado

                // Atualizar o background
                if (movie.backdrop_path) {
                    movieBackground.style.backgroundImage = `url(${tmdbImageBaseURL}${movie.backdrop_path})`;
                } else {
                    console.warn("Background não disponível no TMDB. Usando pôster como fallback.");
                    applyPosterAsBackground();
                }

                // Buscar logotipo do filme
                fetchMovieLogos(movie.id);
            } else {
                console.warn(`Nenhuma correspondência para "${variations[index]}". Tentando próxima variação...`);
                tryFetchVariations(variations, index + 1); // Tentar próxima variação
            }
        })
        .catch(error => {
            console.error("Erro ao buscar informações do TMDB:", error);
            tryFetchVariations(variations, index + 1); // Tentar próxima variação em caso de erro
        });
}

// Função para aplicar o pôster como background
function applyPosterAsBackground() {
    if (moviePoster.src && moviePoster.src !== "https://via.placeholder.com/300x450") {
        movieBackground.style.backgroundImage = `url(${moviePoster.src})`;
    } else {
        movieBackground.style.backgroundColor = "#000"; // Fundo preto
    }
}

// Função para buscar logotipos usando o ID do TMDB com variações
function fetchMovieLogos(movieId) {
    const logosURL = `${tmdbBaseURL}/movie/${movieId}/images?api_key=${tmdbApiKey}`;

    fetch(logosURL)
        .then(response => response.json())
        .then(data => {
            if (data.logos && data.logos.length > 0) {
                // Selecionar o primeiro logotipo disponível (em inglês ou padrão)
                const logo = data.logos.find(logo => logo.iso_639_1 === "en" || logo.iso_639_1 === null) || data.logos[0];
                
                if (logo && logo.file_path) {
                    const logoImg = document.createElement("img");
                    logoImg.src = `${tmdbImageBaseURL}${logo.file_path}`;
                    logoImg.alt = "Logotipo do Filme";
                    logoImg.style.maxWidth = "300px";
                    logoImg.style.marginTop = "20px";

                    // Adicionar o logotipo ao container
                    movieLogoContainer.appendChild(logoImg);
                } else {
                    console.warn("Logotipo encontrado, mas sem caminho de arquivo válido.");
                }
            } else {
                console.warn("Nenhum logotipo encontrado. Tentando variações do nome...");
                tryFetchLogoVariations(movieId);
            }
        })
        .catch(error => {
            console.error("Erro ao buscar logotipos do TMDB:", error);
            applyLogoFallback();
        });
}

// Função para buscar variações do nome para logotipos
function tryFetchLogoVariations(movieName) {
    const variations = generateNameVariations(movieName); // Gerar variações do nome
    tryFetchLogoNameVariations(variations, 0); // Tentar variações de nome
}

// Buscar logotipos com variações de nome
function tryFetchLogoNameVariations(variations, index) {
    if (index >= variations.length) {
        console.warn("Nenhuma correspondência de logotipo encontrada após todas as tentativas.");
        applyLogoFallback();
        return;
    }

    const searchURL = `${tmdbBaseURL}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(variations[index])}`;

    fetch(searchURL)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                fetchMovieLogos(movie.id); // Busca logotipos com o novo ID do TMDB
            } else {
                console.warn(`Nenhuma correspondência para "${variations[index]}". Tentando próxima variação...`);
                tryFetchLogoNameVariations(variations, index + 1);
            }
        })
        .catch(error => {
            console.error("Erro ao tentar buscar variação de logotipo:", error);
            tryFetchLogoNameVariations(variations, index + 1);
        });
}

// Função para aplicar fallback ao logotipo
function applyLogoFallback() {
    const fallbackMessage = document.createElement("p");
    fallbackMessage.textContent = "Logotipo não disponível.";
    fallbackMessage.style.color = "#fff";
    fallbackMessage.style.marginTop = "20px";
    movieLogoContainer.appendChild(fallbackMessage);
}

// Reutilizar a função generateNameVariations (já existe no seu código)
function generateNameVariations(name) {
    const variations = [name]; // Começar com o nome original

    // Remover caracteres especiais como parênteses e subtítulos
    if (name.includes("(")) variations.push(name.split("(")[0].trim());
    if (name.includes(":")) variations.push(name.split(":")[0].trim());

    // Adicionar tradução manual (exemplo)
    if (name.toLowerCase().includes("sorria")) variations.push("Smile 2");

    return [...new Set(variations)];
}

// Abrir Modal
modalButton.addEventListener("click", () => {
    if (streamUrl) {
        iframePlayer.src = streamUrl;
        modal.style.display = "flex";
    }
});

// Fechar Modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    iframePlayer.src = "";
});

// Abrir em Tela Cheia
fullscreenButton.addEventListener("click", () => {
    if (streamUrl) {
        window.open(streamUrl, "_blank");
    }
});

// Botão Voltar
backButton.addEventListener("click", () => {
    window.history.back();
});

// Inicializar Detalhes
loadDetails();
