from pdfminer import high_level
import pdfkit
import os

# define o caminho raiz do programa
dire = os.path.dirname(os.path.dirname(os.path.dirname((os.path.abspath(__file__)))))
dire = os.path.abspath(fr'{dire}\media')

def apagarPdf(caminho_completo):
    
    if not os.path.exists(caminho_completo): 
        print('falha na remoção!')
        return

    os.remove(caminho_completo)
    return

 
def text_extract(diretorio):
    # SourceFile = os.path.abspath(fr'{dire}\{diretorio}\entrada.pdf')
    type = diretorio.name[-3:]#
    text = ''

    if type == 'txt':
        for c in diretorio.chunks():
            text = c.decode("utf-8")
    else:
        text = high_level.extract_text(diretorio.file)
 

    return text
