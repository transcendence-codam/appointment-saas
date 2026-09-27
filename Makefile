DOCKER_COMPOSE_FILE = srcs/docker-compose.yml
COMPOSE = docker compose -f $(DOCKER_COMPOSE_FILE)

all: build up

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

start:
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

clean:
	$(COMPOSE) down -v

fclean:
	$(COMPOSE) down -v --rmi all

rebuild: down build up

re: fclean all

.PHONY: all build up down start stop clean fclean rebuild re