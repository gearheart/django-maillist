import os

from django.contrib import messages
from django.shortcuts import redirect, get_object_or_404
from django.utils.translation import ugettext as _

from django.http import Http404, HttpResponse
from django.core.files.storage import default_storage
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sites.models import Site
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import user_passes_test

from maillist.models import Maillist, Subscriber
from maillist.forms import EmailForm, ImageForm
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
        form = EmailForm()

    return {
        'maillist': maillist,
        'form': form,
    }


@render_to('maillist/maillist_unsubscribe.html')
def maillist_unsubscribe(request, maillist_id, subscriber_id, hash, next=None):
    maillist = get_object_or_404(Maillist, id=maillist_id)
    subscriber = get_object_or_404(maillist.subscribers.all(), id=subscriber_id)

    if maillist.unsubscibe_hash(subscriber) != hash:
        raise Http404()

    if request.method == 'POST':
        subscriber.delete()
        messages.info(request, _('You are unsubscribed from %s' % maillist))
        return redirect(request.POST.get('next') or next or 'maillist_list')

    return {
        'maillist': maillist,
        'email': email,
    }

@csrf_exempt
@require_POST
@user_passes_test(lambda u: u.is_staff)
def maillist_upload(request):
    if request.method == 'POST':
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            file = form.cleaned_data['file']
            path = os.path.join(
                getattr(settings, 'MAILLIST_UPLOAD_IMAGES', 'maillist/images/'),
                file.name)
            real_path = default_storage.save(path, file)
            return HttpResponse(
                'http://%s%s' % (
                    Site.objects.get_current().domain,
                    os.path.join(settings.MEDIA_URL, real_path)
                )
            )
    return HttpResponse(status=403)
