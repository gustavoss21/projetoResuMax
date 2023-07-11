let btn_leitura = document.querySelector('#btn-leitura')
let body = document.getElementsByTagName('body')[0]
let input_range = document.querySelector('#customRange1')
let alturaFolha
let tamanho_font
let nova_folha
let clone_conteudo
var conta_folha = 0
var interador_folha = 0
let mais_folha = false
let paginas = 5

//faz com que o dropdown nao suma ao clicar no item
$("#bloco-right").on('click', '.dropdown-item', function (event) { event.stopPropagation(); });

function criaElementoFolha() {
    let bloco_center = document.createElement('div')
    let conteudo_central = document.querySelector('#conteudo-central')

    conteudo_central.appendChild(bloco_center)

    bloco_center.setAttribute('id', 'bloco-center')

}


/**
 * ajusta a largura das folhas de acordo com o input range
 * execulta as funcoes ajustaTamanhoFont e ajustaAlturaFolha
 * @param {*} folha 
 */
function defineTamanhoFolha() {
    let inputRange = document.querySelector('#customRange1')
    let largura_center = $('#conteudo-central')[0].offsetWidth
    let largura = largura_center * (inputRange.value / 100)

    if(largura >= largura_center) largura = largura_center

    $("#bloco-center").css('width',largura + 'px')
    
    ajustaTamanhoFont()
    ajustaAlturaFolha()
}

/**
 * ajusta a altura da folha de acordo com a largura da pagina
 * @param {*} folha 
 */
function ajustaAlturaFolha() {
    let sheet_content = document.querySelector('.editor')
    let largura_folha = sheet_content.offsetWidth
    let altura_folha = largura_folha * 1.414285714

    $(".editor").css('height',altura_folha+'px')
}

/**
 * ajusta o tamanho da fonte de acordo com a folha
 * @returns 
 */
function ajustaTamanhoFont() {
    let checked_filter = document.querySelector("#bloco-right #filtro")
    let bloco_center = document.querySelector('#bloco-center')

    if (checked_filter.checked) {
        let tamanho_font = window.getComputedStyle(bloco_center).width.slice(0, -2) * 0.2

        bloco_center.style.fontSize = tamanho_font + '%'

        return
    }
    let folha = document.querySelector('.ql-editor')
    let tamanho_font = folha.offsetWidth * 0.25

    bloco_center.style.fontSize = tamanho_font + '%'
}

async function read_mode_sheet() {
    let bloco_center = document.querySelector('#bloco-center')
    let sheet_text = await mixinsetTextSheet()

    salvarNoStorage('sheet-mode','leitura')

    if(! sheet_text) sheet_text = ''

    let folha_leitura = `<div class="editor ql-container" id="folha-leitura">
                            <div class="ql-editor">${sheet_text}</div>
                        </div>`

    btn_leitura.firstElementChild.innerText = 'Editar'
    btn_leitura.lastElementChild.setAttribute('class', 'fa-solid fa-pen-to-square d-md-none')
    btn_leitura.style.background = '#94cfe3'

    $(bloco_center).append(folha_leitura)
}

function filter_mode_sheet() {
    let editor = document.querySelectorAll('.editor')

    btn_leitura.firstElementChild.innerText = 'Somente Leitura'
    btn_leitura.lastElementChild.setAttribute('class','fa-regular fa-eye d-md-none')
    btn_leitura.style.background = '#f2de78d4'

    salvarNoStorage('sheet-mode','editor')

    if(editor.length < 1){
        let folha = novaFolha(true)

        setTextSheet(folha)

        return
    }
    //folha editável fica visivel
    $('.editor').show()    
}

/**
 * // adiciona os textos na folha
 * 
 * @param {Element} folha elemento que sera definido o texto
 * @param {boolean|undefined} text se undefined sera requisitado o texto
 * @param {number|undefined} set_end if there is text coming from the text up or down event
 * @returns {FileCallback|null} setTextSheet
 */
