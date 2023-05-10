from pdfminer.high_level import extract_text_to_fp
from pdfminer import high_level
import os
from io import StringIO
import PyPDF2


# define o caminho raiz do programa
dire = os.path.dirname(os.path.dirname(os.path.dirname((os.path.abspath(__file__)))))
dire = os.path.abspath(fr'{dire}\Cinco Semanas Em um Balao - Jules Verne.pdf')

def apagarPdf(caminho_completo):
    
    if not os.path.exists(caminho_completo): 
        print('falha na remoção!')
        return

    os.remove(caminho_completo)
    return

 
def text_extract(diretorio,index=15):
    # print(diretorio.name)

    type = diretorio.name[-3:]#
    text = ''
    last_page = False
    # print(type(1111,diretorio))

    if type == 'txt':
        try:
            for c in diretorio.chunks():
                text = c.decode("utf-8")
        except:
            return False

    else:
        # with open(diretorio.name, 'rb') as file:
        try:
            read_pdf = PyPDF2.PdfReader(diretorio)
            print(11111,index)
            count_page = len(read_pdf.pages)
            if count_page <= index:
                index = count_page
                last_page = True

            page = read_pdf.pages[0:index]

            print(33333,count_page)
            for p in page:
                text += p.extract_text()
        except:
            return False
        # page_index_list = listaNova(index)
        # try:
        #     text = high_level.extract_text(
        #         diretorio.file, page_numbers=page_index_list)

        # except:
        #     # try:
        #     # # extrai !InMemoryUploadedFile
        #     #     output_string = StringIO()
        #     #     with open(diretorio.name, 'rb') as fin:
        #     #         extract_text_to_fp(fin, output_string,
        #     #                            page_numbers=page_index_list)
        #     #     text = output_string.getvalue().strip()
        #     # except:
        #         return False
 
    return [text,last_page]

def listaNova(value=0):
    lista = [x for x in range(value,value+21)]
    return lista


