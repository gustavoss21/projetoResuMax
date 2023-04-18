from django.urls import path
from .views import CadastroView, LoginView, logout_view

urlpatterns = [
    # path('cadastro/', CadastroView.as_view(), name='cadastro'),
    path('accounts/login/', LoginView.as_view(), name='login'),
    path('cadastro/', CadastroView.as_view(), name='cadastro'),
    path('logout/', logout_view, name='logout'),
]
