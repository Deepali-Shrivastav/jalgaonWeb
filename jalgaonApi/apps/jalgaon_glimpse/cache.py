"""
apps/jalgaon_glimpse/cache.py
------------------------------
Cache key constants and helper functions for Jalgaon Glimpse app.
Uses Django's LocMemCache (configured in settings.py).
"""

from django.core.cache import cache

CACHE_TTL_VIDEOS  = 24 * 60 * 60   # 24 hours — video list
CACHE_TTL_DETAIL  = 24 * 60 * 60   # 24 hours — single video detail
CACHE_TTL_CHANNEL = 24 * 60 * 60   # 24 hours  — channel info


def videos_key(page_token: str = '', max_results: int = 12) -> str:
    token_part = page_token or 'first'
    return f'jalgaon_glimpse_videos_{token_part}_{max_results}'


def video_detail_key(video_id: str) -> str:
    return f'jalgaon_glimpse_video_{video_id}'


CHANNEL_KEY = 'jalgaon_glimpse_channel_info'


def get_videos(page_token: str = '', max_results: int = 12):
    return cache.get(videos_key(page_token, max_results))


def set_videos(data: dict, page_token: str = '', max_results: int = 12) -> None:
    cache.set(videos_key(page_token, max_results), data, timeout=CACHE_TTL_VIDEOS)


def get_video_detail(video_id: str):
    return cache.get(video_detail_key(video_id))


def set_video_detail(video_id: str, data: dict) -> None:
    cache.set(video_detail_key(video_id), data, timeout=CACHE_TTL_DETAIL)


def get_channel_info():
    return cache.get(CHANNEL_KEY)


def set_channel_info(data: dict) -> None:
    cache.set(CHANNEL_KEY, data, timeout=CACHE_TTL_CHANNEL)
