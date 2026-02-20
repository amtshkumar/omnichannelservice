#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting notification services...${NC}"
docker compose up -d

echo -e "${GREEN}✅ Services started!${NC}"
echo ""
echo "📍 Services:"
echo "   API:  http://localhost:3000"
echo "   Docs: http://localhost:3000/docs"
echo "   UI:   http://localhost:5173"
echo ""
echo "📝 View logs: docker compose logs -f"
