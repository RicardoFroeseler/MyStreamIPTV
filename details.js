const serverURL = "http://trenduhd.xyz:8080"; // URL do servidor Xtream Codes
const username = "materprint";
const password = "Mater225";

const videoPlayer = document.getElementById("videoPlayer");
const movieTitle = document.getElementById("movieTitle");
const movieDescription = document.getElementById("movieDescription");
const moviePoster = document.getElementById("moviePoster");
const backButton = document.getElementById("backButton");
const watchMovieButton = document.getElementById("watchMovie");

// Pegar parâmetros da URL
const params = new URLSearchParams(window.location.search);
const name = params.get("name");
const streamId = params.get("stream_id");
const icon = params.get("icon");

// Exibir título e imagem do filme
movieTitle.textContent = name;
moviePoster.src = icon || "https://via.placeholder.com/300"; // Placeholder caso não tenha imagem

// Configurar player e descrição do filme
const streamUrl = `${serverURL}/streaming.php?username=${username}&password=${password}&stream=${streamId}`;
videoPlayer.src = ""; // Não iniciar automaticamente

// Configurar o botão de "Assistir Agora"
watchMovieButton.addEventListener("click", () => {
    videoPlayer.src = streamUrl;
    videoPlayer.play();
});

// Botão para voltar à página principal
backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});
