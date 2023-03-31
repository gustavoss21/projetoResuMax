from pdfminer.high_level import extract_text_to_fp
from pdfminer import high_level
import pdfkit
import os
from io import StringIO


# define o caminho raiz do programa
dire = os.path.dirname(os.path.dirname(os.path.dirname((os.path.abspath(__file__)))))
dire = os.path.abspath(fr'{dire}\pdf.pdf')

def apagarPdf(caminho_completo):
    
    if not os.path.exists(caminho_completo): 
        print('falha na remoção!')
        return

    os.remove(caminho_completo)
    return

 
def text_extract(diretorio):
    print(diretorio.name)

    type = diretorio.name[-3:]#
    text = ''

    if type == 'txt':
        try:
            for c in diretorio.chunks():
                text = c.decode("utf-8")
        except:
            return False

    else:
        try:
            for c in diretorio.chunks():
                print(1111111111,c)
            text = high_level.extract_text(diretorio.file)
        except:
            try:
            # extrai !InMemoryUploadedFile
                output_string = StringIO()
                with open(diretorio, 'rb') as fin:
                    extract_text_to_fp(fin, output_string)
                text = output_string.getvalue().strip()
            except:
                return False
 
    return text

