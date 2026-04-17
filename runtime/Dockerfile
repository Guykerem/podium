FROM python:3.12-slim

WORKDIR /app

COPY runtime/requirements.txt runtime/requirements.txt
RUN pip install --no-cache-dir -r runtime/requirements.txt

COPY . .

ENTRYPOINT ["python", "runtime/engine.py"]
