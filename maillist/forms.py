from django import forms
from django.utils.translation import ugettext as _

class EmailForm(forms.Form):
    email = forms.EmailField(_("email"))