async function setTextSheet(folha, text, set_end) {
    folhas_renderizadas = true
    paginas--

    if (!text) {

        text = await mixinsetTextSheet()

    }
    // render text event text up or down
    if(!(set_end===undefined)){

        set_end ? $(folha).append(text):$(folha).prepend(text)

    }else{
        let text_storage = localStorage.getItem('texto_temporario')

        if(text_storage){
            // localStorage.removeItem('texto_temporario')
            if(text){

                let replace = confirm('Parece que você tem dados salvo, deseja substituir belo novo?')
                if(replace){
                    $(folha).html(text_storage)
                    // salvarConteudo()
                }else{
                    $(folha).html(text)
                }
                localStorage.removeItem('texto_temporario')
            }else{
                $(folha).html(text_storage)
                // salvarConteudo()
            }
            $(folha).html(text_storage)
        }else{
            $(folha).html(text)
        }
    
        
    }

    let status_sheet_limite = checkLimitionSheet(folha)

    if (status_sheet_limite.passou) {
        text = downText(folha)
        let folha_index = ($('.ql-editor').index(folha))+1
        let next_sheet = $('.ql-editor')[folha_index]

        if(next_sheet){
            return setTextSheet(next_sheet,text,false)
        }

        folha = novaFolha(true)

        return setTextSheet(folha, text)
    }

    getSelecao()
    setBotao()
    definicoesSelecaoTexto()

   
}
/**
 *define o conteudo que sera renderizado
 * @returns text html
 */
async function mixinsetTextSheet() {
    if (text_pdf) {
        // renderiza_pdf = true
        return pdfAdd(text_pdf)
    }

    let data = await getSheetData()
    if ('vazio' === data) return false
    data = Object.values(data)[0]
    return data
}

/**
 * limita em apenas 1 elemento que passa o limite da folha
 * @param {*} folha 
 * @returns (ultimos: str, primeiro: elementHtml)
 */
function mixinDesceTexto(folha) {
    let lista_passou
    let index_pass 
    let pass = 1
    let lista_apagar
    let position_and = 0

    for( let p of folha.childNodes){
        let height_p = p.offsetHeight
        position_and += height_p

        if (position_and + 10 > folha.offsetHeight) {

            if (p.outerHTML) {
                if (pass > 0) {
                    pass -= 1

                    continue
                }

                index_pass = [...folha.children].indexOf(p)
                lista_passou = [...folha.children].slice(index_pass,)
                lista_apagar = lista_passou
                lista_passou = (lista_passou.map(htmlToString)).join('')
                break   
            }
        } 
    }

    
    $(lista_apagar).remove()

    return lista_passou   
}

function htmlToString(html) {
    return html.outerHTML
}

/**
 * desce text que não couber na folha
 * @param {Element} folha 
 * @returns {string} paragrafos  
 */
function downText(folha) {
    let paragraphs_down = mixinDesceTexto(folha) || ''
    let last_paragraph = folha.lastElementChild

    if(last_paragraph.innerText.length <= 2 ) return paragraphs_down

    let list_txt_last_p = geraListaInnerHTML(last_paragraph.innerHTML)
    let inner_html_down = ''
    let height_sheet = folha.offsetHeight
    let index 
    let inner_html_last_p
    let tags_close_list = []

    for (index = list_txt_last_p.length-2; index >= 0;) {

        if (!list_txt_last_p[index]){
            index -= 2
            list_txt_last_p.splice(index,2)

            continue
        }
        
        let height_p = folha.lastChild.offsetHeight
        let posicion_p = folha.lastChild.offsetTop
        let posicion_end = height_p+posicion_p

        if (posicion_end > height_sheet) {
            let text_end = (list_txt_last_p.splice(index,2)).join(' ')
            let tag_closed_found = /<\/.*>/.exec(text_end)
            let tag_open_found = /<[^\/](\S+).*?>/.exec(text_end)
            // gerencia as apertura e fechamento de tags
            if (tag_closed_found){
                 tags_close_list.push(tag_closed_found[0])
            }
            else if(tag_open_found){
                tags_close_list.pop()
            }
            // define o texto quebra
            inner_html_down = text_end+' '+ inner_html_down

            //adiciona o novo paragrafo atualizado, com todas as abertura e fechamento de tags
            if(list_txt_last_p.length === 1){
                let last_word = list_txt_last_p[0]

                inner_html_down = last_word+' '+ inner_html_down

                last_paragraph.remove()
            }
            inner_html_last_p = list_txt_last_p.join(' ')
            $(last_paragraph).html(inner_html_last_p)
            
            index -= 2
        } else {
        
            if(inner_html_down.length < 1) return paragraphs_down

            break
        }
    }


    if(tags_close_list.length > 0) {
        let tag = tags_close_list[0].slice(2,-1)
        let pathern = `(?<abertura><${tag}.*?>)`
        const re = new RegExp(pathern);
        let tag_open = inner_html_last_p.match(re)

        tag_open = tag_open? tag_open.groups.abertura:''
        inner_html_down = tag_open + inner_html_down
    }

    let first_paragraph = last_paragraph.cloneNode()

    first_paragraph.innerHTML = inner_html_down
   
    return first_paragraph.outerHTML+paragraphs_down
}
function geraListaInnerHTML(html){
    let pathern =  /(<.+?>)/g
    let lista = (html.split(pathern))

    for (let index=0; index < lista.length; index++){
        index = parseInt(index)
        
        if(!pathern.exec(lista[index])){
            if(lista[index].length < 1){
                lista.splice(index,1)
                index --
                continue
            }
            // remove space on both sides of strings
            lista[index] = lista[index].trim()
             
            let novo_element = lista[index].split(' ')
            lista.splice(index,1,...novo_element)
            index += novo_element.length 
            continue
        }

    }
    return lista
}
/**
 * passa todos os parágrafos que couber da sheet2  para a sheet1
 * @param {Document} sheet1 
 * @param {Document} sheet2 
 * @returns 
 */
