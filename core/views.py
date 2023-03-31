from django.shortcuts import render
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.views.generic.base import TemplateView, View
import json
from .utils import utils
from .models import ConteudoModel,DestaqueModel,ImportanteModel,SubtemaModel,TopicoModel
from django.core.files.base import ContentFile
from django.http import FileResponse
# Create your views here.

# atençao a parada forçada na renderizaçao da folha
def dados(model):
    lista = []
    for value in model.values():
        lista.append(value)

    return lista

class HomeView(TemplateView):
    template_name = 'index.html'

    def post(self,request,*args,**kwargs):
        context = {}
        file = request.FILES
        file = file.get('avatar')
        support_type = ['pdf','txt']
        if not (file.name[-3:] in support_type):
            messages.error(request,'Error: typo de arquivo não suportado.')
            return redirect('home')
        
        texto = utils.text_extract(file)
        if not texto:
            messages.error(request,'arquivo não suportado!')
            context['output'] = 'vazio'
            return render(request,'index.html')
        
        print(texto)
        context['output'] = texto
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
        resultado = artigo.get_or_create(id=1)
        resultado[0].conteudo = dados.get('conteudo')
       
        if resultado[0].conteudo_pdf:
            utils.apagarPdf(resultado[0].conteudo_pdf.path)
        content_file = ContentFile(
            (dados.get('pdf')).encode('UTF-8'), name='arquivoResumax.txt')
       
        resultado[0].conteudo_pdf = content_file
        resultado[0].save()
        return HttpResponse('1')
    
class SalvarTopico(View):
    def post(self, request, *args, **kwargs):
        usuario = request.user
        
        if usuario.is_authenticated:
            dados = json.loads(request.body)
            TopicoModel.objects.create(topico=dados.get('topico'), index=dados.get('index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'))

        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarSubtema(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            SubtemaModel.objects.create(subtema=dados.get('subtema'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'))
 
        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarDestaque(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            DestaqueModel.objects.create(destaque=dados.get('destaque'), index=dados.get(
                'index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'))

        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)

class SalvarImportante(View):
    def post(self, request, *args, **kwargs):
        dados = json.loads(request.body)
        usuario = request.user

        if usuario.is_authenticated:
            ImportanteModel.objects.create(importante=dados.get('importante'), index=dados.get('index'), tamanho=dados.get('tamanho'), folha_index=dados.get('folha_index'))

        else:

            messages.warning(request, 'faça login, para salvar dados!')
        return HttpResponse(1)


class BaixarArquivo(View):
	def get(self, request, *args, **kwargs):
		pdf = ConteudoModel.objects.filter(id=1).first()
		if pdf:
			return	FileResponse(pdf.conteudo_pdf, as_attachment=True)
		else:
			messages.warning(request,'salve primeiro para baixar pdf ')
			return	redirect('home')
        

class GetDataAll(View):
    def get(self, request, *args, **kwargs):
        subtema = SubtemaModel.objects.all()
        importante = ImportanteModel.objects.all()
        destaque = DestaqueModel.objects.all()
        topico = TopicoModel.objects.all()
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
            conteudo = dados(ConteudoModel.objects.all())
            if len(conteudo) == 0:
                return HttpResponse(json.dumps('vazio'))
            
            conteudo = conteudo[0]
            temporario = request.session.get('temporario')
            if temporario:
                del request.session['temporario']
                return HttpResponse(json.dumps({'conteudo':conteudo['conteudo'],'temporario':temporario}))

            return HttpResponse(json.dumps({'conteudo': conteudo['conteudo']}))
        return HttpResponse(json.dumps('vazio'))


