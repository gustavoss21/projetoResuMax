from django.db import models
# from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

class ConteudoModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    id = models.BigAutoField(primary_key=True)
    conteudo = models.TextField()
    tema = models.CharField(blank=True,max_length=20,unique=True)
    tema = models.CharField(blank=True,max_length=20,unique=True)
    conteudo_pdf = models.FileField(upload_to='conteudo_pdf', blank=True)

    def __str__(self):
        return self.conteudo

    class Meta:
        verbose_name = 'Conteudo'
        verbose_name_plural = 'Conteudos'


class FiltroItemModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    filter_type = models.CharField('Typo de filtro',max_length=9)
    text = models.TextField(blank=False)
    index = models.IntegerField(blank=False)
    length = models.IntegerField(blank=False)
    folha_index = models.IntegerField(blank=False)

    class Meta:
        verbose_name = 'Typo de filtro'
        verbose_name_plural = 'Typos de filtros'


# class TopicoModel(models.Model):
#     user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
#     topico = models.TextField(blank=True)
#     index = models.IntegerField()
#     tamanho = models.IntegerField()
#     folha_index = models.IntegerField()

#     class Meta:
#         verbose_name = 'Topico'
#         verbose_name_plural = 'Topicos'


# class DestaqueModel(models.Model):
#     user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
#     destaque = models.TextField(blank=True)
#     index = models.IntegerField()
#     tamanho = models.IntegerField()
#     folha_index = models.IntegerField()

#     class Meta:
#         verbose_name = 'Destaque'
#         verbose_name_plural = 'Destaques'


# class ImportanteModel(models.Model):
#     user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
#     importante = models.TextField(blank=True)
#     index = models.IntegerField()
#     tamanho = models.IntegerField()
#     folha_index = models.IntegerField()

#     class Meta:
#         verbose_name = 'Importante'
#         verbose_name_plural = 'Importantes'
