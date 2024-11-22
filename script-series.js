const serverURL = "http://trenduhd.xyz:8080";
const username = "materprint";
const password = "Mater225";

const seriesList = document.getElementById("seriesList");

// Carregar Séries
function loadSeries() {
    fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_series`)
        .then(response => response.json())
        .then(series => {
            series.forEach(serie => {
                const seriesCard = document.createElement("div");
                seriesCard.className = "movie-card";
                seriesCard.innerHTML = `
                    <img src="${serie.stream_icon || 'https://via.placeholder.com/200x300'}" alt="${serie.name}">
                    <h3>${serie.name}</h3>
                    <button onclick="redirectToDetails('${serie.series_id}', 'series')">Ver Detalhes</button>
                `;
                seriesList.appendChild(seriesCard);
            });
        })
        .catch(error => console.error("Erro ao carregar séries:", error));
}

// Redirecionar para Detalhes
function redirectToDetails(id, type) {
    window.location.href = `details.html?type=${type}&stream_id=${id}`;
}

// Inicializar
loadSeries();
