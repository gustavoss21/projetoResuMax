let clicked_tecla = false
let script_text = document.getElementById('date-input')
let folhas_renderizadas = false
let btn_mais_folha = document.querySelector('#maisfolha')
let text_pdf
if (script_text) {
    text_pdf = JSON.parse(script_text.textContent);
    script_text.remove()
}
let value_temporario = document.getElementById('temporario-dados')
if (value_temporario) {
    value_temporario = JSON.parse(value_temporario.textContent);
}

function salvarNoStorage(chave, valor) {
    localStorage.setItem(chave, valor)
}

async function loadFilter() {
    let filtro = localStorage.getItem('filtro')
    let filtro_destaque = localStorage.getItem('filter-destaque')
    let filtro_importante = localStorage.getItem('filter-importante')
    let filtro_subtema = localStorage.getItem('filter-subtema')
    let filtro_topico = localStorage.getItem('filter-topico')
    let lista_filter = [filtro_destaque, filtro_importante, filtro_subtema, filtro_topico]
    let checked_filter = document.querySelector("#bloco-right #filtro")

    if (filtro === 'true') {
        checked_filter.checked = true
        for (let filter_item of lista_filter) {
            filter_item = filter_item.split(',')
            if (filter_item[0] === 'true') {
                document.getElementById(filter_item[1]).checked = true
            } else {
                document.getElementById(filter_item[1]).checked = false

            }
        }

    }
    definicoesFilter()
}

function loadFolhaModo() {
    modo_leitura = localStorage.getItem('modoLeitura')
    // load modo leitura do Storage
    if (modo_leitura === 'true') {
        ativaModoLeitura()
        
    } else {
        desativaModoLeitura()

    } 
}

criaElementoFolha()
console.log(lista_Quill)
loadFolhaModo()
loadFilter()
adicionaFucaoTextoToolbar()
setBotao()//salva os tipos de texto

definicoesSelecaoTexto();//faz atribuiçoes de selecao,para salvar.
lista_Quill.forEach(element => {
    element.on('selection-change', () => {
      
        definicoesSelecaoTexto()
    })
});

submitForm()

mudaCheckBox()//define checkBox.checked como true, se clicado no seu parent

btn_baixar_resumo.addEventListener('click', function () {
    geraPdf()
 
})

checked_filter.addEventListener('click', function () { definicoesFilter() })

$('#btn-salvar-conteudo').on('click', function () {
    salvarConteudo()
    // return location.reload()
})
