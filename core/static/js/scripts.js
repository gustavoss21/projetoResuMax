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
let lista_conteudo = []

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
    lista_conteudo.forEach(valeu => {
        folha_leitura.appendChild(valeu)
    })
    lista_conteudo = []
    
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
async function setTextSheet(folha, nova_folha) {
    folhas_renderizadas = true
    const folha_altura = folha.offsetHeight
    
    if (!nova_folha) {
        lista_conteudo = await mixinsetTextSheet()
    }
    for (let inicio_interador=0; inicio_interador < lista_conteudo.length;) {
        let element = lista_conteudo[inicio_interador]

       // create a new page if it have the page class
        if (element.hasAttribute('class')) {
            let class_p = element.getAttribute('class')

            if (class_p === 'page' && !nova_folha) {
                folha =  novaFolha(true)
                posicao_final = 0
            }
        }

        nova_folha = false
        folha.appendChild(element)
        lista_conteudo.shift()
        let posicao_p = folha.lastElementChild.offsetTop
        let altura_p = folha.lastElementChild.offsetHeight
        let posicao_final = posicao_p + altura_p //+ element.offsetHeight
        //create new folha
        if (posicao_final+10 >= folha_altura) {

            let texto = desceTextoFolha(folha)
            if (texto) {
                const new_elemeno = document.createElement('p')
                let text_node = document.createTextNode(texto)
                new_elemeno.appendChild(text_node)
                lista_conteudo.push(new_elemeno)
            }
            folha = novaFolha(true)
            posicao_final = 0
        }
        // remove p that was created automatically by Quill
        if (folha.firstChild.innerText === '\n') {
            folha.firstChild.remove()
        }
        //add element in folha and remove of lista_conteudo
        
    }    
}
/**
 *define o conteudo que sera renderizado
 * @returns lista_conteudo
 */
async function mixinsetTextSheet() {
    if (text_pdf) {
        renderiza_pdf = true
        return pdfAdd(text_pdf)
    }

    let data = await getSheetData()

    if ('vazio' === data) return []

    data = Object.values(data)[0]
    let parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    lista_conteudo = [...doc.getElementsByTagName('p')]
    return lista_conteudo
}
/**
 * limita em apenas 1 elemento que passa o limite da folha
 * @param {*} folha 
 * @returns (ultimos: str, primeiro: elementHtml)
 */
function mixinDesceTexto(folha) {
    const lista = folha.children
    let folha_altura = folha.offsetHeight
    let elementos_passou = ''
    let ultimo_indice_passou 
    let elementos
    let primeiro_passou

    for (let indece = 0; indece < lista.length; indece++){
        const elemento = lista[lista.length - indece]
        if(!elemento)continue
        let posicao_p = elemento.offsetTop
        let altura_p = elemento.offsetHeight
        let posicao_final = posicao_p + altura_p

        if (posicao_final +20 > folha_altura) {
            primeiro_passou = elemento
        }
        else {
            if (indece <= 1) {
                return false
            }
            break
        } 

    }
    ultimo_indice_passou = [...lista].indexOf(primeiro_passou)
    // obtem todos os elementos que passaram a folha exceto primeiro_passou
    elementos = [...lista].slice(ultimo_indice_passou + 1,)
    elementos.forEach(function (elemeno) {
        elementos_passou += elemeno.innerHTML
        elemeno.remove()
    }
    )
    return { 'ultimos': elementos_passou, 'primeiro': primeiro_passou }
    
//     
}
function desceTextoFolha(folha) {
    let elementos_passou = mixinDesceTexto(folha)//paragrafos(ultimos,primeiro)
    if(!elementos_passou) return false
    let elemento = elementos_passou['primeiro']
    let conteudo_quebra
    let height_folha = folha.offsetHeight
    let contador = 0
    let indice_fim
    let texto = (elemento.innerText).split(' ')
    let for_texto
    let novo_elemento    

    if (texto[0] == "\n" && texto.length < 1) {
        return false

    }
    for (let palavra of texto) {
        contador--
        let height_p = folha.lastChild.offsetHeight
        let posicion_p = folha.lastChild.offsetTop
        let posicion_and = height_p+posicion_p
        
        if (posicion_and+10 > height_folha) {

            for_texto = texto.slice(0, contador)
            if (for_texto.length < 1) {
                return '<br>'
            }
            for_texto = (for_texto.join(' ')).toString()
            let texto_node = document.createTextNode(for_texto)
            if (contador === -1) {
                novo_elemento = document.createElement('p')
                novo_elemento.setAttribute('class', 'teste')
                novo_elemento.appendChild(texto_node)
                elemento.remove()
                elemento = false

            } else {
                novo_elemento.remove()
                novo_elemento = document.createElement('p')
                novo_elemento.setAttribute('class', 'teste')
                novo_elemento.appendChild(texto_node)

            }
            folha.appendChild(novo_elemento)
            indice_fim = contador
        } 
    }

    conteudo_quebra = (texto.slice(indice_fim,)).join(' ')
    return conteudo_quebra + elementos_passou['ultimos']
}
function mixinSobeTexto(folha,folha2) {
    let folha_altura = folha.offsetHeight
    let altura_elemento = folha.lastElementChild.offsetHeight
    let posicao_final = folha.lastElementChild.offsetTop + altura_elemento
    let space_to_elements = folha_altura - posicao_final

    for (let elemeno of folha2.children) {
        let elementos_altura = elemeno.offsetHeight
        if (elementos_altura <= space_to_elements) {
            let new_elemeto = elemeno.cloneNode(true)
            folha.appendChild(new_elemeto)
            elemeno.remove()
        } else {
            return
        }
    }
}
function sobeTextoFolha(folha, folha2) {
    //preenche espaco vazio de uma folha com texto da folha seguite.
    mixinSobeTexto(folha,folha2)
    let padi = parseFloat(window.getComputedStyle(folha.parentNode).paddingTop.slice(0, -2))
    let elemento = folha2.firstChild
    if(!elemento)return
    let conteudo_quebra
    let contador = 0
    let indice_fim
    let texto = (elemento.innerText).split(' ')
    let for_texto
    let posicao_ultimo_paragrafo = folha.lastChild.offsetTop + folha.lastChild.offsetHeight - padi
    let novo_elemento
    // verificar se é util
    if (texto[0] == "\n") {
        elemento.remove()
        return false
    }
    //vai dar um for com o primeiro paragrafo da 2º folha
    for (let indice = 0; indice < texto.length; indice++) {
        contador++
        //cada palavra do paragrafo e adiciona na 1º folha ate sua altura maxima
        if (folha.scrollHeight === folha.offsetHeight) {
            indice_fim = contador
            for_texto = texto.slice(0, contador)
            for_texto = (for_texto.join(' ')).toString()
            let texto_node = document.createTextNode(for_texto)
  
            if (contador === 1) {
                novo_elemento = document.createElement('p')
                novo_elemento.setAttribute('class', 'teste')
                novo_elemento.appendChild(texto_node)

            } else {
                novo_elemento.remove()
                novo_elemento = document.createElement('p')
                novo_elemento.setAttribute('class', 'teste')
                novo_elemento.appendChild(texto_node)

            }
            folha.appendChild(novo_elemento)

        } else {//acerta a altura caso tenha passado.
            posicao_ultimo_paragrafo = folha.lastChild.offsetTop + folha.lastChild.offsetHeight - padi
            if (posicao_ultimo_paragrafo > folha.offsetHeight) {
                var teste = desceTextoFolha(folha)    
            }

            break
        }

    }

    if (contador === texto.length && contador > 1 | !teste) {//se adicionol o texto todo, return false
        elemento.remove()
        return false
    }
   
    conteudo_quebra = (texto.slice(indice_fim,)).join(' ')

    return teste + ' ' + conteudo_quebra
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
     
    ajustaAlturaFolha(nova_folha)//ajusta dimensoes da folha
    adicionaFucaoTextoToolbar()//adiciona os filtros na toolbar da folha
    // definicoesSelecaoTexto()
    if (renderia_conteudo) return nova_folha.firstChild

    return setTextSheet(nova_folha.firstChild,true)
 
}

