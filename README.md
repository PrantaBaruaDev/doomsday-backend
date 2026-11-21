# Doomsday Ready — Backend

A backend API for MCU fans to plan their rewatch order and book opening-night watch parties.

## Tech Stack
- **Runtime**: Node.js (or Bun)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 8 (RC)
- **Validation**: Zod

## How to Run

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/DB?sslmode=require"
   PORT=4000
   ```

3. **Generate Prisma Contract & Run Migrations**:
   ```bash
   bunx prisma contract emit
   bunx prisma migration plan --name init
   bunx prisma db migrate
   ```

4. **Seed the database**:
   ```bash
   bun seed
   ```

5. **Start the server**:
   ```bash
   bun dev
   ```

## Data Model Diagram

```mermaid
erDiagram
    Movie {
        string id PK
        string title UK
        int releaseYear
        int runtimeMinutes
        boolean watched
    }
    MoviePrerequisite {
        string movieId FK
        string prerequisiteId FK
    }
    Cinema {
        string id PK
        string name UK
        int_array bundleSizes
    }

    Movie ||--o{ MoviePrerequisite : "has prerequisites"
    Movie ||--o{ MoviePrerequisite : "is prerequisite for"
```

## Features & Algorithms

### 1. Rewatch Order (Feature 1)
- **Cycle Detection**: Implemented using **Depth-First Search (DFS)**. Before saving a new prerequisite, we trace edges upward to ensure we never loop back to the target movie. Returns `409 CIRCULAR_DEPENDENCY` if a cycle is found.
- **Topological Sort**: Implemented using **Kahn's Algorithm** to return the movies in a valid order where every movie comes after its prerequisites. Ties are broken deterministically by release year.

### 2. Booking Quote (Feature 2)
- **Coin-Change DP**: Implemented using **Dynamic Programming (Unbounded Knapsack)**. We minimize the number of bundles to reach exactly the `groupSize`. If no exact combination exists, returns `possible: false`.

## Design Patterns Used
- **Repository Pattern**: `PostgresMovieRepository`, `PostgresCinemaRepository` abstract database access.
- **Factory Pattern**: `ErrorFactory` standardizes API errors.
- **Singleton Pattern**: `db` client and `Config` are single instances.
- **Strategy Pattern**: `CycleDetectionStrategy` (DFS) and `BookingStrategy` (DP) allow swapping algorithms.
- **Observer Pattern**: `EventBus` handles domain events (e.g., `movie.watched`).
- **Builder Pattern**: Request/Response validation.
- **Adapter Pattern**: Prisma 8's contract.json acts as the adapter to PostgreSQL.
- **Decorator Pattern**: `wrap` middleware decorates controllers for error handling.
- **CQRS**: Separated `commands` (writes) from `queries` (reads) in the movie module.
- **Circuit Breaker**: `dbHealthBreaker` wraps DB health checks to prevent cascading failures.

## AI Usage Disclosure
AI tools were used to assist with:
1. Scaffolding the initial Express and TypeScript configuration.
2. Drafting the Mermaid diagram and boilerplate boilerplate.

**The core logic (DFS Cycle Detection, Kahn's Topological Sort, and Coin-Change DP) was written by hand** without external algorithms libraries, per the assessment rules. All AI-generated code was reviewed and tested.

---

### 3. Quick Postman Test Flow

To prove the algorithm works, you can test these endpoints in Postman:

**Test 1: Rewatch Order**
`GET http://localhost:5000/api/movies/:id/rewatch-order`
*(Replace `:id` with the ID of Avengers: Doomsday)*
**Expected**: 7 movies, ordered correctly, `totalCount: 7`.

**Test 2: Cycle Detection**
`PATCH http://localhost:5000/api/movies/:id_of_iron_man`
Body:
```json
{
  "prerequisiteIds": ["ID_OF_ENDGAME"]
}
```
**Expected**: `409 CIRCULAR_DEPENDENCY`.

**Test 3: Booking**
`GET http://localhost:5000/api/cinemas/:id_of_cinema/booking?groupSize=11`
*(Use the cinema with sizes `[2, 5]`)*
**Expected**:
```json
{
  "possible": true,
  "totalBundles": 4,
  "bundles": [
    { "size": 5, "count": 1 },
    { "size": 2, "count": 3 }
  ]
}
```

---
