#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Notification Service Setup"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not installed${NC}"
    exit 1
fi

# Check for port conflicts
check_ports() {
    PORTS=(3000 5173 3306 6379)
    CONFLICTS=()
    
    for PORT in "${PORTS[@]}"; do
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            CONFLICTS+=($PORT)
        fi
    done
    
    if [ ${#CONFLICTS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Ports in use: ${CONFLICTS[*]}${NC}"
        echo -e "${BLUE}Attempting to free ports...${NC}"
        return 1
    fi
    return 0
}

# Create .env.development if missing
if [ ! -f .env.development ]; then
    echo -e "${BLUE}Creating .env.development...${NC}"
    cp .env.example .env.development
fi

# Clean up function
cleanup() {
    echo -e "${BLUE}Cleaning up containers...${NC}"
    docker compose down --remove-orphans -v 2>/dev/null || true
    
    # Kill any stuck containers
    STUCK=$(docker ps -a -q -f name=notification- 2>/dev/null)
    if [ ! -z "$STUCK" ]; then
        echo -e "${BLUE}Removing stuck containers...${NC}"
        docker rm -f $STUCK 2>/dev/null || true
    fi
    
    # Wait for ports to be released
    sleep 2
}

# Ask to clean volumes
echo -e "${BLUE}Clean previous data?${NC} (y/N)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cleanup
    echo -e "${BLUE}Removing volumes...${NC}"
    docker volume rm notification_mysql_data notification_redis_data 2>/dev/null || true
    docker system prune -f
else
    cleanup
fi

# Check and retry if ports are in use
if ! check_ports; then
    echo -e "${BLUE}Running additional cleanup...${NC}"
    cleanup
    sleep 3
    
    if ! check_ports; then
        echo -e "${RED}Error: Ports still in use. Please run: ./cleanup.sh${NC}"
        exit 1
    fi
fi

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker compose up -d --build --remove-orphans

# Wait for MySQL
echo -e "${BLUE}Waiting for database...${NC}"
until docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot_password &> /dev/null; do
    sleep 2
done

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
docker compose exec -T api npm install
docker compose exec -T api npm run migration:run
docker compose exec -T api npm run seed

# Setup frontend
echo -e "${BLUE}Setting up frontend...${NC}"
docker compose exec -T admin-ui npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📍 Services:"
echo "   API:     http://localhost:3000"
echo "   Docs:    http://localhost:3000/docs"
echo "   UI:      http://localhost:5173"
echo ""
echo "🔐 Login:"
echo "   Email:    admin@notification.local"
echo "   Password: Admin@123"
echo ""
echo "📝 Commands:"
echo "   Logs:  docker compose logs -f"
echo "   Stop:  docker compose down"
