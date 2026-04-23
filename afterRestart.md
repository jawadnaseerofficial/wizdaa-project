# After Restart Instructions

## What to do after restarting your system

1. Start Docker Desktop
   - Open Docker Desktop from Start menu.
   - Wait until Docker status is "Running" and the whale icon is stable.

2. Open PowerShell in the project folder:
   ```powershell
   cd 'C:\Users\Administrator\Downloads\Project Wizdaa\time-off-microservice'
   ```

3. Start the PostgreSQL container:
   ```powershell
   docker compose up -d postgres
   ```

4. Verify Docker container is running:
   ```powershell
   docker compose ps
   ```

5. Run Prisma migrations to create database schema:
   ```powershell
   npm run prisma:migrate
   ```

6. (Optional) Seed the database with sample data:
   ```powershell
   npm run db:seed
   ```

7. Start the app in development mode:
   ```powershell
   npm run dev
   ```

8. Test the health endpoint:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:3000/api/v1/health -Method GET -UseBasicParsing
   ```

## Notes
- If Docker still requires a restart, complete the restart first and then continue.
- If the database fails to connect after restart, make sure the container is healthy and listening on port `5432`.
- If you want, I can help you run these commands once your system is back up.