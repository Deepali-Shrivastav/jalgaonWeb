import requests

def send_otp(phone_number, otp):
    url = "https://www.fast2sms.com/dev/bulkV2"
    api_key = "kocp8AH2aMJe1LFgxVX6iBfmlNdY9nIrqOQ4GbhtRZ7Ps0KDujg4SfP6AIul9DmX8WCzYc3xGUeryob1"
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

    response = requests.post(url, json=payload, headers=headers)
    return response.json()
