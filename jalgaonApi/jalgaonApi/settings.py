from pathlib import Path
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
DJANGO_ENV = os.getenv('DJANGO_ENV', 'development')

try:
    from dotenv import load_dotenv
    generic_env = os.path.join(BASE_DIR, '.env')
    if os.path.exists(generic_env):
        load_dotenv(generic_env)
    else:
        if DJANGO_ENV == 'production':
            load_dotenv(os.path.join(BASE_DIR, '.env.production'))
        else:
            load_dotenv(os.path.join(BASE_DIR, '.env.development'))
except ImportError:
    pass


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-puv6kv)$735=-=71i*xk28t5ve726_=o(hgc#vxf-5@4jf_yo+')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

allowed_hosts_env = os.getenv('ALLOWED_HOSTS')
if allowed_hosts_env:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
else:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'www.jalgaon.com', 'api.jalgaon.com']

csrf_trusted_origins_env = os.getenv('CSRF_TRUSTED_ORIGINS')
if csrf_trusted_origins_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted_origins_env.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = ['https://api.jalgaon.com', 'https://www.jalgaon.com']


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'core',
    'apps.accounts',
    'apps.directory',
    'apps.search',
    'apps.reviews',
    'apps.news',
    'apps.blog',
    'apps.jobs',
    'apps.events',
    'apps.ads',
    'apps.payments',
    'apps.notifications',
    'apps.dashboard',
    'apps.admin_panel',
    'apps.cms',
    'apps.media_lib',
    'apps.audit',
    'apps.analytics',
    'apps.startups',
    'apps.clubs',
    'apps.tourism',
    'apps.ngo',
    'apps.finance',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'jalgaonApi.urls'

AUTH_USER_MODEL = 'accounts.User'

# REST framework settings
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_SAVE_EVERY_REQUEST = True

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # --- Rate Limiting (NFR-SEC-06) ---
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/min',   # Unauthenticated: 100 req/min per IP
        'user': '500/min',   # Authenticated: 500 req/min per user
    },
}

SIMPLE_JWT = {
    # Access token: 15 minutes (industry standard — short window limits damage if stolen)
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),

    # Refresh token: 7 days (PRD FR-AUTH-06 default)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Security: Every use of a refresh token rotates it (issues a new one)
    'ROTATE_REFRESH_TOKENS': True,

    # Security: Old refresh token is immediately blacklisted after rotation
    'BLACKLIST_AFTER_ROTATION': True,

    # Track last login timestamp automatically
    'UPDATE_LAST_LOGIN': True,

    # Signing algorithm (HS256 for now; RS256 migration is in the pending backlog)
    'ALGORITHM': 'HS256',
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    # Token configuration
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    # Include user role in token payload for frontend role checks
    'TOKEN_OBTAIN_SERIALIZER': 'apps.accounts.serializers.CustomTokenObtainPairSerializer',
}

CSRF_COOKIE_NAME = 'csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'jalgaonApi.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
USE_SQLITE = os.getenv('USE_SQLITE', 'False').lower() in ('true', '1', 'yes')

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql_psycopg2'),
            'NAME': os.getenv('DB_NAME', 'jalgaon_database'),
            'USER': os.getenv('DB_USER', ''),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', '127.0.0.1'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }



# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
CORS_ALLOW_CREDENTIALS = True

cors_allowed_origins_env = os.getenv('CORS_ALLOWED_ORIGINS')
if cors_allowed_origins_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_allowed_origins_env.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'https://api.jalgaon.com',
        'https://www.jalgaon.com',
        'capacitor://localhost',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ]

# ─────────────────────────────────────────────────────────────────────────────
# SWAGGER / OPENAPI DOCUMENTATION (PRD §15.1)
# Accessible at /api/docs/ — restrict to staff only in production
# ─────────────────────────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Jalgaon.com API',
    'DESCRIPTION': (
        'City Digital Ecosystem Platform — RESTful API for business directory, '
        'news, events, jobs, and authentication.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayRequestDuration': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
}

# ─────────────────────────────────────────────────────────────────────────────
# SECURITY HEADERS (NFR-SEC-04: XSS Protection via CSP)
# These only apply in production (DEBUG=False).
# ─────────────────────────────────────────────────────────────────────────────
if not DEBUG:
    # Prevent browsers from MIME-sniffing the Content-Type header
    SECURE_CONTENT_TYPE_NOSNIFF = True

    # Enable browser's built-in XSS filter (legacy browsers)
    SECURE_BROWSER_XSS_FILTER = True

    # Prevent this site from being loaded in a frame/iframe (clickjacking)
    X_FRAME_OPTIONS = 'DENY'

    # Force HTTPS for 1 year; include subdomains
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Redirect all HTTP to HTTPS (Nginx already does this, but Django adds a fallback)
    SECURE_SSL_REDIRECT = False  # Keep False — Nginx handles SSL termination

    # Session and CSRF cookies only sent over HTTPS
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Session cookie not readable by JavaScript
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = False  # Must be False so JS can read CSRF token for AJAX

    # Limit cookie scope to same-site requests (CSRF protection)
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'

