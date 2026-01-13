#!/bin/bash

echo "🚀 Setting up Notification Service..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking environment files...${NC}"

# Copy environment file if it doesn't exist
if [ ! -f .env.development ]; then
    echo -e "${BLUE}Creating .env.development from .env.example...${NC}"
    cp .env.example .env.development
fi

echo -e "${GREEN}✅ Environment files ready${NC}"

echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d

echo -e "${BLUE}⏳ Waiting for MySQL to be ready...${NC}"
sleep 15

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
docker-compose exec api npm install

echo -e "${BLUE}🗄️  Running database migrations...${NC}"
docker-compose exec api npm run migration:run

echo -e "${BLUE}🌱 Seeding database...${NC}"
docker-compose exec api npm run seed

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
docker-compose exec admin-ui npm install

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${GREEN}🎉 Notification Service is ready!${NC}"
echo ""
echo "📍 Access the services at:"
echo -e "   ${BLUE}API:${NC}          http://localhost:3000"
echo -e "   ${BLUE}Swagger Docs:${NC} http://localhost:3000/docs"
echo -e "   ${BLUE}Admin UI:${NC}     http://localhost:5173"
echo -e "   ${BLUE}MySQL:${NC}        localhost:3306"
echo ""
echo "🔐 Default admin credentials:"
echo -e "   ${BLUE}Email:${NC}    admin@notification.local"
echo -e "   ${BLUE}Password:${NC} Admin@123"
echo ""
echo "📚 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
