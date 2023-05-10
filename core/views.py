from django.shortcuts import render
import re
import jsonpickle
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.views.generic.base import TemplateView, View
import json
from io import StringIO
from .utils import utils
from .models import ConteudoModel,DestaqueModel,ImportanteModel,SubtemaModel,TopicoModel
from django.core.files.base import ContentFile
from django.http import FileResponse
import tempfile
import os
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

# atençao a parada forçada na renderizaçao da folha
def dados(model):
    lista = []
    for value in model.values():
        lista.append(value)

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
    dados = json.loads(request.body)
    tipo_texto = dados.get('tipo_texto_fucao')
    texto_id = dados.get('id')
    finded_object = False
    list_type_text = {
        'topico': TopicoModel,
        'importante': ImportanteModel,
        'destaque': DestaqueModel,
        'subtema': SubtemaModel,
    }
    for key in list_type_text:
        if tipo_texto == key:
            finded_object = True
            model = list_type_text[key]
            object_model = model.objects.filter(id=texto_id)
            object_model.delete()
    if not finded_object:
        messages.warning(request,'Houve um erro inesperado, tente novamente!')
        
    return HttpResponse('1')

class SalvarConteudo(View):
    def post(self, request, *args, **kwargs):
        # se a requisiçao nao ter o body, a class foi chamada dentro de outra
        usuario = request.user.is_authenticated
        dados = json.loads(request.body)
        if not usuario:
            messages.warning(request, 'faça login, para salvar dados!')
            if len(dados.get('conteudo')) > 15 :
                request.session['temporario'] = dados.get('conteudo')
                request.session.save()
            return HttpResponse(json.dumps({'redirect': 'usuario/login'}))
        artigo = ConteudoModel.objects.all()
        resultado = artigo.get_or_create(user=request.user)
        resultado[0].conteudo = dados.get('conteudo')
        resultado[0].save()
        return HttpResponse('1')
    
class SalvarTopico(View):
    def post(self, request, *args, **kwargs):
        usuario = request.user
        
        if usuario.is_authenticated:
            dados = json.loads(request.body)
            TopicoModel.objects.create(topico=dados.get('topico'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'), user=request.user)

        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarSubtema(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            SubtemaModel.objects.create(subtema=dados.get('subtema'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'), user=request.user)
 
        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarDestaque(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            DestaqueModel.objects.create(destaque=dados.get('destaque'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'), user=request.user)

        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarImportante(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            ImportanteModel.objects.create(importante=dados.get('importante'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'), user=request.user)

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
        

class GetDataAll(View):
    def get(self, request, *args, **kwargs):
        subtema = SubtemaModel.objects.filter(user=request.user.id)
        importante = ImportanteModel.objects.filter(user=request.user.id)
        destaque = DestaqueModel.objects.filter(user=request.user.id)
        topico = TopicoModel.objects.filter(user=request.user.id)
        objeto = {
            'subtema': dados(subtema),
            'importante': dados(importante),
            'destaque': dados(destaque),
            'topico': dados(topico)}
        return HttpResponse(json.dumps(objeto))
    
class GetSheetData(View):
    def get(self, request, *args, **kwargs):
        usuario = request.user

        if usuario.is_authenticated:
            conteudo = dados(
                ConteudoModel.objects.filter(user=request.user.id))
            print(ConteudoModel.objects.filter(user=request.user.id))
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
