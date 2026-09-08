import os
import json
import re
from pathlib import Path
from django.conf import settings
from django.utils import timezone

DATA_FILE_PATH = settings.BASE_DIR / 'data' / 'floating_video_ad.json'

DEFAULT_CONFIG = {
    "enabled": False,
    "platform": "youtube",
    "title": "Feature of the day",
    "url": "",
    "embed_url": "",
    "video_id": "",
    "updated_at": None
}

YOUTUBE_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?(?:m\.)?(?:youtu\.be/|youtube\.com/(?:embed/|v/|watch\?v=|watch\?.+&v=|shorts/))([\w-]{11})',
    re.IGNORECASE
)

INSTAGRAM_REGEX = re.compile(
    r'(?:https?://)?(?:www\.)?instagram\.com/(?:reel|p)/([\w-]{9,})',
    re.IGNORECASE
)

def parse_and_validate_ad_url(raw_url, platform_preference=None):
    """
    Parses and validates a YouTube or Instagram URL.
    Returns dict:
    {
        "valid": bool,
        "platform": "youtube" | "instagram" | None,
        "video_id": str,
        "embed_url": str,
        "error": str | None
    }
    """
    if not raw_url or not isinstance(raw_url, str):
        return {
            "valid": False,
            "platform": None,
            "video_id": "",
            "embed_url": "",
            "error": "URL cannot be empty."
        }

    url = raw_url.strip()

    # Check YouTube
    yt_match = YOUTUBE_REGEX.search(url)
    if yt_match:
        video_id = yt_match.group(1)
        embed_url = f"https://www.youtube-nocookie.com/embed/{video_id}?autoplay=1&mute=1&enablejsapi=1&rel=0"
        return {
            "valid": True,
            "platform": "youtube",
            "video_id": video_id,
            "embed_url": embed_url,
            "error": None
        }

    # Check Instagram
    ig_match = INSTAGRAM_REGEX.search(url)
    if ig_match:
        shortcode = ig_match.group(1)
        embed_url = f"https://www.instagram.com/p/{shortcode}/embed/"
        return {
            "valid": True,
            "platform": "instagram",
            "video_id": shortcode,
            "embed_url": embed_url,
            "error": None
        }

    return {
        "valid": False,
        "platform": None,
        "video_id": "",
        "embed_url": "",
        "error": "Please enter a valid YouTube or Instagram URL."
    }

def get_floating_ad_config():
    """
    Reads floating video ad configuration from data/floating_video_ad.json.
    Non-database persistence implementation.
    """
    if not os.path.exists(DATA_FILE_PATH):
        return DEFAULT_CONFIG.copy()

    try:
        with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Ensure keys
            merged = DEFAULT_CONFIG.copy()
            merged.update(data)
            return merged
    except Exception:
        return DEFAULT_CONFIG.copy()

def save_floating_ad_config(config_dict):
    """
    Saves floating video ad configuration to data/floating_video_ad.json safely.
    Non-database persistence implementation.
    """
    os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)
    
    config_to_save = DEFAULT_CONFIG.copy()
    config_to_save.update(config_dict)
    config_to_save['updated_at'] = timezone.now().isoformat()

    # Write atomically via temp file
    temp_path = str(DATA_FILE_PATH) + ".tmp"
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(config_to_save, f, indent=2)
    
    os.replace(temp_path, DATA_FILE_PATH)
    return config_to_save
