const btnComecar = document.getElementById("btnComecar");
const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");

btnComecar.addEventListener("click", function() {
    telaInicial.hidden = true;
    telaJogo.hidden = false;
});