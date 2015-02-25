all: gen test

gen:
		npm install; node ./scripts/generate-definition-files.js

test:
		npm install; node ./scripts/test-definition-files.js

publish deploy: gen test
		meteor publish
