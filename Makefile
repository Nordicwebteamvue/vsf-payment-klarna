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

ci-import:
	cd .output/vue-storefront-api && yarn
	cd .output/vue-storefront-api && yarn mage2vs import
	cd .output/vue-storefront-api && yarn restore
	cd .output/vue-storefront-api && yarn migrate

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
