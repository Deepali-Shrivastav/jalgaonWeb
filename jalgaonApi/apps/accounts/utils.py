import os
import requests
import logging

logger = logging.getLogger(__name__)

def send_otp(phone_number, otp):
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        from django.conf import settings
        if getattr(settings, 'DEBUG', True):
            # Mock sending OTP for local development to save credits and avoid failures
            logger.info(f"MOCK OTP: The OTP for {phone_number} is {otp}")
            print(f"\n========================================\n[LOCAL DEV] OTP for {phone_number} is {otp}\n========================================\n")
            return {"return": True, "message": ["OTP sent successfully (MOCK)"]}
        else:
            logger.critical("FAST2SMS_API_KEY is not defined in the environment. SMS cannot be sent.")
            return {"return": False, "message": ["SMS gateway key missing"]}


    url = "https://www.fast2sms.com/dev/bulkV2"
    message = f"Your OTP is {otp}. Use this to verify your phone number."
    payload = {
        'sender_id': 'FSTSMS',
        'message': message,
        'language': 'english',
        'route': 'q',
        'numbers': phone_number,
    }
    headers = {
        'authorization': api_key,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache'
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.json()
    except Exception as e:
        logger.error(f"Failed to send OTP to {phone_number}: {str(e)}")
        return {"return": False, "message": str(e)}

