#!/bin/bash

if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_NODE_VERSION" == "5.9" ]; then

    # run coveralls
    php $TRAVIS_BUILD_DIR/vendor/bin/coveralls -v

    # configure git
    git config --global user.name "Travis CI"
    git config --global user.email "dylan.millikin@brightzone.fr"
    git config --global push.default simple

    #clone doc repo
    git clone -b master --depth 1 https://github.com/PommeVerte/PommeVerte.github.io.git $HOME/PommeVerte.github.io

    #generate docs
    npm run build:docs
    rsync -aP --delete $TRAVIS_BUILD_DIR/api/* $HOME/PommeVerte.github.io/gremlin-console-js/

    #update repo and push
    cd $HOME/PommeVerte.github.io
    git add .
    git commit -m "gremlin-console api update"
    git push --quiet "https://${GH_TOKEN}@${GH_REF}" > /dev/null 2>&1

fi
