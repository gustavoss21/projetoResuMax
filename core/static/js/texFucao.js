let csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value
let btn_topico
let btn_destaque
let btn_importante
let folha_camuflada
let selection_text
let selection_folha_index
let selection_index
let selection_length
let cont = 0

function retorna_html() {
    let conteudo = ''

    $('.ql-editor').each((i,pagina)=>{
        elemento_vazio = pagina.firstElementChild
        conteudo += pagina.innerHTML
    })

    if ((conteudo.replace(/<[^>]*>/g, '')).length <= 1){
        conteudo = false
    }
    return conteudo
}

function salvarConteudo() {
    let html_sheets = retorna_html()
    origin = location.origin

    if(!html_sheets)return

    $.ajax({type:'POST',
        headers: {
            'X-CSRFToken': csrf_token
        },
        url: `${origin}/salvarConteudo/`,
        data:html_sheets,
        success: data=>{
            let data_object = JSON.parse(data)

            if (data_object.redirect) {
                salvarNoStorage('texto_temporario',html_sheets)
                location.assign('usuario/accounts/login/');
            }
            anitionSavedContedudo()
        },
        error:error=>{
            console.log('errro ' + error)
        }
    })
}

function anitionSavedContedudo(){
    $('.visibled-main').css('display','none')
    $('.icon-saved').fadeIn('fast')
  
    window.setTimeout(()=>{
        $('.icon-saved').css('display','none')
        $('.visibled-main').fadeIn('slow')
  
    },3000)
    
}

function save_filter_item(selection_type) {
    if (! selection_text) return

    fetch("/save-filter-item/", {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify(
            {
                'type':selection_type,
                'text': selection_text,
                'index': selection_index,
                'tamanho': selection_length,
                'folha_index': selection_folha_index
            }
        )
    }).then(function (data) {
        return data.json()
    }).then(function (data) {
        tiraSelecao(selection_folha_index, selection_index)
    })


}


/**
* - cria uma caixa de opçoes, que darao funcionalidades, como, definir um topico, ao texto.
* - fucionalidades[topico,destaque,destaque]
* - return caixa_selecao(div com todas funcionalidades)
*/
function criaSeletor() {
    let caixa_selecao = document.createElement('div')
    let title = document.createElement('span')
    let div_opcoes_selecao = document.createElement('div')
    let filter_types = ['destaque','topico','importante']

    div_opcoes_selecao.setAttribute('class','conteudo-selecao')
    caixa_selecao.setAttribute('class', 'selecao')
    title.setAttribute('class', 'title-selecao')
    title.innerText = 'definir como:'
    caixa_selecao.appendChild(title)

    for(let v of filter_types){
        let btn = cria_elemento_seletor(v)
        div_opcoes_selecao.appendChild(btn)
    }
    caixa_selecao.appendChild(div_opcoes_selecao)
    return caixa_selecao
}
function cria_elemento_seletor(type){
    let btn = document.createElement('div')
    btn.setAttribute('class', `btn-${type}`)
    btn.innerText = type
    return btn
}

/**
 * adiciona caixa_seletor na toolbar
 */ 
function adicionaFucaoTextoToolbar() {
    let toolbxx = document.querySelectorAll(".ql-toolbar")

    for (let box of toolbxx) {
        let seltor_existe = box.querySelector('.selecao')
        box.parentElement.style.zIndex = 1
        if (!seltor_existe) {
            box.appendChild(criaSeletor())
        }
    }   
}

/**
 * faz atribuição a elementos que sera salvo, como texto, index, length e o index da folha
*/
function definicoesSelecaoTexto() {
    for (const q of lista_Quill){
        q.on('selection-change', function(range, oldRange, source) {

            if (range) {
                selection_index = range.index;
                selection_text = q.getText(range.index, range.length);
                selection_folha_index = lista_Quill.indexOf(q)
                selection_length = range.length
            }  
        })
    }
}

/**
 * evita que o folha sopreponha a toolbar ou outros itens
 * 
 * HÁ NECESSIDADE?
 */
