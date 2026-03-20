# Task 5 Demo Script (Daily Stand Up)

## 1) Show repository changes

- Open backend queue files:
  - `backend/src/queues/todo.queue.ts`
  - `backend/src/workers/todo.worker.ts`
- Open Todo controller hook:
  - `backend/src/controllers/todo.controllers.ts`
- Open Docker setup:
  - `docker-compose.yml`

## 2) Start services

```bash
docker-compose up --build
```

## 3) Show worker running in real time

- In Docker logs, show `todo-worker` output.
- Mention queue name: `taskQueue`.

## 4) Successful job demo

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo success","description":"Background processing"}'
```

Expected:
- API immediately returns `201` with todo data.
- Worker logs `Processing job ...` then `Fake email sent ...` and `completed`.

## 5) Failed job + retry demo

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[fail] Demo retry","description":"Should retry 3 times"}'
```

Expected:
- API still returns immediately.
- Worker logs failed attempts and retries.
- Final state shows failed after max attempts.

## 6) Delayed job demo

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"[delay] Demo delayed job","description":"Delayed by TODO_JOB_DELAY_MS"}'
```

Expected:
- API returns immediately.
- Worker processes job after delay window.

## 7) Optional dashboard demo

- Open: `http://localhost:5000/admin/queues`
- Show completed and failed jobs in Bull Board.

## 8) Wrap-up points

- Queue work is asynchronous and decoupled from API response.
- Retries and delay are configured in BullMQ.
- Redis is used as the broker and job state store.
