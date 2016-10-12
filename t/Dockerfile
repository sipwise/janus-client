# DOCKER_NAME=janus-client-jessie
FROM docker.mgm.sipwise.com/sipwise-jessie:latest

# Important! Update this no-op ENV variable when this Dockerfile
# is updated with the current date. It will force refresh of all
# of the base images and things like `apt-get update` won't be using
# old cached versions when the Dockerfile is built.
ENV REFRESHED_AT 2016-10-14

# TODO - the release-trunk-jessie is too dynamic yet, though required build deps
RUN echo "deb https://deb.sipwise.com/autobuild/ release-trunk-jessie main" >>/etc/apt/sources.list

RUN apt-get update
RUN apt-get install --assume-yes \
        curl \
        nodejs \
        nodejs-legacy \
        npm

RUN echo "cd /code && ./t/testrunner" >/root/.bash_history

WORKDIR /code

################################################################################
# Instructions for usage
# ----------------------
# When you want to build the base image from scratch (jump to the next section if you don't want to build yourself!):
# % docker build --tag="janus-client-jessie" .
# % docker run --rm -i -t -v $(pwd)/..:/code:ro janus-client-jessie:latest bash
#
# Use the existing docker image:
# % docker pull docker.mgm.sipwise.com/janus-client-jessie
# % docker run --rm -i -t -v $(pwd)/..:/code:ro docker.mgm.sipwise.com/janus-client-jessie:latest bash
#
# Inside docker:
#   cd /code && ./t/testrunner
################################################################################
