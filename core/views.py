from django.shortcuts import render
import re
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.views.generic.base import TemplateView, View
import json
from io import StringIO
from .utils import utils
from .models import ConteudoModel,FiltroItemModel
from django.core.files.base import ContentFile
from django.http import FileResponse
import tempfile
import os
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from ast import literal_eval

# atençao a parada forçada na renderizaçao da folha
def dados(model):
    lista = []
    for object in model.values():
        lista.append(object)

    return lista

class HomeView(TemplateView):
    template_name = 'index.html'

    @method_decorator(login_required(login_url='login'))
    def post(self,request,*args,**kwargs):
        context = {}
        file1 = request.FILES
        file1 = file1.get('avatar')
        support_type = ['pdf','txt']
        if not (file1.name[-3:] in support_type):
            messages.error(request,'Error: typo de arquivo não suportado.')
            return redirect('home')
        
        intense_file = utils.text_extract(file1)
        if not intense_file:
            messages.error(request, 'arquivo não suportado!')
            context['output'] = 'vazio'
            return render(request, 'index.html')

        last_page = intense_file[1]
        text = intense_file[0]

        if len(text) < 10:
            messages.error(request, 'Error na leitura do arquivo.')
            return redirect('home')

        context['output'] = text
        conteudo = ConteudoModel.objects.filter(user=request.user.id)

        if conteudo and not last_page:
            conteudo[0].conteudo_pdf = file1
            conteudo[0].save()
            request.session['pagina'] = 15
            request.session.save()
    
        return render(request,'index.html',context)
      
def apagadorTextoFucao(request):
    """apaga o texto do filtro expecificado
    
    request.body:
    dicionario -- contendo o tipo de filter e o id
    Return: return_description
    """
    
    if request.method == 'POST':

        dados = literal_eval(request.body.decode('utf-8'))
        filter_id = dados['id']
   
        if not filter_id:
            raise ValueError('Esta faltando o nome do filtro ou id, para apagar!')
        
        object = FiltroItemModel.objects.get(id=filter_id)

        if not object: raise ValueError('Error a o apagar. Objecto não encontrado!')
        try:
            FiltroItemModel.delete(object)
        except Exception as error:
            messages.error(request,'Hove um erro inesperado!')
            raise Exception('Hove um erro inesperado!',error)
            
        return HttpResponse(0)

    messages.warning(request,'Houve um erro inesperado, tente novamente!')
    raise Exception('Metodo GET não Pemitido!')

class SalvarConteudo(View):
    def post(self, request, *args, **kwargs):
        # se a requisiçao nao ter o body, a class foi chamada dentro de outra
        conteudo = (request.body).decode('utf-8')
        usuario = request.user.is_authenticated
        if not usuario:
            messages.warning(request, 'faça login, para salvar dados!')
            return HttpResponse(json.dumps({'redirect': 'usuario/login'}))
        artigo = ConteudoModel.objects.all()
        resultado = artigo.get_or_create(user=request.user)
        resultado[0].conteudo = conteudo
        resultado[0].save()
        return HttpResponse(json.dumps({'success': True}))
    
class AddDataFilterViews(View):
    def post(self, request, *args, **kwargs):
        usuario = request.user
        
        if usuario.is_authenticated:
            dados = json.loads(request.body)
            choices = ['topico','destaque','importante']
            if not (dados.get('type') in choices):
                raise messages.warning(request, 'Hove um erro inesperado!')
            
            FiltroItemModel.objects.create(
                filter_type=dados.get('type'),
                text=dados.get('text'),
                index=dados.get('index'),
                length=dados.get('tamanho'),
                folha_index=dados.get('folha_index'), 
                user=request.user
            )

        else:
            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class BaixarArquivo(View):
    def get(self, request, *args, **kwargs):   
        model_conteudo = ConteudoModel.objects.filter(user=request.user.id).first()
        if model_conteudo:
            #tira as tags do texto
            paterh = r'<.*?>'
            conteudo = re.sub(paterh, '', model_conteudo.conteudo)

            #gera o arquivo
            content_file = ContentFile(
                conteudo.encode('UTF-8'), name=f'{request.user.username}.txt')
            return FileResponse(content_file, as_attachment=True)
        
        else:
            messages.warning(request,'salve primeiro para baixar pdf ')
            return	redirect('home')
        
class FilterItemsViews(View):
    def get(self, request, *args, **kwargs):
        filter_types = kwargs['data'].split(',')
        # filter_items = dados(FiltroItemModel.objects.all())
        filter_items = {}
        for filter_type in filter_types:
            filter_item = FiltroItemModel.objects.filter(filter_type=filter_type).values()
            
            if not filter_item: 
            
                filter_items[f"{filter_type}"] = None
            
                continue
        
            filter_items[f"{filter_type}"] = list(filter_item)
        
        return HttpResponse(json.dumps(filter_items))
    
class GetSheetData(View):
    def get(self, request, *args, **kwargs):
        usuario = request.user

        if usuario.is_authenticated:
            conteudo = dados(
                ConteudoModel.objects.filter(user=request.user.id))
            if len(conteudo) == 0:
                return HttpResponse(json.dumps('vazio'))
            
            conteudo = conteudo[0]
            temporario = request.session.get('temporario')
            if temporario:
                del request.session['temporario']
                return HttpResponse(json.dumps({'conteudo':conteudo['conteudo'],'temporario':temporario}))
            return HttpResponse(json.dumps({'conteudo': conteudo['conteudo'], 'mais_folha': False}))
        return HttpResponse(json.dumps('vazio'))


class MaisFolhas(View):

    @method_decorator(login_required(login_url='login'))
    def get(self,request,*args,**kwargs):
        conteudo = ConteudoModel.objects.filter(user=self.request.user.id)
        file = conteudo[0].conteudo_pdf
        pagina = request.session.get('pagina')
        intense_file = utils.text_extract(file.file, pagina)
        if not intense_file:
            return redirect('home')
        last_page = intense_file[1]
        if last_page:
            if request.session.get('pagina'):
                del request.session['pagina']
            os.remove(file.path)

            
        text = intense_file[0]

        return HttpResponse(json.dumps({'conteudo': text,'mais_folha':last_page}))
    

# io = StringIO('["streaming API"]')
# json.load(io)
