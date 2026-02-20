# Quick Scripts Reference

Simple scripts to manage the Notification Service.

## 🚀 First Time Setup

```bash
./setup.sh
```

This will:
- Create environment files
- Clean up old containers
- Build and start all services
- Run migrations and seed data
- Install dependencies

## 📝 Daily Usage

### Start Services
```bash
./start.sh
```

### Stop Services
```bash
./stop.sh
```

### View Logs
```bash
docker compose logs -f
```

### View Specific Service Logs
```bash
docker compose logs -f api
docker compose logs -f admin-ui
```

## 🧹 Cleanup

### Full Cleanup (removes all data)
```bash
./cleanup.sh
```

This removes:
- All containers
- All volumes (database data will be lost)
- All images
- Build cache

## 🔧 Manual Commands

### Rebuild Specific Service
```bash
docker compose up -d --build api
```

### Restart Service
```bash
docker compose restart api
```

### Access Container Shell
```bash
docker compose exec api sh
docker compose exec admin-ui sh
```

### Run Migrations
```bash
docker compose exec api npm run migration:run
```

### Seed Database
```bash
docker compose exec api npm run seed
```

## 📍 Service URLs

- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs
- **Admin UI**: http://localhost:5173
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## 🔐 Default Credentials

- **Email**: admin@notification.local
- **Password**: Admin@123

## ⚠️ Troubleshooting

### Permission Denied Errors
Run cleanup and try again:
```bash
./cleanup.sh
./setup.sh
```

### Port Already in Use
Check what's using the port:
```bash
sudo lsof -i :3000
sudo lsof -i :5173
```

### Container Won't Stop
Force remove:
```bash
docker rm -f notification-api
docker rm -f notification-admin-ui
docker rm -f notification-mysql
docker rm -f notification-redis
```

### Fresh Start
```bash
./cleanup.sh
./setup.sh
```