function distrubuirTextoQuebra(folha1, folha2) {
    let padi = parseFloat(window.getComputedStyle(folha1.parentNode).paddingTop.slice(0, -2))
    let ultimo_elemento = folha1.lastChild
    let posicao_ultimo_paragrafo = ultimo_elemento.offsetTop + ultimo_elemento.offsetHeight - padi
    if (posicao_ultimo_paragrafo + 10 < folha1.offsetHeight) {
        //preencherá o espaço da 1º folha e retorna o que nao couber mais
        let texto_resto_quebra = sobeTextoFolha(folha1, folha2)
        //significa que coube tudo na 1° folha
        if (texto_resto_quebra) {
         //define o restante que sobrou
            folha2.firstChild.innerText = texto_resto_quebra
        }
    }
    posicao_ultimo_paragrafo = ultimo_elemento.offsetTop + ultimo_elemento.offsetHeight - padi

}

function SeMudanca(cont) {
    let folhas = document.querySelectorAll('.ql-editor')
    let alturaMax = folhas[cont].offsetHeight
    let altura_scroll = folhas[cont].scrollHeight
    let contador = 0
    let paragrafo_passou = []
    let texto
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
            texto = desceTextoFolha(folhas[cont])
            if (texto) {
                let patern = /(.*)/g
                let tex_list = texto.match(patern)
                if (folhas[cont + 1]) {
                    tex_list.forEach(elemento => {
                        let new_p = document.createElement('p')
                        new_p.innerText = elemento
                        folhas[cont + 1].insertBefore(new_p, folhas[cont + 1].children[0])
                    })
                } else {

                    tex_list.forEach(text => {
                        let new_p = document.createElement('p')
                        new_p.innerText = text
                        lista_conteudo.push(new_p)
                    })
                    return novaFolha()
                    

                }

            }

        }

    } else {
        /*
        * se no final da 1° folha ter espaço para mais conteudo, entao
        * os paragrafos da 2° folha seram usados para preencher o espaço
        */
        if (folhas[cont + 1]) {
            for (let elementos of folhas[cont+1].children) {
                if (elementos.innerText.length > 1) {
                    return distrubuirTextoQuebra(folhas[cont], folhas[cont + 1])
            
                }

            }
        }
    }

}

function apagaEQuebra(evt,indece) {
    let folhas = document.querySelectorAll('.ql-editor')
    let texto_resto_quebra

    // folhas[indece - 1].lastChild.remove()
    texto_resto_quebra = sobeTextoFolha(folhas[indece - 1], folhas[indece])

    if (texto_resto_quebra) {
        folhas[indece].firstChild.innerText = texto_resto_quebra
    }
}

function setCursor(node, posicao) {

    if (!(node && posicao)) {
        console.log('node ou posicao nao foi passado!')
        return
    }
    node.focus()
    var range = document.createRange();
    range.setStart(posicao, 1)

    var sel = window.getSelection();
    sel.removeAllRanges();
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

body.onresize = () => {
    let folha = document.querySelector('.ql-editor')
    defineTamanhoFolha(folha)
}
input_range.addEventListener('click', function () {
    let folha = document.querySelector('.ql-editor')
    defineTamanhoFolha(folha)
})//definirar novas dimençoes da folha
btn_leitura.addEventListener('click', modoLeitura)//define se a folha é editavel