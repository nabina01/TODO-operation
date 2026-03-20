# Slide 1 - Title

## SWE Intern Task 5
Message Queues with BullMQ

- Name: <Your Name>
- Project: Todo API (Node.js + Express + MySQL)
- Date: March 2026

---

# Slide 2 - What Is a Message Queue?

- A message queue is a communication channel between producers and consumers.
- Producers push tasks (messages/jobs) into a queue.
- Consumers (workers) process tasks independently.
- Queue decouples request handling from heavy/slow work.

Key benefit:
- Better scalability and resilience in backend systems.

---

# Slide 3 - Asynchronous Processing

- Asynchronous processing means work happens outside the request-response cycle.
- API can return quickly while background tasks continue.
- Useful for non-blocking operations:
  - Email notifications
  - Report generation
  - Data transformation

Synchronous vs asynchronous:
- Synchronous: user waits for full operation.
- Asynchronous: user gets immediate response, work finishes later.

---

# Slide 4 - BullMQ + Redis

## What is BullMQ?

- BullMQ is a Node.js library for robust job queues.
- Built on Redis for fast, persistent queue operations.

## Why Redis is required

- BullMQ stores queue state, job data, retries, delays, and locks in Redis.
- Redis supports atomic operations and high throughput.

How it works:
- App adds jobs -> Redis stores jobs -> Worker pulls and processes -> status updated.

---

# Slide 5 - BullMQ Building Blocks

- Job: a unit of work (example: "todo-created notification").
- Queue: named pipeline storing jobs (example: `taskQueue`).
- Worker: process that consumes jobs from queue.
- Queue events: listeners for completed/failed status.

Advanced controls:
- Retries: retry on failure (e.g., 3 attempts)
- Delay: schedule job for later execution
- Concurrency: process multiple jobs in parallel

---

# Slide 6 - Problems Message Queues Solve

- Slow APIs due to heavy processing in request thread
- Timeout risks from external services
- Traffic spikes causing unstable response times
- Need for retry when temporary failures happen

Advantages:
- Improved user experience (fast responses)
- Better fault tolerance
- Easier horizontal scaling (multiple workers)

Challenges:
- More moving parts (Redis + worker management)
- Monitoring/observability needs
- Idempotency and duplicate processing concerns

---

# Slide 7 - Real-World Use Cases + Alternatives

Common use cases:
- Email/SMS notifications
- Image/video processing
- Payment/webhook processing
- Analytics/log pipelines
- Scheduled jobs and reminders

Alternatives to BullMQ:
- RabbitMQ
- Apache Kafka
- Amazon SQS
- Bee-Queue / Agenda / Celery (ecosystem-dependent)

---

# Slide 8 - Practical Implementation in Todo API

Implemented:
- Installed `bullmq`, `ioredis`
- Added Redis service (Docker)
- Created queue: `taskQueue`
- Added job enqueue when new Todo is created
- Added worker for background processing
- Added retry policy: 3 attempts
- Added delayed job behavior
- Added completed/failed logs
- API responds immediately (non-blocking enqueue)

---

# Slide 9 - Demo Walkthrough

1. Start services (`docker-compose up --build`)
2. Open API and worker logs
3. Create Todo: successful job
4. Create Todo with `[fail]` in title -> retry + fail logs
5. Create Todo with `[delay]` in title -> delayed execution
6. (Optional) open Bull Board dashboard at `/admin/queues`

Expected outcome:
- Real-time proof of asynchronous processing and retries.

---

# Slide 10 - Summary

- Message queues improve scalability, responsiveness, and reliability.
- BullMQ + Redis provides a practical queue solution in Node.js.
- In this project, background job handling is fully integrated with Todo creation.
- Retries, delays, and worker concurrency are configured for production-style behavior.

Thank you.
Q&A
