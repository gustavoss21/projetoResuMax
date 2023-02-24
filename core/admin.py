import site
from django.contrib import admin
from .models import ConteudoModel, SubtemaModel, TopicoModel, DestaqueModel, ImportanteModel


@admin.register(ConteudoModel)
class ConteudoAdmin(admin.ModelAdmin):
    list_display = ('conteudo', 'tema', 'input_file',
                    'summany_file', 'conteudo_pdf')


@admin.register(SubtemaModel)
class SubtemaAdmin(admin.ModelAdmin):
    list_display = ('subtema','id')


@admin.register(TopicoModel)
class TopicoAdmin(admin.ModelAdmin):
    list_display = ('topico', 'id')


@admin.register(DestaqueModel)
class DestaqueAdmin(admin.ModelAdmin):
    list_display = ('destaque', 'id')


@admin.register(ImportanteModel)
class ImportateAdmin(admin.ModelAdmin):
    list_display = ('importante', 'id')
