FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MODEL_DIR=/models
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app && mkdir -p /models && chown -R app:app /models /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY entrypoint.py ./entrypoint.py
EXPOSE 8000
CMD ["python", "entrypoint.py"]
