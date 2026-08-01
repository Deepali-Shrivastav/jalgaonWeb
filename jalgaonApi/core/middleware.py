import logging
from django.http import HttpResponseGone

logger = logging.getLogger(__name__)

SPAM_PREFIXES = [
    "/virtuals/",
    "/jackpots/",
    "/betplays/",
    "/casinoet/",
    "/slotwins/",
    "/onlinets/",
    "/casino/",
    "/casinos/",
    "/slots/",
    "/slot/",
    "/bet/",
    "/bets/",
    "/betting/",
    "/gambling/",
    "/gamble/",
    "/poker/",
    "/roulette/",
    "/blackjack/",
    "/baccarat/",
    "/lottery/",
    "/lotto/",
    "/sportsbook/",
    "/sportbet/",
    "/sports-betting/",
    "/livecasino/",
    "/onlinecasino/",
    "/online-casino/",
    "/onlinebet/",
    "/livebet/",
    "/casino-games/",
    "/casino-online/",
    "/vegas/",
    "/vegas-games/",
    "/crypto-casino/",
    "/bonus/",
    "/free-spins/",
    "/free-spin/",
    "/jackpot/",
    "/mega-jackpot/",
    "/pg-slot/",
    "/pgsoft/",
    "/joker/",
    "/joker123/",
    "/pragmatic/",
    "/pragmatic-play/",
    "/evolution/",
    "/1xbet/",
    "/188bet/",
    "/bet365/",
    "/ufabet/",
    "/sbobet/",
    "/bk8/",
    "/w88/",
    "/m88/",
    "/fun88/",
    "/win88/",
    "/kingmaker/",
    "/dragon-tiger/",
    "/fish-game/",
    "/fish-shooting/",
    "/esports/",
    "/casino-news/",
    "/gambling-news/",
    "/bet-news/",
    "/login-casino/",
    "/casino-login/",
]

class SpamGoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path.lower()

        if any(path.startswith(prefix) for prefix in SPAM_PREFIXES):
            logger.warning(f"[410] Blocked spam URL: {request.path}")
            return HttpResponseGone("Gone")

        return self.get_response(request)
   