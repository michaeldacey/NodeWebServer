FROM ubuntu
MAINTAINER mike <michael.dacey@uwtsd.ac.uk>

# Use default values when OS boots up for the first time
# so we do not have to manually provide them
ENV DEBIAN_FRONTEND    noninteractive

# Do update first to allow software-properties-common to being
# installed 
RUN apt-get update

# Install some missing components we need
RUN apt-get install -y software-properties-common && \
apt-get install -y --no-install-recommends apt-utils

# Some tools we will need
RUN apt-get install -y curl \
wget \
git-core \
vim

# Install telnet and SSH
# https://docs.docker.com/engine/examples/running_ssh_service/
RUN apt-get install -y xinetd tcpd telnetd openssh-server
RUN mkdir /var/run/sshd
RUN echo 'root:password' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd
ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22

# Get node.js repository details
# and install node.js and npm
#wget -qO https://deb.nodesource.com/setup_13.x && \
RUN curl -sL https://deb.nodesource.com/setup_13.x && \
apt-get install -y nodejs npm && \
npm install -g npx

# Add environment variable that is availabe when the
# webserver is running that defines the IP address. 
# When running in Docker use 0.0.0.0 instead of "localhost".
# Environment variables defined in an ENV section of this file
# only appear to be available during the image build.
RUN echo "export SERVER_IP_ADDRESS='0.0.0.0'" >> /etc/profile

# Expose our webservers port number
EXPOSE 1339

# Always clean up at the end to minimise the image size
RUN apt-get clean

# Execute the application
#CMD /lib/systemd/systemd
#CMD systemctl start xinetd
#CMD /usr/sbin/xinetd
#ENTRYPOINT ["/etc/init.d/ssh", "start"]
CMD ["/usr/sbin/sshd", "-D"]

#To run multiple commands e.g. ssh and bash
#CMD /bin/bash -c "/etc/init.d/ssh start; /bin/bash"
#CMD /bin/bash -c "/usr/sbin/sshd -D; /bin/bash"
