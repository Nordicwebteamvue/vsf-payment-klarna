phony:
	echo "https://github.com/kodbruket/vsf-payment-klarna"

submodules:
	git submodule update --init

prebundle: submodules
	mkdir -p .docker/vue-storefront/var
	mkdir -p .docker/vue-storefront/dist
	cd .docker/bundle && yarn

bundle: prebundle
	node .docker/bundle/index.js
	# ex +g/mage2vuestorefront/d -cwq ./.output/vue-storefront-api/package.json

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

fs:
  echo -e "travis_fold:start:$1\033[33;1m$2\033[0m"

fe:
  echo -e "\ntravis_fold:end:$1\r"
