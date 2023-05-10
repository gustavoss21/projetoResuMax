let btn_leitura = document.querySelector('#btn-leitura')
let body = document.getElementsByTagName('body')[0]
let input_range = document.querySelector('#customRange1')
let bloco_center = document.createElement('div')
let folha_edite = document.createElement('div')
let conteudo_central = document.querySelector('#conteudo-central')
var lista_funcoes_texto
let alturaFolha
let altura_folha
let tamanho_font
let nova_folha
let clone_conteudo
var conta_folha = 0
var modo_leitura = false
var interador_folha = 0
let lista_conteudo = ''
let mais_folha = false
let paginas = 5

//faz com que o dropdown nao suma ao clicar no item
$("#bloco-right").on('click', '.dropdown-item', function (event) { event.stopPropagation(); });

function criaElementoFolha() {
    conteudo_central.appendChild(bloco_center)
    bloco_center.appendChild(folha_edite)
    
    folha_edite.setAttribute('class','editor')
    bloco_center.setAttribute('id', 'bloco-center')
    criarQuill(folha_edite)

}

function rangeFolha() {
    let folha = document.querySelector('.ql-editor')
    // console.log(modo_leitura)
    if (modo_leitura)   return
    defineTamanhoFolha(folha)
    setTextSheet(folha)
}
/**
 * ajusta a largura das folhas de acordo com o input range
 * execulta as funcoes ajustaTamanhoFont e ajustaAlturaFolha
 * @param {*} folha 
 */
function defineTamanhoFolha(folha) {
    let folhas = document.querySelectorAll('.editor')
    let inputRange = document.querySelector('#customRange1')
    let largura_center = bloco_center.parentElement.offsetWidth
    let largura = largura_center * (inputRange.value / 100)

    if (largura_center === largura) {
        largura -= 20 
    }
    if(largura <300) largura=300

    bloco_center.style.width = largura + 'px'

    if (!modo_leitura) {
        ajustaTamanhoFont(folha)
        folhas.forEach(function (elemeno) { ajustaAlturaFolha(elemeno) })
    }

}
/**
 * ajusta a altura da folha de acordo com a largura da pagina
 * @param {*} folha 
 */
function ajustaAlturaFolha(folha) {
    let largura_folha = window.getComputedStyle(bloco_center).width.slice(0, -2)//tirar
    altura_folha = largura_folha / 0.7069555302166477
    folha.style.height = altura_folha + 'px'
}
function ajustaTamanhoFont(folha) {
    let checked_filter = document.querySelector("#bloco-right #filtro")

    if (checked_filter) {
        if (checked_filter.checked) {
            tamanho_font = window.getComputedStyle(bloco_center).width.slice(0, -2) * 0.1
            bloco_center.style.fontSize = tamanho_font + '%'
            return
        }
    }

    tamanho_font = window.getComputedStyle(folha).width.slice(0, -2) * 0.2
    bloco_center.style.fontSize = tamanho_font + '%'
}

// define o modo leitura
function modoLeitura() {
    let checked_filter = document.querySelector("#bloco-right #filtro")
    let container_filter = document.querySelector('.conteinar-tex-funcao')
    // remove container filtro-texto 
    if (checked_filter) {
        checked_filter.checked = false
        definicoesFilter()
    }

    if (!modo_leitura) {
        ativaModoLeitura()

    } else {
        desativaModoLeitura()
    }

}

async function ativaModoLeitura() {
    // console.log()
    let filtro = localStorage.getItem('filtro')
    salvarNoStorage('modoLeitura', true)

    // if(filtro === 'true') return
    lista_conteudo = await mixinsetTextSheet()
    let editor = document.querySelectorAll('.editor')
    const folha_leitura = editor[0].cloneNode(true)

    btn_leitura.firstElementChild.innerText = 'Editar'
    // set icon
    btn_leitura.lastElementChild.setAttribute('class', 'fa-solid fa-pen-to-square d-md-none')

    btn_leitura.style.background = '#94cfe3'
    modo_leitura = true

    folha_leitura.firstChild.setAttribute('contenteditable', false)
    folha_leitura.style.height = 'auto'
    folha_leitura.setAttribute('id', 'folha-leitura')
   
    bloco_center.appendChild(folha_leitura)

    folha_leitura.innerHTML = lista_conteudo
    
    lista_conteudo = ''
    
    editor.forEach(function (folha) {
        folha.setAttribute('hidden', 'hidden')

    })

  
}

