let checked_filter = document.querySelector("#bloco-right #filtro")
let btn_baixar_html = document.querySelector('#btn-baixar-pdf')
let btn_nova_folha = document.querySelector('#btn-nova-folha')

let Lista_checked_true = []


// cria uma folha em branca
btn_nova_folha.addEventListener('click', () => {
    let folhas = document.querySelectorAll('.editor')
    for (let elemento of lista_Quill) {
        if (!elemento.getSelection()) {
            continue
        }
        let index = [...folhas].indexOf(elemento.container)
        if (index != -1) {
            return  novaFolha(false,true,index+1)
        }
    }
    novaFolha(false, true)
})

/**
 * aplica definiçoes de acordo com o tipo de folha
 * @tipos_de_folha [editor, leitura, filtro]
 * @param {Boolean} recarrega se true recarrega a pagina
 * @returns 
 */
function setTypeSheet() {
    let folhas = document.querySelectorAll('.editor')
    let checked_item = document.querySelectorAll("#bloco-right .dropdown-item")
    let sheet_mode = localStorage.getItem('sheet-mode')
    let mode_sheet_filter = localStorage.getItem('mode-filter')
    
    if (mode_sheet_filter == 'true') {
        set_btn_side(true)
        // esconde as folhas     
        $('.editor').hide()
        if($("#folha-leitura").length > 0 ){$("#folha-leitura").remove()}
        
        // habilite  checkBox from filter item
        for (let item of checked_item) {
            item.children[0].disabled = false;
        }
        mode_filter()
        return
    }else{
        // deabilite checkbox filter
        $('#btn-filter')[0].checked = false
        for (let item of checked_item) {
            item.children[0].disabled = true;
        }

        if($(".sheet-filter").length > 0) $(".sheet-filter").remove()

        set_btn_side(false)
        if (sheet_mode == 'leitura') {
            $('.sheet-editable').hide()
            $('.edit').prop('disabled', true)
            read_mode_sheet()
            return
        }
        if(sheet_mode == 'editor'){
            $('.edit').prop('disabled', false)

            if($("#folha-leitura").length > 0 ){$("#folha-leitura").remove()}

            filter_mode_sheet()

        }
    }
   
}
/**
 * ouve evento de click nos elementos html que contem o input filter
 */
function mudaCheckBox() {
    let click_checkbox = false
    let checked_item = document.querySelectorAll("#bloco-right .dropdown-item")
    // ao clicar no elemento <li> muda o valor do checkBox
    for (const value of checked_item) {
        console.log(value)
        //se foi clicado diretamente no checkBox,a funcao nao precisa ser executada
        value.children[0].addEventListener("click", function () {
            click_checkbox = true
            
            if (value.children[0].checked) {
                changeCheckBoxFilterItem(value.children[0],true)
            } else {// se clicar no elemeno <input> salva no storage o checked
                changeCheckBoxFilterItem(value.children[0],false)
            }
            mode_filter(true)
            salvarNoStorage('filter-' + this.value, [this.checked, this.value])
        }, true)
        // fucao que muda o checkBox
        value.addEventListener("click", async function () {

            let checkbox_filter = value.children[0]
            // se clicar no checkBox, fecha a fucao
            if (click_checkbox) {
                click_checkbox = false
                return check_active_filters()
            }
            // se o filtro nao tiver ativado, fecha a fucao
            if (!checked_filter.checked) {
                return
            }
            // se clicar no elemeno <li> munda o checkBox para true
            if (checkbox_filter.checked) {
                changeCheckBoxFilterItem(checkbox_filter,false)
            } else {// se clicar no elemeno <li> munda o checkBox para false
                changeCheckBoxFilterItem(checkbox_filter,true)
            }
            mode_filter(true)
            return check_active_filters()
        })
    }
}
/**
 *muda o valor do checkbox do item do filtro e salva no storage
 * @param {Element} input checkbox do item do filtro
 * @param {Boolean} boolen checked que será dinido no input
 */
