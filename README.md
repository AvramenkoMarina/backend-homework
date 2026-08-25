# HW-5: Docker multi-stage + Compose + Postgres

Fastify API (`GET /health`, `GET /users`) у контейнері разом із Postgres 17. Одна команда піднімає весь стек.

## Швидкий старт

```bash
docker compose up -d
```

Перевірка:

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/users
```

Зупинити (volume з даними БД зберігається):

```bash
docker compose down
```

Повністю прибрати дані Postgres:

```bash
docker compose down -v
```

## Dev (override)

`docker-compose.override.yml` підхоплюється автоматично: bind-mount `./src`, `node --watch`, порт `3000`.

Для CI без override:

```bash
docker compose -f docker-compose.yml up -d --build
```

## Розміри образів

| Образ | Як зібрано | Розмір |
| --- | --- | --- |
| `l5-docker-api:prod` | multi-stage (`Dockerfile`, `node:22-slim`, `npm ci --omit=dev`) | **372 MB** |
| `l5-docker-api:naive` | одна стадія (`Dockerfile.naive`, повний `node:22`, `npm install`, весь контекст) | **1.64 GB** |

Різниця: slim-база + multi-stage без dev-залежностей і зайвого контексту дають ~372 MB замість ~1.6 GB «в лоб».

Перевірка у себе:

```bash
docker build -t l5-docker-api:prod .
docker build -f Dockerfile.naive -t l5-docker-api:naive .
docker images 'l5-docker-api'
```

## Persistence Postgres

Іменований volume `pgdata` переживає `docker compose down` (без `-v`).

Як перевіряли:

```bash
docker compose up -d
docker compose exec postgres psql -U app -d app -c "CREATE TABLE persistence_check(id int); INSERT INTO persistence_check VALUES (1);"
docker compose down
docker compose up -d
docker compose exec postgres psql -U app -d app -c "SELECT * FROM persistence_check;"
# очікується рядок з id = 1
```