function desativaModoLeitura() {
    let folha_leitura = document.querySelector('#folha-leitura')
    let editor = document.querySelectorAll('.editor')
    let checked_filter = localStorage.getItem('filtro')

    modo_leitura = false
    btn_leitura.firstElementChild.innerText = 'Somente Leitura'
    btn_leitura.lastElementChild.setAttribute('class','fa-regular fa-eye d-md-none')
    btn_leitura.style.background = '#f2de78d4'
    salvarNoStorage('modoLeitura', false)
    //apaga folha-modo-leitura
    if (folha_leitura) {
        folha_leitura.remove()
    }
    // console.log(checked_filter.checked)
    //folha editável fica invisivel
    if(checked_filter === 'true'){
        for (let folha of editor) {
            if (!folha.hasAttribute('hidden')) {
                folha.setAttribute('hidden','hidden')
            }
        }
        return
    } else {
        //folha editável fica visivel
        for (let folha of editor) {
            if (folha.hasAttribute('hidden')) {
                folha.removeAttribute('hidden')
            }
        }
        if (!folhas_renderizadas) {
            rangeFolha()
        }

    }

    
    
    
}

/**
 * // adiciona os textos na folha
 * 
 * @param {*} folha 
 * @param {*} inicio_interador 
 * @param {*} nova_folha 
 * @returns novaFolha()
 */
async function setTextSheet(folha, nova_folha,set_end) {
    let position_comand = ['append','prepend']
    folhas_renderizadas = true
    paginas--
    
    if (!nova_folha) {
        lista_conteudo = await mixinsetTextSheet()
    }
    if(!(set_end===undefined)){
        set_end ? $(folha).append(lista_conteudo):$(folha).prepend(lista_conteudo)
    }else{
        $(folha).html(lista_conteudo)
    }

    // console.log(lista_conteudo)
    lista_conteudo = ''

    if (folha.offsetHeight < folha.scrollHeight) {
        lista_conteudo = downText(folha)
        // if (mais_folha || paginas<1) {
        //     console.log(mais_folha + 11111111111)
        //     let elemento_mais_folha = document.querySelector('#maisfolha')
        //     elemento_mais_folha.style.display = 'block'
        //     return
        // }
        let folha_index = ($('.ql-editor').index(folha))+1
        let next_sheet = $('.ql-editor')[folha_index]
        if(next_sheet){
            return setTextSheet(next_sheet,true,false)
        }
        folha = novaFolha(true)
        return setTextSheet(folha, true)
    }

    getSelecao()//só execultar após renderizar folha
}
/**
 *define o conteudo que sera renderizado
 * @returns lista_conteudo
 */
async function mixinsetTextSheet() {
    if (text_pdf) {
        // renderiza_pdf = true
        return pdfAdd(text_pdf)
    }

    let data = await getSheetData()
    if ('vazio' === data) return []

    data = Object.values(data)[0]
    // console.log(data)

    // let parser = new DOMParser();
    // const doc = parser.parseFromString(data, 'text/html');
    // lista_conteudo = [...doc.getElementsByTagName('p')]
    return data
}
/**
 * limita em apenas 1 elemento que passa o limite da folha
 * @param {*} folha 
 * @returns (ultimos: str, primeiro: elementHtml)
 */
