import shutil
from django.contrib.auth import logout
from django.shortcuts import redirect, render
from django.contrib import messages
from django.views.generic.edit import FormView,BaseFormView
from django.contrib.auth import authenticate, login, logout
import os
from .forms import CustomUsuarioCreateForm
from django.urls import reverse_lazy

class CadastroView(FormView):
    template_name = 'cadastro.html'
    form_class = CustomUsuarioCreateForm
    success_url = reverse_lazy('login')

    def form_valid(self, form, *args, **kwargs):
        self.form_class.save(form, commit=True)
        messages.add_message(self.request, messages.SUCCESS,
                             'agora é só fazer login!')
        return super(CadastroView, self).form_valid(form, *args, **kwargs)
 
class LoginView(BaseFormView):

    def get(self, request, *args, **kargs):

        return render(request, 'login.html')

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:  # verifica se já esta logado
            messages.warning(
                request, f'Você já esta logado com usuario "{request.user}"')
            return redirect('home')

        user_login = request.POST.get('nome').strip()
        senha_login = request.POST.get('senha').strip()
        if not user_login:  # verifica se foi passado o nome de usuario
            return render(request, 'login.html')  # msg faltou user
        if not senha_login:  # verifica se foi passado a senha de usuario
            return render(request, 'login.html')  # msg faltou senha

        user = authenticate(
            request, username=user_login, password=senha_login)

        if user is not None:  # verifica se tem o usuario no banco de dados
            login(request, user)
            messages.success(request, f'{user_login}, Seja bem vindo!')
            return redirect('home')
        else:
            messages.error(request, 'Usuario ou senha não conferem!')
            return render(request, 'login.html')


def logout_view(request):
    messages.success(request, f'{request.user}, volte logo!')
    logout(request)
    return redirect('home')


