import site
from django.contrib import admin
from .models import ConteudoModel, FiltroItemModel


@admin.register(ConteudoModel)
class ConteudoAdmin(admin.ModelAdmin):
    list_display = ('conteudo', 'tema', 'user')


@admin.register(FiltroItemModel)
class SubtemaAdmin(admin.ModelAdmin):
    list_display = ('user','filter_type','text' )