function mixinDesceTexto(folha) {
    let lista_passou
    let new_text = ''
    let pass = 1
    let position_and = 0
    for( let p of folha.childNodes){
        let position_p = p.offsetTop
        let height_p = p.offsetHeight
        position_and += height_p

        if (position_and + 10 > folha.offsetHeight) {

            if (p.outerHTML) {
                if (pass > 0) {
                    new_text += p.outerHTML
                    pass -= 1

                    continue
                }
                let index_pass = [...folha.children].indexOf(p)
                lista_passou = [...folha.children].slice(index_pass,)
                lista_passou = (lista_passou.map(htmlToString)).join('')
                break
                
            }

        } else {
            if (p.outerHTML) new_text += p.outerHTML
        }
    }

    folha.innerHTML = new_text
    return lista_passou
    
//     
}

function htmlToString(html) {
    return html.outerHTML
}

function downText(folha) {
    let paragraphs_down = mixinDesceTexto(folha) || ''//paragrafos(ultimos,primeiro)
    let last_paragraph = folha.lastElementChild
    if(last_paragraph.innerText.length <= 2 ) return paragraphs_down
    let height_sheet = folha.offsetHeight
    let list_txt_last_p = geraListaInnerHTML(last_paragraph.innerHTML)
    let inner_html_down = ''
    let index 
    const inht = last_paragraph.innerHTML
 
    let inner_html_last_p
    let tags_close_list = []
    // let pathern_open_tag = /(<[^\/].*?>)/g
    // let p_abertura = pathern_open_tag.exec(elemento.outerHTML)[0]
    for (index = list_txt_last_p.length-2; index >= 0;) {
        let height_p = folha.lastChild.offsetHeight
        let posicion_p = folha.lastChild.offsetTop
        let posicion_end = height_p+posicion_p

        if (!list_txt_last_p[index]){
            index -= 2
            list_txt_last_p.splice(index,2)

            continue
        }
        
        // index_range += palvra1_palvra2.length
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
            

            // last_paragraph = folha.lastChild
            index -= 2
        } else {
            if(inner_html_down.length < 1) return paragraphs_down
            break
        }
    }

    // pega somente o 1° item da tag_list de fechamento e procura sua abartura
    inht
    // let tag_open = tags_close_list.length >= 1 ? tags_close_list.join(''): ''
    // inner_html_down = tag_open+inner_html_down
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
    // console.log(lista)
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
        }

    }
    return lista
}

