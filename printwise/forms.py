from django import forms

class MyPrintForm(forms.Form):
    file = forms.FileField()  # This handles the file input field
    copies = forms.IntegerField(min_value=1, initial=1)
    orientation = forms.ChoiceField(choices=[('portrait', 'Portrait'), ('landscape', 'Landscape')])
