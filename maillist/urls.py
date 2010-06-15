from django.conf.urls.defaults import *
from django.views.generic.list_detail import object_list

from maillist.models import Maillist
from maillist import views

urlpatterns = patterns('',
    url(r'^$', object_list, {
        'queryset': Maillist.objects.all(),
        'template_object_name': 'maillist',
    }, 'maillist_list'),

    url(r'^(?P<maillist_id>\d+)/$',
        views.maillist_subscribe,
        name='maillist_subscribe'),

    url(r'^(?P<maillist_id>\d+)/(?P<subscriber_id>\d+)/(?P<hash>\w+)/$',
        views.maillist_unsubscribe,
        name='maillist_unsubscribe'),

    url(r'^admin/upload/$',
        views.maillist_upload,
        name='maillist_upload'),
)
