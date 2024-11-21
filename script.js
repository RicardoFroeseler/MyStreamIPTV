const serverURL = "http://trenduhd.xyz:8080"; // URL do servidor Xtream Codes
const username = "materprint";
const password = "Mater225";

const contentGrid = document.getElementById("content-grid");

let vodItems = [];

// Carregar categorias de VOD
async function loadVODCategories() {
    try {
        const response = await fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`);
        const categories = await response.json();

        if (categories && categories.length > 0) {
            displayCategories(categories);
        } else {
            alert("Nenhuma categoria de VOD encontrada.");
        }
    } catch (error) {
        console.error("Erro ao carregar categorias de VOD:", error);
        alert("Erro ao carregar categorias de VOD.");
    }
}

// Exibir categorias como botões
function displayCategories(categories) {
    contentGrid.innerHTML = ''; // Limpar grid
    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.category_name;
        button.className = "category-btn";
        button.addEventListener("click", () => loadVODStreams(category.category_id));
        contentGrid.appendChild(button);
    });
}

// Carregar streams de uma categoria
async function loadVODStreams(categoryId) {
    try {
        const response = await fetch(`${serverURL}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${categoryId}`);
        const streams = await response.json();

        if (streams && streams.length > 0) {
            vodItems = streams;
            displayVOD();
        } else {
            alert("Nenhum item de VOD encontrado nesta categoria.");
        }
    } catch (error) {
        console.error("Erro ao carregar streams de VOD:", error);
        alert("Erro ao carregar streams de VOD.");
    }
}

// Exibir itens VOD como cards
function displayVOD() {
    contentGrid.innerHTML = ''; // Limpar grid
    vodItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.stream_icon || "https://via.placeholder.com/200"}" alt="${item.name}">
            <h3>${item.name}</h3>
        `;
        card.addEventListener("click", () => redirectToDetails(item));
        contentGrid.appendChild(card);
    });
}

// Redirecionar para página de detalhes
function redirectToDetails(item) {
    const url = `details.html?name=${encodeURIComponent(item.name)}&stream_id=${item.stream_id}&icon=${encodeURIComponent(item.stream_icon || "")}`;
    window.location.href = url;
}

// Inicializar carregando categorias
loadVODCategories();
