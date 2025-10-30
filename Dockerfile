# Utilise une image légère officielle Python
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8050

CMD ["python", "app.py"]
