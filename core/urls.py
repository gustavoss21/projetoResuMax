from django.urls import path
from .views import (HomeView, SalvarConteudo, apagadorTextoFucao,
                    BaixarArquivo,AddDataFilterViews, FilterItemsViews,
                    GetSheetData, MaisFolhas)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('salvarConteudo/', SalvarConteudo.as_view(), name='salvarConteudo'),
    path('save-filter-item/', AddDataFilterViews.as_view(), name='AddDataFilterViews'),
    path('apagadorTextoFucao/', apagadorTextoFucao, name='apagadorTextoFucao'),
    path('baixar-pdf/', BaixarArquivo.as_view(), name='baixar-pdf'),
    path('filter-items/<str:data>', FilterItemsViews.as_view(), name='FilterItemsViews'),
    path('get-sheet-data/', GetSheetData.as_view(), name='get-sheet-data'),
    path('mais-folhas/', MaisFolhas.as_view(), name='mais-folhas'),
    
]

