"""
apps/jalgaon_glimpse/services.py
--------------------------------
YouTubeService — communication with the YouTube Data API v3 for Jalgaon Glimpse.
"""

import re
import html
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL  = 'https://www.googleapis.com/youtube/v3/search'
YOUTUBE_VIDEOS_URL  = 'https://www.googleapis.com/youtube/v3/videos'
YOUTUBE_CHANNEL_URL = 'https://www.googleapis.com/youtube/v3/channels'

REQUEST_TIMEOUT = 10  # seconds


class YouTubeServiceError(Exception):
    pass


class YouTubeQuotaError(Exception):
    pass


class YouTubeConfigError(Exception):
    pass


def _parse_iso8601_duration_seconds(duration: str) -> int:
    match = re.match(
        r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?',
        duration or ''
    )
    if not match:
        return 0
    days, hours, minutes, seconds = [int(v) if v else 0 for v in match.groups()]
    return days * 86400 + hours * 3600 + minutes * 60 + seconds


def _is_short(duration_seconds: int, title: str = '', description: str = '') -> bool:
    text = f'{title} {description}'.lower()
    has_short_tag = '#short' in text or '#shorts' in text
    return (0 < duration_seconds <= 180) or has_short_tag


class YouTubeService:
    def __init__(self):
        self.api_key = getattr(settings, 'YOUTUBE_API_KEY', '')
        self.channel_id = getattr(settings, 'YOUTUBE_CHANNEL_ID', '')

        if not self.api_key:
            raise YouTubeConfigError('YOUTUBE_API_KEY is not configured in settings / .env')

    def _get(self, url: str, params: dict) -> dict:
        params['key'] = self.api_key
        try:
            resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        except requests.exceptions.Timeout:
            logger.warning('YouTube API request timed out: %s', url)
            raise YouTubeServiceError('YouTube API request timed out')
        except requests.exceptions.ConnectionError as exc:
            logger.warning('YouTube API connection error: %s | %s', url, exc)
            raise YouTubeServiceError('YouTube API connection error')

        data = resp.json()

        if not resp.ok:
            error_code = (data.get('error') or {}).get('code', resp.status_code)
            error_msg  = (data.get('error') or {}).get('message', 'Unknown error')
            if error_code == 403:
                logger.error('YouTube API quota exceeded or forbidden: %s', error_msg)
                raise YouTubeQuotaError(error_msg)
            logger.error('YouTube API error %s: %s', error_code, error_msg)
            raise YouTubeServiceError(f'YouTube API error {error_code}: {error_msg}')

        return data

    def _fetch_video_stats(self, video_ids: list[str]) -> dict[str, dict]:
        if not video_ids:
            return {}
        data = self._get(YOUTUBE_VIDEOS_URL, {
            'part': 'contentDetails,statistics',
            'id': ','.join(video_ids),
            'maxResults': 50,
        })
        result = {}
        for item in data.get('items', []):
            vid_id = item.get('id', '')
            raw_duration = item.get('contentDetails', {}).get('duration', '')
            stats = item.get('statistics', {})
            result[vid_id] = {
                'duration_seconds': _parse_iso8601_duration_seconds(raw_duration),
                'view_count': stats.get('viewCount', '0'),
                'like_count': stats.get('likeCount', '0'),
            }
        return result

    @staticmethod
    def _build_video_dict(search_item: dict, video_stats: dict) -> dict:
        snippet    = search_item.get('snippet', {})
        video_id   = (search_item.get('id') or {}).get('videoId', '')
        thumbnails = snippet.get('thumbnails', {})
        thumb_url = (
            (thumbnails.get('maxres') or {}).get('url')
            or (f'https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg' if video_id else '')
            or (thumbnails.get('high') or {}).get('url', '')
        )

        title = html.unescape(snippet.get('title', ''))
        description = html.unescape(snippet.get('description', ''))
        stats = video_stats.get(video_id, {})
        duration_seconds = stats.get('duration_seconds', 0)

        return {
            'video_id':         video_id,
            'title':            title,
            'description':      description,
            'thumbnail_url':    thumb_url,
            'published_at':     snippet.get('publishedAt', ''),
            'youtube_url':      f'https://www.youtube.com/watch?v={video_id}',
            'embed_url':        f'https://www.youtube.com/embed/{video_id}',
            'duration_seconds': duration_seconds,
            'is_short':         _is_short(duration_seconds, title, description),
            'view_count':       stats.get('view_count', '0'),
            'like_count':       stats.get('like_count', '0'),
        }

    def fetch_channel_videos(self, page_token: str = '', max_results: int = 12) -> dict:
        if not self.channel_id:
            raise YouTubeConfigError('YOUTUBE_CHANNEL_ID is not configured in settings / .env')

        params = {
            'part':       'snippet',
            'channelId':  self.channel_id,
            'type':       'video',
            'order':      'date',
            'maxResults': min(int(max_results), 50),
        }
        if page_token:
            params['pageToken'] = page_token

        data = self._get(YOUTUBE_SEARCH_URL, params)
        items = data.get('items', [])

        video_ids = [(item.get('id') or {}).get('videoId', '') for item in items]
        video_ids = [vid for vid in video_ids if vid]
        video_stats = self._fetch_video_stats(video_ids)

        results = [
            self._build_video_dict(item, video_stats)
            for item in items
        ]

        page_info = data.get('pageInfo', {})
        return {
            'results':         results,
            'next_page_token': data.get('nextPageToken'),
            'prev_page_token': data.get('prevPageToken'),
            'total_results':   page_info.get('totalResults', len(results)),
        }

    def fetch_video_detail(self, video_id: str) -> dict:
        data = self._get(YOUTUBE_VIDEOS_URL, {
            'part':   'snippet,contentDetails,statistics',
            'id':     video_id,
        })
        items = data.get('items', [])
        if not items:
            raise YouTubeServiceError(f'Video not found: {video_id}')

        item    = items[0]
        snippet = item.get('snippet', {})
        stats   = item.get('statistics', {})
        raw_dur = item.get('contentDetails', {}).get('duration', '')
        dur_sec = _parse_iso8601_duration_seconds(raw_dur)

        thumbnails = snippet.get('thumbnails', {})
        thumb_url = (
            (thumbnails.get('maxres') or {}).get('url')
            or (f'https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg' if video_id else '')
            or (thumbnails.get('high') or {}).get('url', '')
        )

        title = html.unescape(snippet.get('title', ''))
        description = html.unescape(snippet.get('description', ''))

        return {
            'video_id':         video_id,
            'title':            title,
            'description':      description,
            'thumbnail_url':    thumb_url,
            'published_at':     snippet.get('publishedAt', ''),
            'youtube_url':      f'https://www.youtube.com/watch?v={video_id}',
            'embed_url':        f'https://www.youtube.com/embed/{video_id}',
            'duration_seconds': dur_sec,
            'is_short':         _is_short(dur_sec, title, description),
            'view_count':       stats.get('viewCount', '0'),
            'like_count':       stats.get('likeCount', '0'),
            'channel_title':    snippet.get('channelTitle', ''),
            'tags':             snippet.get('tags', []),
        }

    def fetch_channel_info(self) -> dict:
        if not self.channel_id:
            raise YouTubeConfigError('YOUTUBE_CHANNEL_ID is not configured in settings / .env')

        data = self._get(YOUTUBE_CHANNEL_URL, {
            'part':       'snippet,statistics',
            'id':         self.channel_id,
        })
        items = data.get('items', [])
        if not items:
            raise YouTubeServiceError('Channel not found')

        item    = items[0]
        snippet = item.get('snippet', {})
        stats   = item.get('statistics', {})
        thumbs  = snippet.get('thumbnails', {})
        thumb   = (
            thumbs.get('high')
            or thumbs.get('medium')
            or thumbs.get('default')
            or {}
        )

        return {
            'channel_id':        self.channel_id,
            'title':             snippet.get('title', ''),
            'description':       snippet.get('description', ''),
            'custom_url':        snippet.get('customUrl', ''),
            'thumbnail_url':     thumb.get('url', ''),
            'subscriber_count':  stats.get('subscriberCount', '0'),
            'video_count':       stats.get('videoCount', '0'),
            'view_count':        stats.get('viewCount', '0'),
            'youtube_url':       f'https://www.youtube.com/channel/{self.channel_id}',
        }
