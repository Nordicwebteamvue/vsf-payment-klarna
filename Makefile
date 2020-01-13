.PHONY: list
list:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'

submodules:
	git submodule update --init

prebundle: submodules
	mkdir -p .docker/vue-storefront/var
	mkdir -p .docker/vue-storefront/dist
	cd .docker/bundle && yarn
	rm -rf .output

bundle: prebundle
	node .docker/bundle/index.js

bundle-to-localhost:
	sed -i.bak 's/api:8080/localhost:8080/g' .output/vue-storefront/config/local.json

import:
	docker-compose exec api yarn mage2vs import
	docker-compose exec api yarn restore
	docker-compose exec api yarn migrate

build-ui:
	cd .output/vue-storefront && yarn && yarn build

build-api:
	cd .output/vue-storefront-api && yarn && yarn build

start-ui:
	cd .output/vue-storefront && yarn && yarn start

start-api:
	cd .output/vue-storefront-api && yarn && yarn start

ci:
	yarn cypress:ci

full-ci:
	docker-compose up -d elasticsearch redis
	make bundle bundle-to-localhost build-api build-ui
	make start-api es-restore start-ui
	make ci

es-backup:
	yarn elasticdump \
		--all=true \
		--input=http://localhost:9200/vue_storefront_catalog \
		--output=.docker/api/catalog.json 

es-restore:
	yarn elasticdump \
		--bulk=true \
		--input=.docker/api/catalog.json \
		--output=http://localhost:9200/vue_storefront_catalog

fold:
	travis_fold start

end:
	travis_fold end
