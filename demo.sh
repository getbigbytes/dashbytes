#!/bin/bash
set -e

docker compose -p bigbytes-app -f docker/docker-compose.dev.yml --env-file .env.development.local up --detach --remove-orphans

docker exec -it bigbytes-app-bigbytes-dev-1 bash -c "export PUPPETEER_SKIP_DOWNLOAD=true;./scripts/build.sh;./scripts/seed-jaffle.sh;./scripts/migrate.sh;./scripts/seed-bigbytes.sh;yarn build;yarn dev"

# Username: demo@digi-trans.org
# Password: demo_password!
