args=$(filter-out $@,$(MAKECMDGOALS))
PROJECT=thchemical

all help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

dev: ## start server
	cd ./services/shared && npm run build
	docker compose -f docker-compose.yaml -f docker-compose.local.yaml -p $(PROJECT) up -d

down: ## stop server
	docker compose -f docker-compose.yaml -f docker-compose.local.yaml -p $(PROJECT) down

package: ## init migrate and database
	@bash ./scripts/package.sh

migrate: ## migration
	@bash ./scripts/migrate.sh

metadata: ## metadata
	@bash ./scripts/metadata.sh

migrate-rollback: ## migration rollback
	@bash ./scripts/migrate-rollback.sh

seeds: ## seeds
	@bash ./scripts/seed.sh

console: ## hasura console
	cd ./services/data && hasura console

%:
	@echo "Done"
