#!/bin/sh
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin
CID=$(/opt/keycloak/bin/kcadm.sh get clients -r MotoNexus -q clientId=motoneus-mobile --fields id | grep '"id"' | cut -d '"' -f 4 | head -n 1)
echo "Client ID is: $CID"
/opt/keycloak/bin/kcadm.sh update clients/$CID -r MotoNexus -s 'webOrigins=["http://localhost:4200", "+"]'
echo "Done"
