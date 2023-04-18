from django.db import models
from django.contrib.auth import get_user_model


class ConteudoModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    id = models.BigAutoField(primary_key=True)
    conteudo = models.TextField()
    tema = models.TextField(blank=True)
    conteudo_pdf = models.FileField(upload_to='conteudo_pdf', blank=True)

    def __str__(self):
        return self.conteudo

    class Meta:
        verbose_name = 'Conteudo'
        verbose_name_plural = 'Conteudos'


class SubtemaModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    subtema = models.TextField(blank=True)
    index = models.IntegerField()
    tamanho = models.IntegerField()
    folha_index = models.IntegerField()

    class Meta:
        verbose_name = 'Subtema'
        verbose_name_plural = 'Subtemas'


class TopicoModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    topico = models.TextField(blank=True)
    index = models.IntegerField()
    tamanho = models.IntegerField()
    folha_index = models.IntegerField()

    class Meta:
        verbose_name = 'Topico'
        verbose_name_plural = 'Topicos'


class DestaqueModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    destaque = models.TextField(blank=True)
    index = models.IntegerField()
    tamanho = models.IntegerField()
    folha_index = models.IntegerField()

    class Meta:
        verbose_name = 'Destaque'
        verbose_name_plural = 'Destaques'


class ImportanteModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    importante = models.TextField(blank=True)
    index = models.IntegerField()
    tamanho = models.IntegerField()
    folha_index = models.IntegerField()

    class Meta:
        verbose_name = 'Importante'
        verbose_name_plural = 'Importantes'
