from django import forms

class MyPrintForm(forms.Form):
    file = forms.FileField()
    orientation = forms.ChoiceField(choices=[('portrait', 'Portrait'), ('landscape', 'Landscape')])
    copies = forms.IntegerField(min_value=1)