function changeCheckBoxFilterItem(input,boolen) {
    input.checked = boolen
    salvarNoStorage('filter-' + input.value, [boolen,input.value])
}
/**
 * verifica quais filtros estao ativos
 * @returns {Array} active_filters
 */
function check_active_filters() {
    let filters_checked = document.querySelectorAll('.check-container input')
    let active_filters = []

    if(! $('#filtro')[0].checked) return []

    for (let filter_checked of filters_checked) {
        let filter_type = filter_checked.value

        if (filter_checked.checked) {
            active_filters.push(filter_type)
        }
    }
    return active_filters
}

async function mode_filter(exist){
    salvarNoStorage('mode-filter',true)
    if(exist){
        if($(".sheet-filter").length > 0) $(".sheet-filter").remove()
        $('.conteinar-tex-funcao').remove()
    }
    let active_filters = check_active_filters()
    let data_filters = []
    let data_filters_edited = []

    if (active_filters.length >= 1 ){
        data_filters = await get_filter_items(active_filters)
    } 
    for(let v of active_filters){
        if(!data_filters[v]){
            defineCheckItemVazio(v)
            console.log()
            continue
        }
        console.log(data_filters[v])
        data_filters_edited.push(...data_filters[v])

    }
    console.log(data_filters_edited)
    create_html_to_filters(data_filters_edited)
    // events
    delete_filter_item()
    execultaApagaTexto()
}
/**
 * cria todos os campos de filtro e define todos os seus valores
 */
function create_html_to_filters(lista_funcoes_texto) {
    // btn_baixar_resumo = document.querySelector('button')
    let btn_baixar_resumo = document.createElement('button')
    let div_container = document.createElement('div')
    div_container.setAttribute('class', 'conteinar-tex-funcao')
    div_container.innerHTML = ''

    let content_filter_text = document.createElement('div')
    content_filter_text.setAttribute('class','p-1 bg-light')

    let sheet_text = ''
    let nova_lista

    btn_baixar_resumo.setAttribute('id','btn-baixar-resumo')
    btn_baixar_resumo.setAttribute('class','btn btn-secondary')
    btn_baixar_resumo.innerHTML = 'baixar resumo'
    
    div_container.appendChild(btn_baixar_resumo)
    $('.barra-lateral-esquerda').append(div_container)
    if (lista_funcoes_texto.length > 1) {
        nova_lista = lista_funcoes_texto.sort(compare)

    } else {
        nova_lista = lista_funcoes_texto
    }

    for (let filter_item of nova_lista) {
        sheet_text += ' ' + filter_item.text
        let div_fucao_texto = document.createElement('div')
        div_fucao_texto.setAttribute('class', `text-fucao text-${filter_item.type} input-group mb-1`)
        div_fucao_texto.setAttribute('id', filter_item.id)
        
        let new_p = `<textarea style="resize: none;" aria-label="X" class="form-control" readonly>
                        ${filter_item.text}
                    </textarea>`
        
        let span_delete = `<span class="input-group-text delete-tex-fucao">X</span>`
        
        $(div_fucao_texto).append(new_p)
        $(div_fucao_texto).append(span_delete)
        content_filter_text.appendChild(div_fucao_texto)
    }    
    if(sheet_text.length <= 1){
        btn_baixar_resumo.setAttribute('disabled',true)
        content_filter_text.setAttribute('hidden','hidden')
    }

    div_container.appendChild(content_filter_text)
    let folha_filter = `
    <div class="editor ql-container sheet-filter" id="folha-leitura">
        <div class="ql-editor">${sheet_text}</div>
    </div>`
    $("#bloco-center").append(folha_filter)
    let textarea = document.querySelectorAll('.conteinar-tex-funcao textarea')
    for(let t of textarea){
        t.style.height = t.scrollHeight+'px'
        t.style.overflow = 'hidden'
    }
}

