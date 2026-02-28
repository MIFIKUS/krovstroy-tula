from typing import Any, Dict

import asyncio
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()




app = FastAPI(title="Krovstroy backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


email_queue: "asyncio.Queue[Dict[str, str]]" = asyncio.Queue()


async def _email_worker() -> None:
    """
    Фоновый воркер: вытаскивает письма из очереди и отправляет их.
    """

    loop = asyncio.get_running_loop()

    while True:
        item = await email_queue.get()
        try:
            subject = item.get("subject", "Заявка с сайта Krovstroy")
            body = item.get("body", "")

            # Отправляем письмо в отдельном потоке, чтобы не блокировать event loop
            await loop.run_in_executor(None, _send_email, subject, body)
        finally:
            email_queue.task_done()


@app.on_event("startup")
async def _startup() -> None:
    """
    Запускаем фонового воркера при старте приложения.
    """

    asyncio.create_task(_email_worker())


class Payload(BaseModel):
    """
    Универсальная схема: принимает произвольный словарь данных формы.
    Пример:
    {
        "source": "roofing-quiz",
        "phone": "+7 ...",
        "answers": {...}
    }
    """

    data: Dict[str, Any]


def _send_email(subject: str, body: str) -> None:
    """
    Отправка письма через SMTP.

    Перед запуском бекенда необходимо задать переменные окружения:
    - SMTP_HOST
    - SMTP_PORT
    - SMTP_USER
    - SMTP_PASSWORD
    - SMTP_TO (куда отправлять заявки)
    """

    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    to_email = os.getenv("SMTP_TO")

    if not all([host, user, password, to_email]):
        raise RuntimeError("Не настроены SMTP-переменные окружения для отправки почты")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email
    msg.set_content(body)

    # implicit SSL
    with smtplib.SMTP_SSL(host, port, timeout=20) as server:
        server.set_debuglevel(1)
        server.login(user, password)
        server.send_message(msg)


@app.post("/api/send-form")
async def send_form(payload: Payload) -> Dict[str, str]:
    """
    Принимает словарь данных и отправляет письмо.

    POST /api/send-form
    {
        "data": { ... произвольные поля ... }
    }
    """

    data = payload.data

    try:
        lines = ["Новая заявка с сайта Krovstroy:", ""]

        source = str(data.get("source", "")).strip().lower()

        if source == "roofing-quiz":
            lines.append("Тип заявки: Викторина по кровельным работам")
            field_map = {
                "workType": "Вид работ",
                "roofArea": "Площадь кровли",
                "location": "Расположение объекта",
                "startTime": "Когда начать работы",
                "gift": "Выбранный подарок",
                "phone": "Телефон клиента",
            }

            for key, label in field_map.items():
                value = data.get(key)
                if value:
                    lines.append(f"{label}: {value}")

        elif source == "terrace-quiz":
            lines.append("Тип заявки: Викторина по террасам и пристройкам")
            field_map = {
                "terraceWorkType": "Вид работ",
                "terraceArea": "Площадь пристройки",
                "terraceLocation": "Расположение объекта",
                "terraceStartTime": "Когда начать работы",
                "terraceGift": "Выбранный подарок",
                "phone": "Телефон клиента",
            }

            for key, label in field_map.items():
                value = data.get(key)
                if value:
                    lines.append(f"{label}: {value}")

        elif source == "callback-modal":
            lines.append("Тип заявки: Заказать звонок (модальное окно)")
            name = data.get("name")
            phone = data.get("phone")
            context = data.get("context")

            if name:
                lines.append(f"Имя: {name}")
            if phone:
                lines.append(f"Телефон: {phone}")
            if context:
                lines.append(f"Контекст: {context}")

        elif source == "cta-phone":
            lines.append("Тип заявки: Телефон из блока бесплатной консультации")
            phone = data.get("phone")
            if phone:
                lines.append(f"Телефон: {phone}")

        else:
            # Универсальный вариант для любых других форм
            for key, value in data.items():
                lines.append(f"{key}: {value}")

        body = "\n".join(lines)

        # Кладём письмо в очередь, отправка будет выполнена фоновым воркером
        await email_queue.put({"subject": "Заявка с сайта Krovstroy", "body": body})
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Не удалось поставить письмо в очередь: {exc}") from exc

    # Отвечаем сразу, не дожидаясь реальной отправки
    return {"status": "ok", "queued": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))

