#!/bin/bash
set -e

docker compose -p clairdash-app -f docker/docker-compose.dev.yml --env-file .env.development.local up --detach --remove-orphans

docker exec -it clairdash-app-clairdash-dev-1 bash -c "export PUPPETEER_SKIP_DOWNLOAD=true;./scripts/build.sh;./scripts/seed-jaffle.sh;./scripts/migrate.sh;./scripts/seed-clairdash.sh;yarn build;yarn dev"

# Username: demo@digi-trans.org
# Password: demo_password!
