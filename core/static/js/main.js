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

/**
 * recarrego os estado dos filtros. 
 */
function loadFilter() {
    let filter_is_active = localStorage.getItem('mode-filter')
    let filters = ['destaque','importante','topico']
    let checked_filter = document.querySelector("#bloco-right #filtro")

    if (filter_is_active === 'true') checked_filter.checked = true

    for (let filter_item of filters) {

        let filter_item_exist = localStorage.getItem('filter-'+filter_item)

        if(! filter_item_exist)continue

        let filter_item_is_active = filter_item_exist.split(',')[0]
        let element_filter = $(`#${filter_item}`)[0]

        if (filter_item_is_active === 'true') {
            element_filter.checked = true
        } else {
            element_filter.checked = false

        }
    }
}

loadFilter()
criaElementoFolha()
setTypeSheet()
adicionaFucaoTextoToolbar()
submitForm()
mudaCheckBox()

checked_filter.addEventListener('click', () => {
    if(checked_filter.checked){
        salvarNoStorage('mode-filter',true)
    }else{
        salvarNoStorage('mode-filter',false)
        
    }
    setTypeSheet()
})

$('#btn-salvar-conteudo').on('click', function () {
    salvarConteudo()
})
