FROM python:3.8-slim

WORKDIR /app

COPY . /app

RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

# 暴露应用程序的端口
EXPOSE 4396

# 运行应用程序
CMD ["python", "app.py"]