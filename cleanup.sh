#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Full Cleanup${NC}"
echo ""

# Stop all notification containers
echo -e "${BLUE}Stopping services...${NC}"
docker compose down --remove-orphans -v 2>/dev/null || true

# Force remove any stuck containers
echo -e "${BLUE}Removing containers...${NC}"
STUCK=$(docker ps -a -q -f name=notification- 2>/dev/null)
if [ ! -z "$STUCK" ]; then
    docker rm -f $STUCK 2>/dev/null || true
fi

# Remove volumes
echo -e "${BLUE}Removing volumes...${NC}"
docker volume rm notification_mysql_data notification_redis_data 2>/dev/null || true

# Remove images
echo -e "${BLUE}Removing images...${NC}"
docker rmi notification-api notification-admin-ui 2>/dev/null || true

# Remove network
echo -e "${BLUE}Removing network...${NC}"
docker network rm notification-network 2>/dev/null || true

# System cleanup
echo -e "${BLUE}System cleanup...${NC}"
docker system prune -f

# Wait for ports to be released
echo -e "${BLUE}Waiting for ports to release...${NC}"
sleep 3

# Verify ports are free
PORTS=(3000 5173 3306 6379)
STILL_USED=()

for PORT in "${PORTS[@]}"; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        STILL_USED+=($PORT)
    fi
done

if [ ${#STILL_USED[@]} -gt 0 ]; then
    echo -e "${RED}⚠️  Ports still in use: ${STILL_USED[*]}${NC}"
    echo -e "${BLUE}Run: sudo lsof -i :<port> to find processes${NC}"
else
    echo -e "${GREEN}✅ All ports freed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