function mixinSobeTexto(folha,folha2) {
    let folha_altura = folha.offsetHeight
    let ultimo_p_folha1 = folha.lastElementChild
    let ultimo_p_altura_folha1 = ultimo_p_folha1.offsetHeight
    let ultimo_p_posicao_folha1 = ultimo_p_folha1.offsetTop
    let espaco_usado_folha1 = ultimo_p_altura_folha1 + ultimo_p_posicao_folha1
    let space_to_elements = folha_altura - espaco_usado_folha1
    let children_folha2 = folha2.children
    for (let index = 0; index < children_folha2.length;) {
        let elemento = children_folha2[index]
        let elemento_altura = elemento.offsetHeight
        if (elemento_altura <= space_to_elements) {
            let new_elemeto = elemento.outerHTML
            $(folha).append(new_elemeto)
            space_to_elements -= elemento_altura
            elemento.remove()
            
        } else {
            return
        }
    }
}
function sobeTextoFolha(folha, folha2) {
    //preenche espaco vazio de uma folha com texto da folha seguite.
    mixinSobeTexto(folha,folha2)
    // se a folha2 estiver sem elementos
    let elemento = folha2.firstChild
    if(!elemento)return
    if(elemento.innerText.length <= 1)elemento.remove()
    let new_element = elemento.cloneNode(true)
    new_element.innerHTML = ''

    let ultimo_txt_removido = ''
    let list_text_p = geraListaInnerHTML(elemento.innerHTML)
    let inner_html_last_p = ''

    //vai dar um for com o primeiro paragrafo da 2º folha

    for (let index = 0; index < list_text_p.length;) {
        
        //cada palavra do paragrafo e adiciona na 1º folha ate sua altura maxima
        
        if (folha.scrollHeight === folha.offsetHeight) {
            let text_slice = (list_text_p.splice(index,2)).join(' ')
            ultimo_txt_removido = text_slice+ ' '
            inner_html_last_p += ultimo_txt_removido
            new_element.innerHTML = inner_html_last_p

        } else {//acerta a altura caso tenha passado.
  
            new_element.innerHTML = new_element.innerHTML.replace(ultimo_txt_removido,'')//talves o ultimo_txt_removido seja uma teg
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

function verificarParagrafo(paragrafos) {
    let p_boolean = false

    if (paragrafos) {
        for (let paragrafo of paragrafos) {
            if (paragrafo) {
                if (!(paragrafo === 'vazio_elemento')) {
                    p_boolean = true
                } else {
                    paragrafos.indexOf(paragrafos.indexOf(paragrafo),1)
                }
            }
        }
        if (p_boolean) {
            return paragrafos.join('<br>')
        }
        return
    }
}

function novaFolha(renderia_conteudo=false,page_break,indece_folha) {
    const nova_folha = document.createElement('div')
    nova_folha.setAttribute('class', 'editor')
    //define a ordem da nova folha
    if (indece_folha) {
        bloco_center.insertBefore(nova_folha,bloco_center.children[indece_folha])
    } else {
        bloco_center.appendChild(nova_folha) //#### teste(descomentar)
    }
    criarQuill(nova_folha)
    
    if (page_break) {
        let new_p = document.createElement('p')
        new_p.setAttribute('class', 'page')
    }
    //-------------------------------------\\
    ajustaAlturaFolha(nova_folha)//ajusta dimensoes da folha
    adicionaFucaoTextoToolbar()//adiciona os filtros na toolbar da folha
    // definicoesSelecaoTexto()
    if (renderia_conteudo) return nova_folha.firstChild

    // return setTextSheet(nova_folha.firstChild,true)
 
}

function distrubuirTextoQuebra(folha1, folha2) {
    let padi = parseFloat(window.getComputedStyle(folha1.parentNode).paddingTop.slice(0, -2))
    let ultimo_elemento = folha1.lastChild
    let posicao_ultimo_paragrafo = ultimo_elemento.offsetTop + ultimo_elemento.offsetHeight - padi
    if (posicao_ultimo_paragrafo + 10 < folha1.offsetHeight) {
        //preencherá o espaço da 1º folha e retorna o que nao couber mais
        sobeTextoFolha(folha1, folha2)
        // let texto_resto_quebra = sobeTextoFolha(folha1, folha2)
        //significa que coube tudo na 1° folha
        // if (texto_resto_quebra) {
        //  //define o restante que sobrou
        //     folha2.firstChild.innerText = texto_resto_quebra
        // }
    }
    posicao_ultimo_paragrafo = ultimo_elemento.offsetTop + ultimo_elemento.offsetHeight - padi
}

function SeMudanca(cont) {
    let folhas = document.querySelectorAll('.ql-editor')
    let alturaMax = folhas[cont].offsetHeight
    let altura_scroll = folhas[cont].scrollHeight
    let texto
    console.log('se mudanca')
    /**
        destribui o texto que couber ate o limite da folha, o restante para a
        proxima folha
    */
    if (clicked_tecla) {
        return
    }

    if (alturaMax < altura_scroll) {//desce texto que nao couber
       
        if (alturaMax < altura_scroll) {
            //adiciona paragrafo à lista
            texto = downText(folhas[cont])
            if (texto) {
                let folha
                if (folhas[cont + 1]) {
                    folha = folhas[cont + 1]
            
                } else {
                    folha = novaFolha(true)
                }
                lista_conteudo += texto
                setTextSheet(folha,true,false)
                return

            }

        }

    }// else {
        /*
        * se no final da 1° folha ter espaço para mais conteudo, entao
        * os paragrafos da 2° folha seram usados para preencher o espaço
        */
    //     if (folhas[cont + 1]) {
    //         for (let elementos of folhas[cont+1].children) {
    //             if (elementos.innerText.length > 1) {
    //                 // return distrubuirTextoQuebra(folhas[cont], folhas[cont + 1])
            
    //             }

    //         }
    //     }
    // }

}

function apagaEQuebra(evt,indece) {
    let folhas = document.querySelectorAll('.ql-editor')
    // let texto_resto_quebra

    sobeTextoFolha(folhas[indece - 1], folhas[indece])
    // texto_resto_quebra = sobeTextoFolha(folhas[indece - 1], folhas[indece])

    // if (texto_resto_quebra) {
    //     folhas[indece].firstChild.innerText = texto_resto_quebra
    // }
}

function setCursor(node) {

    if (!(node)) {
        console.log('node ou posicao nao foi passado!')
        return
    }
    node.focus()
    var range = document.createRange();
    range.setStart(node,0)

    var sel = window.getSelection();
    sel.removeAllRanges();
    // range.selectNode(node);
    sel.addRange(range);
}

function primeiroParagrafoFolha() {
    let class_p 
    let primeiro_p = document.querySelectorAll('.page')
        for (let p of primeiro_p) {
            if (p.parentElement.firstChild === p) {
                continue
            } else {
                class_p = p.getAttribute('class')
                let class_list = class_p.split(' ')
                if (class_list.length > 1) {
                    let index_class = class_list.indexOf('page')
                    class_list.splice(index_class, 1)
                    p.setAttribute('class',class_list.join(' '))
                    continue
                }
                p.removeAttribute('class')
                
            }
        }
}

async function getMaisFolha(){
    const response = await fetch('/mais-folhas/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    const customer = response.json()
    console.log(customer)
    return customer
}

// btn_mais_folha.addEventListener('click', () => {
//     let objet_list = getMaisFolha()
//     let texto = objet_list['conteudo']
//     console.log(texto)
//     lista_conteudo = pdfAdd(texto)
//     mais_folha = objet_list['mais_folha']
//     console.log(mais_folha)

//     let nova_folha = novaFolha(true)
//     setTextSheet(nova_folha, true)

// })

body.onresize = () => {
    let folha = document.querySelector('.ql-editor')
    defineTamanhoFolha(folha)
}
input_range.addEventListener('click', function () {
    let folha = document.querySelector('.ql-editor')
    defineTamanhoFolha(folha)
})//definirar novas dimençoes da folha
btn_leitura.addEventListener('click', modoLeitura)//define se a folha é editavel

function setTextToElementHtml(format = false, text = '', html = '') {
    let format_length = Object.values(format).length
    if (!(format_length > 0)) format = false
    let element = html
    let pathern = /(.*?;)(">.*)/g
    let patthern_link = /(<p.*?>)(.*)/g
    let pattern_txt = /(.*?>(<a.*?>)?)(.*(<\/a>)?<\/p>)/g
    // let pattern_link_exits = /(.+ )(href=".*?")(.+)/g
    for (let attribute of Object.getOwnPropertyNames(format)) {
        if (element) {
            if (attribute === 'link') {
                if (element.search(format[attribute]) != -1) {
                    continue
                }
                element = element.replace(patthern_link, '$1' + `<a href="${format[attribute]}"></a>` + '$2')
            } else {
                element = element.replace(pathern, '$1' + attribute + `:${format[attribute]};` + '$2')
            }
        } else {
            element = attribute === 'link' ? `<p><a href="${format[attribute]}"></a></p>` : `<p style="${attribute}:${format[attribute]};"></p>`

        }
    }
    if (!format) {
        if (html) {
            let pattern = /(<p.*?>)(.*<\/p>)/
            element = element.replace(pattern, '$1 ' + text + '$2')
        } else {
            element = `<p>${text}</p>`
        }
    } else {
        element = element.replace(pattern_txt, '$1' + text + ' $3')

    }
    return element
}