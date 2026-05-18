SHELL := /bin/bash
.DEFAULT_GOAL := help

PORT ?= 5002
FRONTEND_PORT ?= 5173
FRONTEND_DIR := frontend
BACKEND_DIR := backend
API_HEALTH_URL := http://localhost:$(PORT)/api/health

.PHONY: help env setup install install-frontend install-backend doctor \
	frontend run-frontend backend run-backend dev both run-both preview \
	build build-frontend test-backend package-backend check health stop-backend \
	clean clean-build clean-deps clean-all clear push-ready status

help:
	@echo "Home Tutor System Makefile"
	@echo ""
	@echo "Setup"
	@echo "  make env             Create .env files from .env.example when missing"
	@echo "  make setup           Create env files and install project dependencies"
	@echo "  make install         Install frontend packages and resolve backend dependencies"
	@echo "  make doctor          Show local tool versions"
	@echo ""
	@echo "Run"
	@echo "  make frontend        Run React/Vite frontend on port $(FRONTEND_PORT)"
	@echo "  make backend         Run Spring Boot backend on port $(PORT)"
	@echo "  make dev             Run frontend and backend together"
	@echo "  make both            Alias for make dev"
	@echo "  make preview         Preview the built frontend"
	@echo ""
	@echo "Verify"
	@echo "  make build           Build frontend and run backend tests"
	@echo "  make check           Alias for make build"
	@echo "  make health          Check backend health endpoint"
	@echo ""
	@echo "Clean"
	@echo "  make clean           Remove build output and OS junk files"
	@echo "  make clean-deps      Remove installed frontend dependencies"
	@echo "  make clean-all       Remove build output and frontend dependencies"
	@echo "  make clear           Alias for make clean-all"
	@echo "  make push-ready      Verify, clean generated files, and show git status"
	@echo ""
	@echo "Utilities"
	@echo "  make stop-backend    Stop the process listening on backend port $(PORT)"
	@echo "  make status          Show git status when this folder is a git repo"
	@echo ""
	@echo "Examples"
	@echo "  make dev"
	@echo "  make backend PORT=5003"
	@echo "  make frontend FRONTEND_PORT=5174"

env:
	@if [ ! -f "$(BACKEND_DIR)/.env" ]; then \
		cp "$(BACKEND_DIR)/.env.example" "$(BACKEND_DIR)/.env"; \
		echo "Created $(BACKEND_DIR)/.env from $(BACKEND_DIR)/.env.example"; \
	else \
		echo "$(BACKEND_DIR)/.env already exists"; \
	fi
	@if [ ! -f "$(FRONTEND_DIR)/.env" ]; then \
		cp "$(FRONTEND_DIR)/.env.example" "$(FRONTEND_DIR)/.env"; \
		echo "Created $(FRONTEND_DIR)/.env from $(FRONTEND_DIR)/.env.example"; \
	else \
		echo "$(FRONTEND_DIR)/.env already exists"; \
	fi

setup: env install

install: install-frontend install-backend

install-frontend:
	npm --prefix $(FRONTEND_DIR) install

install-backend:
	mvn -f $(BACKEND_DIR)/pom.xml -DskipTests dependency:go-offline

doctor:
	@echo "Node:  $$(node --version 2>/dev/null || echo 'not found')"
	@echo "npm:   $$(npm --version 2>/dev/null || echo 'not found')"
	@echo "Java:  $$(java -version 2>&1 | head -n 1 || echo 'not found')"
	@echo "Maven: $$(mvn --version 2>/dev/null | head -n 1 || echo 'not found')"

frontend:
	npm --prefix $(FRONTEND_DIR) run dev -- --port $(FRONTEND_PORT)

run-frontend: frontend

backend:
	PORT=$(PORT) mvn -f $(BACKEND_DIR)/pom.xml spring-boot:run

run-backend: backend

dev:
	@echo "Starting backend on http://localhost:$(PORT) and frontend on http://localhost:$(FRONTEND_PORT)"
	@$(MAKE) --no-print-directory backend PORT=$(PORT) & backend_pid=$$!; \
	$(MAKE) --no-print-directory frontend FRONTEND_PORT=$(FRONTEND_PORT) & frontend_pid=$$!; \
	trap 'kill $$backend_pid $$frontend_pid 2>/dev/null' INT TERM EXIT; \
	wait $$backend_pid $$frontend_pid

both: dev

run-both: dev

preview:
	npm --prefix $(FRONTEND_DIR) run preview -- --port $(FRONTEND_PORT)

build: build-frontend test-backend

check: build

build-frontend:
	npm --prefix $(FRONTEND_DIR) run build

test-backend:
	mvn -f $(BACKEND_DIR)/pom.xml test

package-backend:
	mvn -f $(BACKEND_DIR)/pom.xml clean package

health:
	@curl -fsS "$(API_HEALTH_URL)" && echo ""

stop-backend:
	@pids=$$(lsof -ti tcp:$(PORT)); \
	if [ -n "$$pids" ]; then \
		echo "Stopping backend process(es) on port $(PORT): $$pids"; \
		kill $$pids; \
	else \
		echo "No process is listening on port $(PORT)."; \
	fi

clean: clean-build

clean-build:
	rm -rf $(FRONTEND_DIR)/dist $(BACKEND_DIR)/target
	find . -name ".DS_Store" -type f -delete

clean-deps:
	rm -rf $(FRONTEND_DIR)/node_modules

clean-all: clean-build clean-deps

clear: clean-all

push-ready: build clean-all
	@echo "Push-ready cleanup complete."
	@echo "Kept local .env files on disk; .gitignore prevents them from being committed."
	@$(MAKE) --no-print-directory status

status:
	@if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then \
		git status --short; \
	else \
		echo "Not a git repository yet."; \
	fi
