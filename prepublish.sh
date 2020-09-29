set -e

rm -rf ./build ./lib ./es

yarn tsc
mv ./build/src/ ./lib

yarn tsc --module ES6
mv ./build/src/ ./es
