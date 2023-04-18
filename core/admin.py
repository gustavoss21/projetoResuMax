import site
from django.contrib import admin
from .models import ConteudoModel, SubtemaModel, TopicoModel, DestaqueModel, ImportanteModel


@admin.register(ConteudoModel)
class ConteudoAdmin(admin.ModelAdmin):
    list_display = ('conteudo', 'tema', 'user')


@admin.register(SubtemaModel)
class SubtemaAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','subtema', )


@admin.register(TopicoModel)
class TopicoAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','topico', )


@admin.register(DestaqueModel)
class DestaqueAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'destaque',)


@admin.register(ImportanteModel)
class ImportateAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','importante', )