function compare(a, b) {
    if (a.folha_index < b.folha_index || (a.folha_index === b.folha_index && a.index < b.index)) {
        return -1;
    } else {
        return true
    }
}

/**
* responsavel por apagar o texte do filtro
*/
function execultaApagaTexto() {   
    let btn_apaga_texto = document.querySelectorAll('.delete-tex-fucao')
    //('execultaApagaTexto')
    //(btn_apaga_texto)
    for (const elemeno of btn_apaga_texto) {
        elemeno.addEventListener('click', event => {
            let div_text = event.target.parentElement
            let class_div = div_text.getAttribute('class').slice(11,)
            class_div = class_div.split('-')[1]
            let class_div_id = div_text.getAttribute('id')
            apagadorTextFucao(class_div_id)
        })
    }
    return
}


function apagadorTextFucao(id) {
    let csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value
    $.ajax({
        type:'POST',
        url: `/apagadorTextoFucao/`,
        headers: {
            'X-CSRFToken': csrf_token
        },
        data: JSON.stringify({'id': id }),
        dataType:'json',
        success: ()=>{
            // delete_item_html_filter(id)

            mode_filter(true)
        },
        error:datas=>{console.log(datas)}
        });
   
}

function delete_item_html_filter(tipo,id){
    let filter_item = $(`.text-${tipo}#${id}`)
    console.log(`.text-${tipo}#${id}`)
    filter_item.remove()
    
    if($(`.text-${tipo}`).length < 1){
        defineCheckItemVazio(tipo)
    }
    

}

function clickedTecla(btn) {
    let cursor = document.getSelection()
    let folhas = document.querySelectorAll('.ql-editor')

    if (!cursor.anchorNode) {
        return false
    }
    let cursor_node = cursor.anchorNode

    // certifica que o cursor_node seja um paragrafo
    if (cursor_node.nodeName === '#text') {
        cursor_node = cursor.anchorNode.parentNode
    }
    let folha = cursor_node.parentElement
    let index_folha = [...folhas].indexOf(folha)
    // certica que tenha o index da folha
    if (index_folha === -1) {
        folha = cursor_node.parentElement.parentElement
        index_folha = [...folhas].indexOf(folha)

    }

    let getSeletor = lista_Quill[index_folha]
    if (!getSeletor) return false

    getSeletor = getSeletor.getSelection()
    let index_seletor = getSeletor.index
    if(btn === 'controlV'){
        SeMudanca(index_folha)
        
    }else if (btn.key === 'Enter') {
        //desce texto que passar 
        if(folha.offsetHeight < folha.scrollHeight){
            let seletor
            let seletor_p
            let func_seletor = ()=>{
                seletor = window.getSelection()
                seletor_p = seletor.anchorNode
            }
            func_seletor()
            
            //certifica que o seletor_p é um parágrafo e evitar obter #text no lugar de <p>
            seletor_p = seletor_p.nodeName == 'P'? seletor_p:seletor_p.parentNode
            let proxima_folha = folhas[index_folha+1]

            if(seletor_p === folha.lastChild){
                if(!proxima_folha){
                    proxima_folha = novaFolha(true)
                    
                }
                let last_paragraph = folha.lastElementChild
                $(proxima_folha).prepend(last_paragraph.outerHTML)
                last_paragraph.remove()
                // lista_Quill[index_folha+1].setSelection(1,0,'api')
                setCursor(proxima_folha.firstChild)
                return
            }
            if (!proxima_folha) {
                proxima_folha = novaFolha(true)
            }

            let elements_down = downText(folhas[index_folha])
            if (elements_down) {
                lista_conteudo += elements_down
                setTextSheet(proxima_folha,lista_conteudo,false)
            }
            seletor_p = folha.children[getSeletor.index]
            setCursor(seletor_p)

        }
        
    }else if (btn.key === 'Backspace'){
        
        if (!(folha.innerText.length > 1) && index_folha > 0) {
            let folha_anterior = folhas[index_folha - 1]
            if(! folha_anterior) return
            let last_children = folha_anterior.lastChild
            folha.parentElement.remove()//remove folha vazia
            lista_Quill.splice(index_folha,1)//remove quill
            setCursor(last_children)
            return
        }
        if (index_seletor === 0 && folhas[index_folha - 1]) {
            let elemeno = folhas[index_folha - 1].lastChild
            setCursor(elemeno)
            return moveTextUp(folhas[index_folha - 1], folhas[index_folha])
        }

        let proxima_folha = folhas[index_folha + 1]
        return moveTextUp(folhas[index_folha], proxima_folha)

    }else if (btn.key === 'Delete'){
        return moveTextUp(folhas[index_folha], proxima_folha)
        
    } else if (btn.key == 'ArrowUp') {
        if (index_seletor === 0 && folhas[index_folha - 1]) {
            let elemeno = folhas[index_folha - 1].lastChild
            setCursor(elemeno)
            return
        }
    } else if (btn.key == 'ArrowDown') {
       
        let next_sheet = folhas[index_folha + 1]

        if (! next_sheet) return
        let p_limite = $('.limite')[index_folha]

        if (cursor_node==p_limite) {
            let elemeno = next_sheet.firstChild
            setCursor(elemeno)
            return
        }
    }
}