function mixinMoveTextUp(sheet1,sheet2) {
    if(! sheet2|sheet1) return

    let sheet_altura = sheet1.offsetHeight
    let ultimo_p_sheet1 = sheet1.lastElementChild
    let ultimo_p_altura_sheet1 = ultimo_p_sheet1.offsetHeight
    let ultimo_p_posicao_sheet1 = ultimo_p_sheet1.offsetTop
    let espaco_usado_sheet1 = ultimo_p_altura_sheet1 + ultimo_p_posicao_sheet1
    let space_to_elements = sheet_altura - espaco_usado_sheet1
    let children_sheet2 = sheet2.children

    for (let index = 0; index < children_sheet2.length;) {
        let elemento = children_sheet2[index]
        let elemento_altura = elemento.offsetHeight

        if (elemento_altura <= space_to_elements) {
            let new_elemeto = elemento.outerHTML

            $(sheet1).append(new_elemeto)

            space_to_elements -= elemento_altura

            elemento.remove()
            
        } else {
            return
        }
    }
}

/**
 * de acordo com o evento, sob o texto da folha2 para folha1 
 * @param {*folha1 sera preenchido} folha 
 * @param {*folha2 tem paragrafos que preencherá } folha2 
 */
function moveTextUp(folha, folha2) {
    mixinMoveTextUp(folha,folha2)

    let status_limite_sheet = checkLimitionSheet(folha)

    if(! status_limite_sheet.has_space){
        return
    }
    // se a folha2 estiver sem elementos
    let elemento = folha2.firstChild

    if(!elemento)return

    if(elemento.innerText.length <= 1)elemento.remove()

    let new_element = elemento.cloneNode(true)
    new_element.innerHTML = ''

    folha.appendChild(new_element)

    let ultimo_txt_removido = ''
    let list_text_p = geraListaInnerHTML(elemento.innerHTML)
    let inner_html_last_p = ''

    for (let index = 0; index < list_text_p.length;) {    
        let status_limite_sheet = checkLimitionSheet(folha)
        if (! status_limite_sheet.passou) {
            let text_slice = (list_text_p.splice(index,2)).join(' ')
            ultimo_txt_removido = text_slice+ ' '
            inner_html_last_p += ultimo_txt_removido
            new_element.innerHTML = inner_html_last_p

        } else {
            new_element.innerHTML = new_element.innerHTML.replace(ultimo_txt_removido,'')
            let inner_html_first_p = list_text_p.join(' ')
            let tag_open = colocoTagOpen(inner_html_first_p,inner_html_last_p)
            
            inner_html_first_p = tag_open + ultimo_txt_removido + inner_html_first_p
            elemento.innerHTML = inner_html_first_p

            break
        }
    }
  
    if(new_element.innerText.length < 1){
        new_element.remove()
    }
}

