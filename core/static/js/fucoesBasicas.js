let checked_item = document.querySelectorAll("#bloco-right .dropdown-item")
let checked_filter = document.querySelector("#bloco-right #filtro")
let btn_baixar_html = document.querySelector('#btn-baixar-pdf')
let btn_nova_folha = document.querySelector('#btn-nova-folha')

const btn_baixar_resumo = document.createElement('button')
let Lista_checked_true = []
let lista_funcoes_texto

let div_container = document.createElement('div')
div_container.setAttribute('class', 'conteinar-tex-funcao')

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


async function definicoesFilter(recarrega) {
    let checked_filter = document.querySelector("#bloco-right #filtro")
    let editor = document.querySelectorAll('.editor')
    salvarNoStorage('filtro', checked_filter.checked)
    console.log('definicoesFilter')
    if (checked_filter.checked) {
        deactivateButton()

        // esconde as folhas     
        for (let folha of editor) {
            folha.setAttribute('hidden', 'hidden')
        }
        
        // habilita o checkBox
        for (let item of checked_item) {
            item.children[0].disabled = false;
  
        }
        if (recarrega) {
        location.reload(true)
        }

        lista_funcoes_texto = await getDataAll()

        defineCheckItemVazio()
        setTextCheckBox()

        return 

    } else {
        let folha_leitura = document.querySelector('#folha-leitura')
        activateButton()
        // torna visivel as folhas
        if (modo_leitura && folha_leitura) {
            folha_leitura.removeAttribute('hidden')

        } else {
            if (folha_leitura) folha_leitura.remove()
            
            for (let folha of editor) {
                folha.removeAttribute('hidden')
            }
        }
        
        if (!folhas_renderizadas) {
            rangeFolha()
        } 

        // desabilita os checkBox
        for (let item of checked_item) {
            item.children[0].disabled = true;
        }
        // elimina o elemento que contem o filter-text
        if (div_container) {
            div_container.remove()
        }

    }
}

function mudaCheckBox() {
    let click_checkbox = false
    // ao clicar no elemento <li> muda o valor do checkBox
    for (const value of checked_item) {
        //se foi clicado diretamente no checkBox,a funcao nao precisa ser executada
        value.children[0].addEventListener("click", function () {
            click_checkbox = true
            // se clicar no elemeno <input> salva no storage o checked
            if (value.children[0].checked) {
                ativaCheckBox(value.children[0],true)
            } else {// se clicar no elemeno <input> salva no storage o checked
                desativaCheckBox(value.children[0],false)
            }
            salvarNoStorage('filter-' + this.value, [this.checked, this.value])
        }, true)
        // fucao que muda o checkBox
        value.addEventListener("click", function () {

            let input_li = value.children[0]
            // se clicar no checkBox, fecha a fucao
            if (click_checkbox) {
                click_checkbox = false
                return setTextCheckBox()
            }
            // se o filtro nao tiver ativado, fecha a fucao
            if (!checked_filter.checked) {
                return
            }
            // se clicar no elemeno <li> munda o checkBox para true
            if (input_li.checked) {
                ativaCheckBox(input_li,false)
            } else {// se clicar no elemeno <li> munda o checkBox para false
                desativaCheckBox(input_li,true)
            }
            // location.reload(true)

            return setTextCheckBox()
        })
    }
}

function ativaCheckBox(input,boolen) {
    input.checked = boolen
    salvarNoStorage('filter-' + input.value, [boolen,input.value])
}

function desativaCheckBox(input,boolen) {
    input.checked = boolen
    salvarNoStorage('filter-' + input.value, [boolen, input.value])
}

function setTextCheckBox() {
    // creates a list with active filters and returns it
    div_container.innerHTML = '' 
    Lista_checked_true = []
    let tem_item = false
    if (!lista_funcoes_texto) return
    for (let item_fucao_key of Object.keys(lista_funcoes_texto)) {
        let input_li = lista_funcoes_texto[item_fucao_key][1]
        if (input_li.checked) {
            tem_item = true
            Lista_checked_true.push(...lista_funcoes_texto[item_fucao_key][0])
        }
    }

    if (tem_item) {
        return setTextFilter()
    }
}

