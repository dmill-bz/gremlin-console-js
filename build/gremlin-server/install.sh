#!/bin/bash

# Add environment java vars
export JAVA_HOME=/usr/lib/jvm/java-8-oracle
export JRE_HOME=/usr/lib/jvm/java-8-oracle

# Install gremlin-server
wget --no-check-certificate -O $HOME/apache-gremlin-server-$GREMLINSERVER_VERSION-bin.zip http://archive.apache.org/dist/tinkerpop/$GREMLINSERVER_VERSION/apache-gremlin-server-$GREMLINSERVER_VERSION-bin.zip
unzip $HOME/apache-gremlin-server-$GREMLINSERVER_VERSION-bin.zip -d $HOME/

# get gremlin-server configuration files
cp ./build/gremlin-server/gremlin-server-js.yaml $HOME/apache-gremlin-server-$GREMLINSERVER_VERSION/conf/

# get neo4j dependencies
# bin/gremlin-server.sh -i org.apache.tinkerpop neo4j-gremlin $GREMLINSERVER_VERSION-incubating

# Start gremlin-server in the background and wait for it to be available
cd $HOME/apache-gremlin-server-$GREMLINSERVER_VERSION
bin/gremlin-server.sh conf/gremlin-server-js.yaml > /dev/null 2>&1 &
cd $TRAVIS_BUILD_DIR
sleep 30
