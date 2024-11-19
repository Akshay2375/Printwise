from django import forms
from .models import MyPrint

class MyPrintForm(forms.ModelForm):
    class Meta:
        model = MyPrint
        fields = ['printfile']
