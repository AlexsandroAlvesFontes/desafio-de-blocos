
const btnComecar = document.getElementById("btnComecar");
const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");
const telaResultado = document.getElementById("telaResultado");

const tabuleiro = document.getElementById("tabuleiro");
const pontuacaoElemento = document.getElementById("pontuacao");
const pontuacaoFinal = document.getElementById("pontuacaoFinal");
const btnJogarNovamente = document.getElementById("btnJogarNovamente");

// Controles para celular
const btnEsquerda = document.getElementById("btnEsquerda");
const btnDireita = document.getElementById("btnDireita");
const btnGirar = document.getElementById("btnGirar");
const btnDescer = document.getElementById("btnDescer");

const tamanhoBloco = 30;
const COLUNAS = 10;
const LINHAS = 13;

let intervaloQueda = null;
let pecaAtual = null;
let posicaoX = 0;
let posicaoY = 0;
let pontuacao = 0;
let jogoAtivo = false;
let blocosFixos = [];

// Formatos e cores das peças
const modelosPecas = [
    { cor: "#38bdf8", blocos: [[0,0],[1,0],[2,0],[3,0]] },
    { cor: "#a78bfa", blocos: [[0,0],[1,0],[0,1],[1,1]] },
    { cor: "#fb7185", blocos: [[1,0],[0,1],[1,1],[2,1]] },
    { cor: "#4ade80", blocos: [[0,0],[0,1],[0,2],[1,2]] },
    { cor: "#facc15", blocos: [[1,0],[2,0],[0,1],[1,1]] },
    { cor: "#fb923c", blocos: [[0,0],[1,0],[2,0],[2,1]] },
    { cor: "#f87171", blocos: [[0,0],[1,0],[1,1],[2,1]] }
];

// Botão Começar inicia uma partida
btnComecar.addEventListener("click", iniciarJogo);

// Botão Jogar novamente volta para a tela inicial
btnJogarNovamente.addEventListener("click", function() {
    clearInterval(intervaloQueda);

    jogoAtivo = false;
    pecaAtual = null;

    telaResultado.hidden = true;
    telaJogo.hidden = true;
    telaInicial.hidden = false;
});

// Inicia ou reinicia os dados do jogo
function iniciarJogo() {
    clearInterval(intervaloQueda);

    telaInicial.hidden = true;
    telaResultado.hidden = true;
    telaJogo.hidden = false;

    tabuleiro.innerHTML = "";
    blocosFixos = [];
    pecaAtual = null;
    pontuacao = 0;
    pontuacaoElemento.textContent = pontuacao;
    jogoAtivo = true;

    if (!musicaLigada) ativarMusica();

    iniciarNovaPeca();
}

// Cria uma peça aleatória
function iniciarNovaPeca() {
    if (!jogoAtivo) return;

    const modelo = modelosPecas[
        Math.floor(Math.random() * modelosPecas.length)
    ];

    pecaAtual = {
        blocos: modelo.blocos.map(bloco => [...bloco]),
        cor: modelo.cor
    };

    // Sorteia uma posição horizontal válida
    const larguraPeca = Math.max(
        ...pecaAtual.blocos.map(bloco => bloco[0])
    ) + 1;

    const colunaMaxima = COLUNAS - larguraPeca;

    posicaoX = Math.floor(
        Math.random() * (colunaMaxima + 1)
    );

    posicaoY = 0;

    if (colide(posicaoX, posicaoY)) {
        pecaAtual = null;
        terminarJogo();
        return;
    }

    desenharTabuleiro();

    clearInterval(intervaloQueda);
    intervaloQueda = setInterval(descerPeca, 500);
}

// Verifica colisões
function colide(x, y) {
    if (!pecaAtual) return false;

    return pecaAtual.blocos.some(function(bloco) {
        const bx = x + bloco[0];
        const by = y + bloco[1];

        return (
            bx < 0 ||
            bx >= COLUNAS ||
            by < 0 ||
            by >= LINHAS ||
            blocosFixos.some(fixo => fixo.x === bx && fixo.y === by)
        );
    });
}

// Gira a peça
function girarPeca() {
    if (!jogoAtivo || !pecaAtual) return;

    const formaAnterior = pecaAtual.blocos;

    let novaForma = formaAnterior.map(function(bloco) {
        return [-bloco[1], bloco[0]];
    });

    const menorX = Math.min(...novaForma.map(bloco => bloco[0]));
    const menorY = Math.min(...novaForma.map(bloco => bloco[1]));

    novaForma = novaForma.map(function(bloco) {
        return [
            bloco[0] - menorX,
            bloco[1] - menorY
        ];
    });

    pecaAtual.blocos = novaForma;

    if (colide(posicaoX, posicaoY)) {
        pecaAtual.blocos = formaAnterior;
        return;
    }

    desenharTabuleiro();
}

// Faz a peça descer
function descerPeca() {
    if (!jogoAtivo || !pecaAtual) return;

    if (!colide(posicaoX, posicaoY + 1)) {
        posicaoY++;
        desenharTabuleiro();
    } else {
        fixarPeca();
    }
}

// Fixa a peça no tabuleiro
function fixarPeca() {
    clearInterval(intervaloQueda);

    pecaAtual.blocos.forEach(function(bloco) {
        blocosFixos.push({
            x: posicaoX + bloco[0],
            y: posicaoY + bloco[1],
            cor: pecaAtual.cor
        });
    });

    pecaAtual = null;

    limparLinhas();
    desenharTabuleiro();

    setTimeout(iniciarNovaPeca, 250);
}

