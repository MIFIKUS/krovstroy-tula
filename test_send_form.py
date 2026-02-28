import json

import os

import requests


def main() -> None:
    """
    Простой тестовый скрипт для проверки эндпоинта /api/send-form.

    Перед запуском:
    1. Запусти бэкенд:
       uvicorn backend:app --reload
    2. При необходимости поменяй BASE_URL ниже.
    """

    base_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    url = f"{base_url.rstrip('/')}/api/send-form"

    payload = {
        "data": {
            "source": "test-script",
            "name": "Тестовый пользователь",
            "phone": "+7 999 123-45-67",
            "comment": "Это тестовая заявка для проверки отправки на почту.",
        }
    }

    print(f"POST {url}")
    response = requests.post(
        url,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"},
        timeout=10,
    )

    print("Status code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception:
        print("Raw response:", response.text)


if __name__ == "__main__":
    main()

