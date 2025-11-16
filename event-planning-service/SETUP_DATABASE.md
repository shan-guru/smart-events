# Database Setup Instructions

## Create the Database

The backend requires a PostgreSQL database named `event_planning_db`. 

### Option 1: Using psql (if available in PATH)

```bash
psql -U postgres -h localhost -c "CREATE DATABASE event_planning_db;"
```

### Option 2: Using psql with full path (macOS)

If PostgreSQL is installed via Homebrew:
```bash
/usr/local/bin/psql -U postgres -h localhost -c "CREATE DATABASE event_planning_db;"
```

Or if installed via Postgres.app:
```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -U postgres -h localhost -c "CREATE DATABASE event_planning_db;"
```

### Option 3: Using pgAdmin or another GUI tool

1. Open pgAdmin (or your preferred PostgreSQL GUI)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `event_planning_db`
5. Click "Save"

### Option 4: Using Docker (if PostgreSQL is in Docker)

```bash
docker exec -it <postgres-container-name> psql -U postgres -c "CREATE DATABASE event_planning_db;"
```

## Verify Database Creation

```bash
psql -U postgres -h localhost -l | grep event_planning_db
```

## Database Configuration

The application expects:
- **Database name**: `event_planning_db`
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres` (default, can be changed via `DB_USERNAME` env var)
- **Password**: `postgres` (default, can be changed via `DB_PASSWORD` env var)

You can override these in `application.yml` or via environment variables:
- `DB_USERNAME`
- `DB_PASSWORD`

## After Database Creation

Once the database is created, the backend will automatically:
1. Run Flyway migrations to create the `members` table
2. Set up all required indexes and constraints

No manual schema creation is needed - Flyway handles everything!