function setTextFilter() {
    // btn_baixar_resumo = document.querySelector('button')
    console.log('setTextFilter')
    let nova_lista
    btn_baixar_resumo.setAttribute('id','btn-baixar-resumo')
    btn_baixar_resumo.innerHTML = 'baixar resumo'
    div_container.innerHTML = ''
    div_container.appendChild(btn_baixar_resumo)
    bloco_center.appendChild(div_container)
    if (lista_funcoes_texto.length > 1) {
        nova_lista = Lista_checked_true.sort(compare)

    } else {
        nova_lista = Lista_checked_true
    }

    for (let texto of nova_lista) {
        let div_fucao_texto = document.createElement('div')
        let new_p = document.createElement('p')

        if (texto.subtema) {
            new_p.appendChild(document.createTextNode(texto.subtema))
            div_fucao_texto.setAttribute('class', 'text-fucao text-subtema')
        } else if (texto.topico) {

            new_p.appendChild(document.createTextNode(texto.topico))
            div_fucao_texto.setAttribute('class', 'text-fucao text-topico')
        } else if (texto.importante) {
            new_p.appendChild(document.createTextNode(texto.importante))
            div_fucao_texto.setAttribute('class', 'text-fucao text-importante')

        } else {
            new_p.appendChild(document.createTextNode(texto.destaque))
            div_fucao_texto.setAttribute('class', 'text-fucao text-destaque')
        }
        div_fucao_texto.setAttribute('id', texto.id)
        
        div_fucao_texto.appendChild(new_p)
        let span_delete = document.createElement("span")
        span_delete.setAttribute('class', 'delete-tex-fucao')
        let icon = document.createTextNode('X')
        span_delete.appendChild(icon)
        div_fucao_texto.appendChild(span_delete)
        div_container.appendChild(div_fucao_texto)
    }

    
    return  execultaApagaTexto()
}

function compare(a, b) {
    if (a.folha_index < b.folha_index || (a.folha_index === b.folha_index && a.index < b.index)) {
        return -1;
    } else {
        return true
    }
}

/**
* responsavel por apagar o text_fucao
*/
function execultaApagaTexto() {   
    let btn_apaga_texto = document.querySelectorAll('.delete-tex-fucao')
    console.log('execultaApagaTexto')
    console.log(btn_apaga_texto)
    for (const elemeno of btn_apaga_texto) {
        elemeno.addEventListener('click', function () {

            let div_text = this.parentElement
            let class_div = div_text.getAttribute('class').slice(11,)
            class_div = class_div.split('-')[1]
            let class_div_id = div_text.getAttribute('id')
            apagadorTextFucao(class_div, parseInt(class_div_id))
        })
    }
    return
}


function apagadorTextFucao(tipo, id) {
    let csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value

    fetch("/apagadorTextoFucao/", {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify({ 'tipo_texto_fucao': tipo, 'id': id })
    }).then(function (data) {
        return data.json()
    }).then(function (data) {
        location.reload(true)
    })
}