function geraPdf() {
    let html = $(".sheet-filter")[0].innerText
    let pdf = new jsPDF('p','in','a4')
    let ultimo_index = 50
    let primeiro_index = 0
    let textlines = pdf.setFont('Arial')
        .setFontSize(12)
        .splitTextToSize(html, 6.25);
    
    let total_paginas = Math.ceil(textlines.length / 50)
    let verticalOffset = 1

    for (let cont = 1; cont <= total_paginas; cont++){
        let lines_page = textlines.slice(primeiro_index,ultimo_index)

        pdf.text(1, verticalOffset + 12 / 72, lines_page)
        verticalOffset += (lines_page.length + 1) * 12 / 72;

        primeiro_index = ultimo_index
        ultimo_index += 50
        if (textlines.length < ultimo_index) {
            ultimo_index = textlines.length
        }
        if (!(cont === total_paginas)) {
            pdf.addPage()
            verticalOffset = 1

        }

    }
    
    pdf.save('meu_reumo.pdf')
}
/**
 * define os botoes da barra lateral para o filtro ou editor 
 * @param {Boolean} filter 
 */
function set_btn_side(filter) {
    if(filter){
        $('.conf-sheet').hide()
        return
    }
    $('.conf-sheet').show()
    $('.conteinar-tex-funcao').remove()
}

function btnLeituraActive (){
    
    let path = location.href
    if (path === 'http://127.0.0.1:8000/adiciona-arquivo/') {
    //('iguais')
        $('#btn-leitura').attr('disabled',true)
    } else {
        $('#btn-leitura').attr('disabled',false)
    }
}

/**
 * define um ultimo paragrafo para a folha para delimitar o fim
 * @param {Element} folha 
 */
function paragrafoDeLimite(){
    let ql_editor = $('.ql-editor')
    //evitar error, no folha filter nao precisa do paragrafoDeLimite()
    if($('.sheet-filter').length > 0) return

    for(let c=0; c< ql_editor.length; c++){
        let editor = ql_editor[c].lastChild
        if(!editor)return
        let height = editor.offsetTop

        if (height <= ql_editor[c].offsetHeight/5)continue
        $('.limite')[c].remove()
        let p_limite = document.createElement('p')
        $(p_limite).addClass('limite').css('background','red')

        $(v).append(p_limite)
    }

}

function delete_filter_item(){
    let btn_baixar_resumo = document.querySelector('#btn-baixar-resumo')
    btn_baixar_resumo.addEventListener('click', function () {
        geraPdf()
    })
}