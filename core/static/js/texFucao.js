let csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value
let btn_topico
let btn_destaque
let btn_importante
let btn_subtema
let text
let range
let folha_index
let folha_camuflada

function retorna_html() {
    primeiroParagrafoFolha()
    let folhas = document.querySelectorAll('.ql-editor')
    let elemento_vazio
    let conteudo = ''
    let pdf = ''
    for (let pagina of folhas) {
        elemento_vazio = pagina.firstElementChild
        conteudo += pagina.innerHTML
        pdf += pagina.textContent
    }
    if (lista_conteudo) {
        conteudo += lista_conteudo
        let pattern = /<p.*?>(.*?)<\/p>/g
        let new_list = lista_conteudo.replace(pattern, '$1 ')
        pdf+=new_list
    }
    return [conteudo, pdf]
}

function salvarConteudo() {
    let artigo = retorna_html()
    let data_pdf = artigo[1]
    artigo = artigo[0]
    // console.log(artigo)

    fetch("/salvarConteudo/", {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify({ 'conteudo': artigo, 'pdf': data_pdf })
    }).then(function (data) {
        return data.json()
    }).then(function (data) {
        if (data.redirect) {
            location.assign('usuario/login');
        }
    })
}

function salvarTopico() {
    if (text) {
        fetch("/salvarTopico/", {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify({ 'topico': text, 'index': range.index, 'tamanho': range.length, 'folha_index': folha_index })
        }).then(function (data) {
            return data.json()
        }).then(function (data) {
            tiraSelecao(folha_index, range.index)
        })
    }


}

function salvarSubtema() {
    if (text) {
        fetch("/salvarSubtema/", {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify({ 'subtema': text, 'index': range.index, 'tamanho': range.length, 'folha_index': folha_index })
        }).then(function (data) {
            return data.json()
        }).then(function (data) {
            tiraSelecao(folha_index, range.index)
        })

    }

}

function salvarDestaque() {
    if (text) {
        fetch("/salvarDestaque/", {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify({ 'destaque': text, 'index': range.index, 'tamanho': range.length, 'folha_index': folha_index })
        }).then(function (data) {
            return data.json()
        }).then(function (data) {
            tiraSelecao(folha_index, range.index)
        })

    }

}

function salvarImportante() {
    if (text) {
        fetch("/salvarImportante/", {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token
            },
            body: JSON.stringify({ 'importante': text, 'index': range.index, 'tamanho': range.length, 'folha_index': folha_index })
        }).then(function (data) {
            return data.json()
        }).then(function (data) {
            tiraSelecao(folha_index,range.index)
        })
    }


}
/**
* - cria uma caixa de opçoes, que darao funcionalidades, como, definir um topico, ao texto.
* - fucionalidades[topico,destaque,destaque,subtema]
* - return caixa_selecao(div com todas funcionalidades)
*/
function criaSeletor() {
    let caixa_selecao = document.createElement('div')
    let title = document.createElement('span')
    let div_opcoes_selecao = document.createElement('div')

    caixa_selecao.setAttribute('class', 'selecao')
    title.setAttribute('class', 'title-selecao')
    title.innerText = 'definir como:'
    caixa_selecao.appendChild(title)

    div_opcoes_selecao.setAttribute('class', 'conteudo-selecao')
    caixa_selecao.appendChild(div_opcoes_selecao)

    btn_destaque = document.createElement('div')
    btn_destaque.setAttribute('class', 'btn-destaque')
    btn_destaque.innerText = 'destaque'
    div_opcoes_selecao.appendChild(btn_destaque)

    btn_subtema = document.createElement('div')
    btn_subtema.setAttribute('class', 'btn-subtema')
    btn_subtema.innerText = 'subtema'
    div_opcoes_selecao.appendChild(btn_subtema)

    btn_topico = document.createElement('div')
    btn_topico.setAttribute('class', 'btn-topico')
    btn_topico.innerText = 'topico'
    div_opcoes_selecao.appendChild(btn_topico)


    btn_importante = document.createElement('div')
    btn_importante.setAttribute('class', 'btn-importante')
    btn_importante.innerText = 'importante'
    div_opcoes_selecao.appendChild(btn_importante)

    return caixa_selecao
}

//adiciona caixa_seletor na toolbar
function adicionaFucaoTextoToolbar() {
    let toolbxx = document.querySelectorAll(".ql-toolbar")

    for (let box of toolbxx) {
        let seltor_existe = box.querySelector('.selecao')
        if (!seltor_existe) {
            box.appendChild(criaSeletor())

        }

    }   
}

/**
 * se tiver algum texto selecionado, sera difinido o range, folha e o texto
 
    * se tiver mundaça no texto da folha ativará a funcao seMudanca,
    responvel pela quebra de pagina.
*/
function definicoesSelecaoTexto() {
    let folhas = document.querySelectorAll(".ql-editor")

    for (const folha of folhas) {
        folha.addEventListener('click', function () {
            let indece = [...folhas].indexOf(folha)

            //defines text filter data that will be saved
            if (lista_Quill[indece]) {
                range = lista_Quill[indece].getSelection();

                text = lista_Quill[indece].getText(range.index, range.length);
                folha_index = indece
            }
            setSuperimposeSheet(indece+1)
        }
        )
    }
}
/**
 * evita que o folha sopreponha a toolbar ou outros itens
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

// adiciona o evento click nos botoes do caixa_seletor
function setBotao() {
    let toolbxx = document.querySelectorAll(".ql-toolbar")
    for (let botoes of toolbxx) {
        let opcoes_selecao = botoes.lastChild.lastChild
        for (let btn of opcoes_selecao.children) {
            btn.addEventListener('click',function () {
                switch (this.innerText) {
                    case 'destaque':
                        salvarDestaque()
                        break
                    case 'importante':
                        salvarImportante()
                        break
                    case 'subtema':
                        salvarSubtema()
                        break
                    case 'topico':
                        salvarTopico()
                        break
                }
            }
            )
        }
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

function getSelecao() {
    for (const elemeno of lista_Quill) {
        elemeno.on('text-change', function (delta, oldDelta, source) {
                
                SeMudanca(lista_Quill.indexOf(elemeno))
        });
        
    }
}
/**
 *  verifica quais filter-text estao vazios e informa
 *  a seu respectivo filtro
*/
function defineCheckItemVazio() {
    
    if (!lista_funcoes_texto) return

    for (let item_fucao_key of Object.keys(lista_funcoes_texto)) {
        let item_fucao_value = lista_funcoes_texto[item_fucao_key][0]

        if (item_fucao_value.length === 0) {
            // verifica se o elemento já tem a msg de vazio
            let tes = document.querySelector(".item-vazio-" + item_fucao_key)
            if (!(tes)) {
                let lista_vazia = document.createElement('span')
                let texto = document.createTextNode('vazio!')
                lista_vazia.appendChild(texto)
                lista_vazia.setAttribute('class', 'item-vazio-' + item_fucao_key)
                lista_vazia.style.color = '#00000070'
                document.querySelector('#' + item_fucao_key).parentElement.appendChild(lista_vazia)
            }

        }
    }
}

async function getDataAll() {
    const response =  fetch('/get-dados/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    const data = await response.then(response => {
       return response.json()
    }).then(response => { 
        lista_funcoes_texto = {}
        
        for (let item of Object.keys(response)) {
            let input_filter = document.querySelector('#' + item)
            lista_funcoes_texto[item] = [response[item],input_filter] 
        }
        return lista_funcoes_texto

        })
    return data
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

