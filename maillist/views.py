from django.contrib import messages
from django.shortcuts import redirect, get_object_or_404
from django.utils.translation import ugettext as _

from django.http import Http404, HttpResponse

from maillist.models import Maillist, Subscriber
from maillist.forms import EmailForm
from maillist.utils import render_to


@render_to('maillist/maillist_subscribe.html')
def maillist_subscribe(request, maillist_id, next=None):
    maillist = get_object_or_404(Maillist, id=maillist_id)

    if request.method == 'POST':
        form = EmailForm(request.POST)
        if form.is_valid():
            subscriber, created = Subscriber.objects.get_or_create(
                maillist=maillist,
                email=form.cleaned_data['email']
            )
            if created:
                message = _("You are subscribed to %s") % maillist
            else:
                message = _("You are already subscribed to %s") % maillist

            messages.info(request, message)
            return redirect(request.POST.get('next') or next or 'maillist_list')
    else:
        form = SubscriberForm()

    return {
        'maillist': maillist,
        'form': form,
    }
