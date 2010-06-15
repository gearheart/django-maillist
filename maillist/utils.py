from functools import wraps

from django.shortcuts import render_to_response
from django.template import RequestContext

def render_to(template=None):
    def renderer(func):
        @wraps(func)
        def wrapper(request, *args, **kw):
            output = func(request, *args, **kw)
            if isinstance(output, (list, tuple)):
                return render_to_response(output[1], output[0],
                                          RequestContext(request))
            if isinstance(output, dict):
                return render_to_response(template, output,
                                          RequestContext(request))
            return output
        return wrapper
    return renderer
