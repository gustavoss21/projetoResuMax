from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User



class CustomUsuarioCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username',)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        user.username = self.cleaned_data['username']
        if commit:
            user.save()
        return user
