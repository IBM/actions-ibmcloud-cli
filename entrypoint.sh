#!/bin/sh -l

#curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
curl -sL https://ibm.biz/idt-installer | bash
ibmcloud --version
ibmcloud config --check-version=false
ibmcloud login --apikey "$1" -r "$2" -g default
ibmcloud cr region-set "$2"
ibmcloud cr login
