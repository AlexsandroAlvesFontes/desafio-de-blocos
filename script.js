
const btnComecar = document.getElementById("btnComecar");
const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");

let intervaloQueda;

// Botão para começar o jogo
btnComecar.addEventListener("click", function() {
    telaInicial.hidden = true;
    telaJogo.hidden = false;

    iniciarQueda();
});

// Função para criar e fazer a peça cair
function iniciarQueda() {
    const tabuleiro = document.getElementById("tabuleiro");

    // Limpa o tabuleiro
    tabuleiro.innerHTML = "";

    // Cria a peça
    const peca = document.createElement("div");
    peca.classList.add("peca");

    // Define a posição inicial
    peca.style.left = "120px";
    peca.style.top = "0px";

    // Adiciona a peça ao tabuleiro
    tabuleiro.appendChild(peca);

    let posicaoY = 0;
    let posicaoX = 120;

    // Evita manter uma queda anterior ativa
    clearInterval(intervaloQueda);

    // Faz a peça cair automaticamente
    intervaloQueda = setInterval(function() {
        posicaoY += 2;
        peca.style.top = posicaoY + "px";

        // Para quando a peça chega ao fundo
        if (posicaoY >= tabuleiro.clientHeight - peca.offsetHeight) {
            clearInterval(intervaloQueda);
        }
    }, 50);
}

// Movimenta a peça com as setas do teclado

document.addEventListener("keydown", function(event) {
    const peca = document.querySelector(".peca");
    const tabuleiro = document.getElementById("tabuleiro");

    if (!peca || telaJogo.hidden) {
        return;
    }

    let posicaoX = parseInt(peca.style.left) || 0;

    if (event.key === "ArrowLeft" && posicaoX > 0) {
        posicaoX -= 30;
    }

    if (
        event.key === "ArrowRight" &&
        posicaoX < tabuleiro.clientWidth - peca.offsetWidth
    ) {
        posicaoX += 30;
    }

    peca.style.left = posicaoX + "px";
});