function colocoTagOpen(inner_html_first_p,inner_html_last_p){
    let pathern_tag_close = /<\/\S+>/
    let match_found = inner_html_first_p.match(pathern_tag_close)
    let tag_open = ''

    if(!match_found) return tag_open

    for(let tag of match_found){
        let nome_tag = tag.slice(2,-1)   
        let pathern = new RegExp(`(?<open_tag><${nome_tag}.*?>).+(?!</${nome_tag}>)`)
        let resultado_match = pathern.exec(inner_html_last_p)

        if(resultado_match){
            tag_open += resultado_match.groups.open_tag
        }
    }
    return tag_open
}


/**
 * cria uma nova folha
 * @param {boolean|undefined} returna_sheet retorna a folha
 * @param {boolean|undefined} page_break true para quebra de pagina
 * @param {number|undefined} indece_folha passe um valor para escolhe a posição da nova folha, null ultima posição
 * @param {boolean|undefined} sheet_filter adiciona a class sheet-filter ha folha 
 * @returns {Element|null} sheet editor
 */
function novaFolha(returna_sheet,page_break,indece_folha) {
    const nova_folha = document.createElement('div')
    nova_folha.setAttribute('class', 'editor sheet-editable')
    let bloco_center = document.querySelector('#bloco-center')

    //set the position of the new sheet
    if (indece_folha) {
        bloco_center.insertBefore(nova_folha,bloco_center.children[indece_folha])
    } else {
        bloco_center.appendChild(nova_folha)
    }
    criarQuill(nova_folha)

    if (page_break) {
        let first_paragraph = nova_folha.firstChild.firstChild
        first_paragraph.setAttribute('class', 'page-break')
    }
    //-------------------------------------\\
    defineTamanhoFolha()
    adicionaFucaoTextoToolbar()

    if (returna_sheet) return nova_folha.firstChild
}

/**
 * verifica a situação da distribuição dos paragrafos na folha
 * @param {Element} folha folha conpleta
 * @returns {object} status[passou|has_space|break]
 */
function checkLimitionSheet(editor){
    let check_class_sheet = editor.classList.contains("ql-editor")

    if (!check_class_sheet) throw new TypeError('elemento errado! tem que passar o elemento com class(editor)')

    let sheet = editor.parentElement
    let status = {}
    let height_sheet = editor.offsetHeight

    if(! editor.lastChild) return status

    let height_p = editor.lastChild.offsetHeight
    let posicion_p = editor.lastChild.offsetTop
    let posicion_end = height_p+posicion_p
    
    if (posicion_end > height_sheet) {//passou
        status['passou'] = true   
    }else if(height_sheet - posicion_end >20){//tem espaço
        let next_sheet = sheet.nextElementSibling

        if(next_sheet){
            let first_paragraph_next_sheet = next_sheet.firstChild.firstChild
            let check_class_paragraph = first_paragraph_next_sheet.classList.contains("page-break");
            
            if (check_class_paragraph){
                status['has_space'] = false
            }else{
                status['has_space'] = true
            }
        }else{
            status['has_space'] = true
        }
       
    }else if(height_sheet - posicion_end < 20){//esta no limite
        status['break'] = true
    }
    return status
}

/**
 * destribui o texto que couber ate o limite da folha, o restante para a
   proxima folha
 * @param {Number} cont index da folha
 * @returns 
 */
function SeMudanca(cont) {
    let folhas = document.querySelectorAll('.ql-editor')
    let texto = downText(folhas[cont])

    if (texto) {
        let folha

        if (folhas[cont + 1]) {
            folha = folhas[cont + 1]
        } else {
            folha = novaFolha(true)
        }
        setTextSheet(folha,texto,false)
        return
    }
}
/**
 * posiciona o cursor
 * @param {HTMLElement} node paragrafo que o cursor sera posicionado
 * @returns 
 */
function setCursor(node) {
    if (!(node)) {
        return
    }
    node.focus()

    var range = document.createRange();
    
    range.setStart(node,0)

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

async function getMaisFolha(){
    const response = await fetch('/mais-folhas/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    const customer = response.json()
    return customer
}

body.onresize = () => {
    defineTamanhoFolha()
}

input_range.addEventListener('click', function () {
    let folha = document.querySelector('.editor')
    defineTamanhoFolha()
})

btn_leitura.addEventListener('click', ()=>{
    let type_sheet = localStorage.getItem('sheet-mode')
    if (type_sheet == 'leitura'){
        salvarNoStorage('sheet-mode','editor')
    }else{
        salvarNoStorage('sheet-mode','leitura')
    }
    setTypeSheet()
})
