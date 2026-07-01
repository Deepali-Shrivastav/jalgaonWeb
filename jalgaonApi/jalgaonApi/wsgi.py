"""
WSGI config for jalgaonApi project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')

django_app = get_wsgi_application()

def application(environ, start_response):
    try:
        log_file = '/home/ubuntu/jalgaonWeb/jalgaonApi/wsgi_debug.log'
        with open(log_file, 'a') as f:
            f.write("=== NEW REQUEST ===\n")
            f.write(f"PATH_INFO: {environ.get('PATH_INFO')}\n")
            f.write(f"HTTP_HOST: {environ.get('HTTP_HOST')}\n")
            f.write(f"HTTP_ORIGIN: {environ.get('HTTP_ORIGIN')}\n")
            f.write(f"HTTP_REFERER: {environ.get('HTTP_REFERER')}\n")
            f.write(f"SERVER_NAME: {environ.get('SERVER_NAME')}\n")
            f.write(f"SERVER_PORT: {environ.get('SERVER_PORT')}\n")
            f.write(f"REQUEST_METHOD: {environ.get('REQUEST_METHOD')}\n")
            f.write(f"HTTP_X_FORWARDED_FOR: {environ.get('HTTP_X_FORWARDED_FOR')}\n")
            f.write(f"HTTP_X_FORWARDED_PROTO: {environ.get('HTTP_X_FORWARDED_PROTO')}\n")
            f.write("===================\n\n")
    except Exception:
        pass
    return django_app(environ, start_response)
