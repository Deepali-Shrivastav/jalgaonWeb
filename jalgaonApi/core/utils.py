import os
from typing import Any, Optional
from django.conf import settings


def get_absolute_media_url(
    file_field_or_url: Any,
    request: Optional[Any] = None,
    default: str = ''
) -> str:
    """
    Returns a guaranteed full absolute URL (e.g. https://api.jalgaon.com/media/...)
    for any ImageField, FileField, or relative URL string.

    Ensures Flutter mobile apps and external API clients receive fully-qualified
    image URIs that can be loaded directly over the network.
    """
    if not file_field_or_url:
        return default

    # Extract URL string if an ImageFieldFile / FieldFile instance was passed.
    # Note: Accessing .url on an unattached FieldFile raises ValueError,
    # so we catch both AttributeError and ValueError safely.
    url = None
    try:
        url = file_field_or_url.url
    except (AttributeError, ValueError):
        pass
    except Exception:
        return default

    if url is None:
        if isinstance(file_field_or_url, str):
            url = file_field_or_url
        else:
            url = str(file_field_or_url)

    url = url.strip()
    if not url:
        return default

    # If already an absolute URL (e.g. Unsplash, Google Photos, or CDN)
    if url.startswith(('http://', 'https://')):
        return url

    # Ensure leading slash for relative path
    if not url.startswith('/'):
        url = '/' + url

    # Safely obtain MEDIA_URL and STATIC_URL (fall back if settings not loaded)
    try:
        media_url = getattr(settings, 'MEDIA_URL', '/media/')
    except Exception:
        media_url = '/media/'

    try:
        static_url = getattr(settings, 'STATIC_URL', '/static/')
    except Exception:
        static_url = '/static/'

    # Ensure correct media prefix for raw relative file paths
    # (e.g. '/tourism/places/ajanta.jpg' -> '/media/tourism/places/ajanta.jpg')
    if not url.startswith(media_url) and not url.startswith(static_url):
        url = f"{media_url.rstrip('/')}{url}"

    # If request is provided, prefer request.build_absolute_uri
    if request is not None:
        try:
            abs_url = request.build_absolute_uri(url)
            # If production domain or behind reverse proxy, guarantee HTTPS
            try:
                is_debug = getattr(settings, 'DEBUG', False)
            except Exception:
                is_debug = False

            if any(dom in abs_url for dom in ('jalgaon.com', 'api.jalgaon.com', 'www.jalgaon.com')) and abs_url.startswith('http://'):
                abs_url = 'https://' + abs_url[len('http://'):]
            elif not is_debug and abs_url.startswith('http://'):
                abs_url = 'https://' + abs_url[len('http://'):]
            return abs_url
        except Exception:
            pass

    # Fallback to configured domain or production domain
    base_host = os.getenv('API_BASE_URL', '').rstrip('/')
    if not base_host:
        try:
            is_debug = getattr(settings, 'DEBUG', False)
        except Exception:
            is_debug = False

        if is_debug:
            base_host = 'http://127.0.0.1:8000'
        else:
            base_host = 'https://api.jalgaon.com'

    return f"{base_host}{url}"