// Remove linhas completas
function limparLinhas() {
    for (let y = LINHAS - 1; y >= 0; y--) {
        const linhaCompleta = Array.from(
            { length: COLUNAS },
            (_, x) => blocosFixos.some(
                bloco => bloco.x === x && bloco.y === y
            )
        ).every(Boolean);

        if (linhaCompleta) {
            blocosFixos = blocosFixos
                .filter(bloco => bloco.y !== y)
                .map(bloco => bloco.y < y
                    ? { ...bloco, y: bloco.y + 1 }
                    : bloco
                );

            pontuacao += 100;
            pontuacaoElemento.textContent = pontuacao;

            y++;
        }
    }
}

// Desenha os blocos
function desenharTabuleiro() {
    tabuleiro.innerHTML = "";

    function desenharBloco(x, y, cor) {
        const bloco = document.createElement("div");
        bloco.classList.add("peca");

        bloco.style.left = x * tamanhoBloco + "px";
        bloco.style.top = y * tamanhoBloco + "px";
        bloco.style.backgroundColor = cor;

        tabuleiro.appendChild(bloco);
    }

    blocosFixos.forEach(function(bloco) {
        desenharBloco(bloco.x, bloco.y, bloco.cor);
    });

    if (pecaAtual) {
        pecaAtual.blocos.forEach(function(bloco) {
            desenharBloco(
                posicaoX + bloco[0],
                posicaoY + bloco[1],
                pecaAtual.cor
            );
        });
    }
}

// Controles do teclado
document.addEventListener("keydown", function(event) {
    if (!jogoAtivo || !pecaAtual || telaJogo.hidden) return;

    const teclasJogo = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp"
    ];

    if (teclasJogo.includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
        moverPeca(-1);
    }

    if (event.key === "ArrowRight") {
        moverPeca(1);
    }

    if (event.key === "ArrowDown") {
        descerPeca();
    }

    if (event.key === "ArrowUp") {
        girarPeca();
    }
});

// Move a peça para os lados
function moverPeca(direcao) {
    if (!jogoAtivo || !pecaAtual) return;

    if (!colide(posicaoX + direcao, posicaoY)) {
        posicaoX += direcao;
        desenharTabuleiro();
    }
}

// Controles para celular
btnEsquerda.addEventListener("click", function() {
    moverPeca(-1);
});

btnDireita.addEventListener("click", function() {
    moverPeca(1);
});

btnGirar.addEventListener("click", girarPeca);
btnDescer.addEventListener("click", descerPeca);

// Mostra a terceira tela
function terminarJogo() {
    jogoAtivo = false;
    clearInterval(intervaloQueda);

    telaJogo.hidden = true;
    telaResultado.hidden = false;

    pontuacaoFinal.textContent = pontuacao;
}



// Música retrô do desafio
let contextoAudio = null;
let intervaloMusica = null;
let notaAtual = 0;
let musicaLigada = false;

const notasRetro = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50,
    783.99, 659.25, 587.33, 523.25
];

function tocarNota(frequencia) {
    if (!contextoAudio || !musicaLigada) return;

    const oscilador = contextoAudio.createOscillator();
    const volume = contextoAudio.createGain();

    oscilador.type = "square";
    oscilador.frequency.value = frequencia;
    volume.gain.setValueAtTime(0.001, contextoAudio.currentTime);
    volume.gain.exponentialRampToValueAtTime(
        0.12,
        contextoAudio.currentTime + 0.01
    );
    volume.gain.exponentialRampToValueAtTime(
        0.001,
        contextoAudio.currentTime + 0.13
    );

    oscilador.connect(volume);
    volume.connect(contextoAudio.destination);
    oscilador.start();
    oscilador.stop(contextoAudio.currentTime + 0.14);
}

async function iniciarMusica() {
    if (!musicaLigada) return;

    const AudioContextAPI =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextAPI) {
        throw new Error("Este navegador não suporta áudio Web Audio.");
    }

    if (!contextoAudio) {
        contextoAudio = new AudioContextAPI();
    }

    if (contextoAudio.state !== "running") {
        await contextoAudio.resume();
    }

    if (contextoAudio.state !== "running") {
        throw new Error("O navegador não permitiu iniciar o áudio.");
    }

    if (intervaloMusica !== null) return;

    notaAtual = 0;
    tocarNota(notasRetro[notaAtual]);
    intervaloMusica = setInterval(() => {
        notaAtual = (notaAtual + 1) % notasRetro.length;
        tocarNota(notasRetro[notaAtual]);
    }, 180);
}

function pararMusica() {
    if (intervaloMusica !== null) {
        clearInterval(intervaloMusica);
        intervaloMusica = null;
    }
}

async function ativarMusica() {
    musicaLigada = true;
    try {
        await iniciarMusica();
        btnMusica.textContent = "🔊 Música ligada";
    } catch (erro) {
        musicaLigada = false;
        btnMusica.textContent = "⚠ Áudio indisponível";
        console.error("Não foi possível iniciar a música:", erro);
    }
}

async function alternarMusica() {
    if (!musicaLigada) {
        await ativarMusica();
        return;
    }

    musicaLigada = false;
    pararMusica();
    btnMusica.textContent = "🔇 Música desligada";
}

const btnMusica = document.getElementById("btnMusica");
btnMusica.textContent = "🔇 Música desligada";
btnMusica.addEventListener("click", alternarMusica);