function clickedTecla(btn) {
    let cursor = document.getSelection()
    let folhas = document.querySelectorAll('.ql-editor')

    if (!cursor.anchorNode) {
        return
    }
    let folha = cursor.anchorNode.parentElement
    let index_folha = [...folhas].indexOf(folha)
    if (index_folha === -1) {
        folha = cursor.anchorNode.parentElement.parentElement
        index_folha = [...folhas].indexOf(folha)

    }

    let getSeletor = lista_Quill[index_folha].getSelection()
    if (!getSeletor) return
    let index = getSeletor.index
    folhas = document.querySelectorAll('.ql-editor')
    clicked_tecla = false
    // sobe o cursor e, caso necessario, textos tambem
    if (folhas[index_folha - 1]) {
        if (index === 0) {
            const elemeno = folhas[index_folha - 1].lastChild

            if (btn.key == 'ArrowUp') {
                setCursor(folhas[index_folha - 1], elemeno)
                clicked_tecla = true
                return clicked_tecla
            } else if (btn.key == 'Backspace') {
                if (!(folhas[index_folha].innerText.length > 1)) {
                    setCursor(folhas[index_folha - 1], elemeno)
                    folhas[index_folha].parentElement.remove()
                    lista_Quill.splice(index_folha,1)
                    return
                }
                apagaEQuebra(btn, index_folha)
                setCursor(folhas[index_folha - 1], elemeno)
                clicked_tecla = true
                return clicked_tecla
            }
        }
        
    }
    if (folhas[index_folha + 1]){
        folhas = document.querySelectorAll('.ql-editor')
        // desce o cursor para o primeiro elemento da pagina seguinte 
        let cursor_node = cursor.anchorNode
        if (cursor_node.nodeName === '#text') {
            cursor_node = cursor.anchorNode.parentNode
        }

        if (cursor_node === folha.lastChild) {

            if (btn.key === 'ArrowDown') {
                let elemeno = folhas[index_folha + 1].firstChild
                clicked_tecla = true

                return setCursor(folhas[index_folha + 1], elemeno)


            } else if (btn.key === 'Enter') {
                let position_p = cursor_node.offsetHeight + cursor_node.offsetTop
                let folha_height = folhas[index_folha].offsetHeight
                if (!(position_p + 20 >= folha_height)) {
                    return
                }
                let new_p = document.createElement('p')
                folhas[index_folha].lastChild.remove()
                folhas[index_folha + 1].insertBefore(new_p, folhas[index_folha + 1].children[0])
                clicked_tecla = true

                return setCursor(folhas[index_folha + 1], new_p)
            }
        }
        if (btn.key === 'Enter') {
            let texto = desceTextoFolha(folhas[index_folha])
            if (texto) {
                const new_elemeno = document.createElement('p')
                let text_node = document.createTextNode(texto)
                new_elemeno.innerHTML = texto
                folhas[index_folha + 1].insertBefore(new_elemeno, folhas[index_folha + 1].children[0])
            }
        }
        if (btn.key === 'Backspace' || btn.key === 'Delete') {
            console.log('sobe')
            let text_p = cursor_node.innerText
            if (!text_p) {
                cursor_node.remove()
            }
            sobeTextoFolha(folhas[index_folha], folhas[index_folha + 1])
        }
    } 
    //adiciona uma nova folha
    if (btn.key === 'Enter' && cursor.anchorNode === folha.lastChild) {
        let folha_altura = folha.offsetHeight + folha.offsetTop
        let posicao_p = folha.lastElementChild.offsetTop
        let altura_p = folha.lastElementChild.offsetHeight
        let posicao_final = posicao_p+altura_p
        if (folhas[index_folha + 1]) {
            return
        }
        if (posicao_final + 20 > folha_altura) {
    
            novaFolha()
            folhas = document.querySelectorAll('.ql-editor')
            const elemeno = folhas[index_folha + 1].firstChild
           
            setCursor(folhas[index_folha + 1], elemeno )
            clicked_tecla = true
            return clicked_tecla
        }   
    } else if (btn.key === 'Delete'){
        
    }
}

function geraPdf() {
    let elementos = document.querySelectorAll('.text-fucao > p')
    let html = ''
    let pdf = new jsPDF('p','in','a4')
    let ultimo_index = 50
    let primeiro_index = 0

    for (let texto of elementos) {
        html += `\n${texto.innerHTML}`
    }

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

function deactivateButton() {
    let btn_barra_lateral = document.querySelector('#bloco-right').children
    let btn_adicionar_pdf = document.querySelector('#btn-adicionar-pdf')
    btn_adicionar_pdf.disabled = true

    // barra_lateral_childre
    for (let btn_index = 0; btn_index < btn_barra_lateral.length; btn_index++){

        if (btn_index === 0) continue
        if (btn_barra_lateral[btn_index].hasAttribute('id')) {

            if (btn_barra_lateral[btn_index].getAttribute('id') === 'btn-leitura') {
                continue
            }

        btn_barra_lateral[btn_index].disabled = true

        }

    }
}

function activateButton() {
    let btn_barra_lateral = document.querySelector('#bloco-right').children
    let btn_adicionar_pdf = document.querySelector('#btn-adicionar-pdf')
    btn_adicionar_pdf.disabled = false

    // barra_lateral_childre
    for (let btn_index = 0; btn_index < btn_barra_lateral.length; btn_index++) {
        if (btn_index === 0) continue
            if (btn_barra_lateral[btn_index].hasAttribute('id')) {

                if (btn_barra_lateral[btn_index].getAttribute('id') === 'btn-leitura') {
                    continue
                }
            }
            btn_barra_lateral[btn_index].disabled = false

    }
}

let path = location.href
if (path === 'http://127.0.0.1:8000/adiciona-arquivo/') {
    console.log('iguais')
    btn_leitura.disabled = true
} else {
    btn_leitura.disabled = false

}