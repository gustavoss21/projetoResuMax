from django.urls import path
from .views import (HomeView, SalvarConteudo, SalvarDestaque,
                    SalvarImportante, SalvarSubtema, SalvarTopico,
                    apagadorTextoFucao, BaixarArquivo, AdicionaArquivo,
                    GetDataAll, GetSheetData)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('salvarConteudo/', SalvarConteudo.as_view(), name='salvarConteudo'),
    path('salvarDestaque/', SalvarDestaque.as_view(), name='salvarDestaque'),
    path('salvarImportante/', SalvarImportante.as_view(), name='salvarImportante'),
    path('salvarSubtema/', SalvarSubtema.as_view(), name='salvarSubtema'),
    path('salvarTopico/', SalvarTopico.as_view(), name='salvarTopico'),
    path('apagadorTextoFucao/', apagadorTextoFucao, name='apagadorTextoFucao'),
    path('baixar-pdf/', BaixarArquivo.as_view(), name='baixar-pdf'),
    path('adiciona-arquivo/', AdicionaArquivo.as_view(), name='adiciona-arquivo'),
    path('get-dados/', GetDataAll.as_view(), name='get-dados'),
    path('get-sheet-data/', GetSheetData.as_view(), name='get-sheet-data'),
    
]