function setSuperimposeSheet(superimpose_index = 0) {
    let folhas = document.querySelectorAll(".ql-editor")
    //remove sheet override permission via toolbar
    if (folhas[folha_camuflada]) {
        folhas[folha_camuflada].parentElement.style.position = 'relative'
        folhas[folha_camuflada].style.position = 'relative'
    }
    //allows overlapping of the sheet by the toolbar
    if (folhas[superimpose_index]) {
        folhas[superimpose_index].style.position = 'static'
        folhas[superimpose_index].parentElement.style.position = 'static'

        folha_camuflada = superimpose_index
    }
}

/**
adiciona o evento click nos botoes do caixa_seletor 
*/ 
function setBotao() {
    let btn_set_filter = document.querySelectorAll(".conteudo-selecao")
    for (let btn of btn_set_filter) {
        btn.addEventListener('click',e => {
            let class_filter = e.target.getAttribute('class')
            let filter_type = (class_filter.split('-'))[1]

            save_filter_item(filter_type)    
        }
        )
    }
    
}

function tiraSelecao(index_quill,index) {
    lista_Quill[index_quill].setSelection(index, 0, "silent")
}

function submitForm() {
    const add_pdf_btn = document.querySelector('#avatar')
    
    add_pdf_btn.addEventListener("change", function () {
        
        add_pdf_btn.parentElement.submit()
    })
    
}

function pdfAdd(data) {
    let palavras = data.split('. ')

    for (let index = 0; index < palavras.length; index++) {
        palavras[index] = `<p>${palavras[index]}.</p>`
    }
    return palavras.join('')
   
}
function control_v_or_x(){
    var ctrl=window.event.ctrlKey;
    var tecla=window.event.keyCode;

    if (ctrl && (tecla==86|tecla==88)) return true
}

function getSelecao() {
    let control_key = false

    document.addEventListener('keydown', btn => {
        control_key = control_v_or_x()
    })

    document.addEventListener('keyup', btn => {
       
        if(control_key){
            clickedTecla('controlV')
            return

        }

        let list_btn = ['Delete', 'ArrowUp', 'Backspace', 'ArrowDown','Enter']
        
        if (list_btn.indexOf(btn.key) === -1)return
        
        clickedTecla(btn)
    })
}

/**
 * verifica quais filter-text estao vazios e informa
 *  a seu respectivo filtro no html
 * @param {String} filter_item_name 
 */
function defineCheckItemVazio(filter_item_name) {
    let tes = document.querySelector(".item-vazio-" + filter_item_name)
    if (!(tes)) {
        let lista_vazia = document.createElement('span')
        let texto = document.createTextNode('vazio!')

        lista_vazia.appendChild(texto)
        lista_vazia.setAttribute('class', 'item-vazio-' + filter_item_name)
        lista_vazia.style.color = '#00000070'

        document.querySelector('#' + filter_item_name).parentElement.appendChild(lista_vazia)
    }

}

async function get_filter_items(filter_items) {
    let data_object

    await  $.ajax({type:'GET',
        url: `${origin}/filter-items/${filter_items}`,
        success: data=>{
            data_object = JSON. parse(data)

            if (data_object.redirect) {
                location.assign('usuario/accounts/login/');
            }
        },
        error:error=>{
            console.log('errro ' + error)
        }
    })
    return data_object
}

async function getSheetData() {
    const response = await fetch('/get-sheet-data/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    const customer = response.json()
    return customer
    
}
/**
 * evita que a folha sobreponha o filtro e outros elementos da barra lateral
 */
document.addEventListener('click', event => {
    let btn_adiciona_arquivo = document.querySelector('#btn-adicionar-pdf')
    let btn_filter = document.querySelector('#btn-filter')
    let bloco_center = document.querySelector('#bloco-center')
    let btn_class = []

    btn_class.push(btn_adiciona_arquivo.getAttribute('class'))
    btn_class.push(btn_filter.getAttribute('class'))

    for (let btn of btn_class) {
        if (btn.search('show') != -1) {
            bloco_center.style.zIndex = -1
            return
        }
    }

    bloco_center.style.zIndex = 'initial'

})

