let caixa_selecao = document.querySelector('#selecao')
let btn_topico = document.querySelector('#btn-topico')
let btn_destaque = document.querySelector('#btn-destaque')
let btn_importante = document.querySelector('#btn-importante')
let btn_tema = document.querySelector('#btn-tema')
let btn_subtema = document.querySelector('#btn-subtema')
var text
let conteudo_children
var seletor_ativo
var seletor_ativo
let contador = 0

var toolbarOptions = [
    [
        'delete', 'bold', 'italic', 'underline', 'strike'
    ],
    ['blockquote', 'code-block', 'link'
    ],
    [
        {
            'header': 1
        },
        {
            'header': 2
        },
        {
            'header': 3
        }
    ], [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [
        {
            'indent': '-1'
        },
        {
            'indent': '+1'
        }
    ],
    [{ 'direction': 'rtl' }],

    [
        {
            'size': ['small',
                true, 'large', 'huge'
            ]
        }
    ],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [
        {
            'align': []
        }
    ]
    ['image'],

    ['clean']
]

var quill = new Quill('#editor', {
    modules: {
        toolbar: {
            container: toolbarOptions,
            handlers: {
                image: urlImage
            }
        }
    },
    theme: 'snow',//bubble
    // placeholder: 'teste'
})

function urlImage() {
    let selection = this.quill.getSelection() //pegara a instancia de imagem definido acima
    let prompt = window.prompt('URL da imagem')
    if (prompt === null || prompt == '') { return }
    this.quill.insertEmbed(selection.index, 'image', prompt)//vai inserir a imagem aonde foi selecionado
}
//////////////////
function setPosicaoSeletor() {
    editor = document.querySelector('#editor.ql-container.ql-snow')
    let texto_total_contador = 0
    let texto


    var range = quill.getSelection();

    // console.log(range)
    contador = 0
    if (!(range == null) && !(range.length < 2)) {
        text = quill.getText(range.index, range.length);

        for (folha of editor.children) {
            // texto = folha.innerHTML.slice(range.index, range.index + range.length)
            // console.log(conteudo.innerText.slice(range.index, range.index + range.length))
            // console.log(texto)
            for (conteudo of folha.children) {
                texto = conteudo.textContent
                if (!texto) {
                    texto_total_contador++
                }
                // console.log(conteudo.innerText.slice(range.index, range.index + range.length))
                texto_total_contador += texto.length
                console.log('range: ' + range.index + ' tex_cont: ' + texto_total_contador)
                // let dife = texto_total_contador - range.index
                // console.log(dife)
                // console.log(texto.slice(dife, dife + range.length))
                console.log(conteudo)

                if (texto_total_contador + 4 >= range.index) {
                    if (contador == 0) {
                        let texto_index = conteudo.innerText.search(text)
                        // console.log(range.index)
                        // console.log(conteudo)

                        // console.log(texto_index)

                        if (!(texto_index == -1)) {
                            console.log(texto_index)
                            conteudo_children = conteudo
                            seletorAtivo()
                            posicaoSeletor()
                            return
                        }


                    }
                    contador++
                }
            }
        }
        // console.log('dentro do range')
    }
}
function posicaoSeletor() {
    caixa_selecao.removeAttribute('hidden')
    let posicao_folha = window.getComputedStyle(editor).width.slice(0, -2) * 0.8
    let folha_largura = window.getComputedStyle(folha).width.slice(0, -2) * 0.9
    // caixa_selecao.style.left = (200 + folha_largura) + 'px'
    caixa_selecao.style.left = ((conteudo_children.offsetLeft * 6) + 130) + 'px'
}
// executa a funçao enquanto o texto estar selecionado
function seletorAtivo() {
    // console.log('ativo')
    clearTimeout(seletor_desativo);
    seletor_ativo = setInterval(removeSeletor, 1000);
    return
}
// executa enquanto ter um item maior que 0 selecionado
function seletorDesativo() {
    // console.log('desativo')
    clearTimeout(seletor_ativo);
    seletor_desativo = setInterval(setPosicaoSeletor, 1000)
}
function removeSeletor() {
    var range = quill.getSelection();
    // console.log(range)
    if (range == null || range.length < 2) {
        caixa_selecao.setAttribute('hidden', 'hidden')
        seletorDesativo()

        // console.log('fim')
    }
}


seletorDesativo()
// const set_seletor_posicao = setInterval(setPosicaoSeletor, 1000)
