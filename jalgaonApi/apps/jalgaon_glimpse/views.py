"""
apps/jalgaon_glimpse/views.py
------------------------------
API views for Jalgaon Glimpse integration:
- YouTubeVideoListView: GET /api/v1/jalgaon-glimpse/videos/
- YouTubeVideoDetailView: GET /api/v1/jalgaon-glimpse/videos/<video_id>/
- YouTubeChannelInfoView: GET /api/v1/jalgaon-glimpse/channel/
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.jalgaon_glimpse.services import (
    YouTubeService,
    YouTubeServiceError,
    YouTubeQuotaError,
    YouTubeConfigError
)
from apps.jalgaon_glimpse import cache as yt_cache
from apps.jalgaon_glimpse.serializers import (
    YouTubeVideoListResponseSerializer,
    YouTubeVideoDetailSerializer,
    YouTubeChannelSerializer
)

logger = logging.getLogger(__name__)


class YouTubeVideoListView(APIView):
    """
    GET /api/v1/jalgaon-glimpse/videos/
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        page_token = request.query_params.get('page_token', '')
        try:
            max_results = int(request.query_params.get('max_results', 12))
            max_results = max(1, min(max_results, 50))
        except ValueError:
            max_results = 12

        # 1. Check cache
        cached_data = yt_cache.get_videos(page_token, max_results)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        # 2. Fetch from YouTube service
        try:
            service = YouTubeService()
            data = service.fetch_channel_videos(page_token=page_token, max_results=max_results)
            serializer = YouTubeVideoListResponseSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serialized_data = serializer.data

            yt_cache.set_videos(serialized_data, page_token, max_results)
            return Response(serialized_data, status=status.HTTP_200_OK)

        except YouTubeConfigError as exc:
            logger.warning(f"YouTube config error: {exc}")
            return Response(
                {"error": "YouTube integration not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeQuotaError as exc:
            logger.error(f"YouTube quota error: {exc}")
            return Response(
                {"error": "YouTube API quota exceeded. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeServiceError as exc:
            logger.error(f"YouTube service error: {exc}")
            return Response(
                {"error": "Could not reach YouTube at this time."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as exc:
            logger.exception("Unexpected error in YouTubeVideoListView")
            return Response(
                {"error": f"An unexpected error occurred: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class YouTubeVideoDetailView(APIView):
    """
    GET /api/v1/jalgaon-glimpse/videos/<str:video_id>/
    """
    permission_classes = [AllowAny]

    def get(self, request, video_id, *args, **kwargs):
        if not video_id:
            return Response({"error": "Video ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check cache
        cached_data = yt_cache.get_video_detail(video_id)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        # 2. Fetch from YouTube service
        try:
            service = YouTubeService()
            data = service.fetch_video_detail(video_id)
            serializer = YouTubeVideoDetailSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serialized_data = serializer.data

            yt_cache.set_video_detail(video_id, serialized_data)
            return Response(serialized_data, status=status.HTTP_200_OK)

        except YouTubeConfigError:
            return Response(
                {"error": "YouTube integration not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeQuotaError:
            return Response(
                {"error": "YouTube API quota exceeded. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeServiceError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_404_NOT_FOUND if "not found" in str(exc).lower() else status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as exc:
            logger.exception("Unexpected error in YouTubeVideoDetailView")
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class YouTubeChannelInfoView(APIView):
    """
    GET /api/v1/jalgaon-glimpse/channel/
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # 1. Check cache
        cached_data = yt_cache.get_channel_info()
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        # 2. Fetch from YouTube service
        try:
            service = YouTubeService()
            data = service.fetch_channel_info()
            serializer = YouTubeChannelSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serialized_data = serializer.data

            yt_cache.set_channel_info(serialized_data)
            return Response(serialized_data, status=status.HTTP_200_OK)

        except YouTubeConfigError:
            return Response(
                {"error": "YouTube integration not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeQuotaError:
            return Response(
                {"error": "YouTube API quota exceeded. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except YouTubeServiceError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as exc:
            logger.exception("Unexpected error in YouTubeChannelInfoView")
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
