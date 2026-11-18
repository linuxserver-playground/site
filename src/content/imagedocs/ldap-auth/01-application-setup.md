---
image: "ldap-auth"
section: "application-setup"
title: "Application Setup"
order: 1
---
- This container itself does not have any settings and it relies on the pertinent information passed through in http headers of incoming requests. Make sure that your webserver is set up with the right config.
- Here's a sample config: [nginx-ldap-auth.conf](https://github.com/nginxinc/nginx-ldap-auth/blob/master/nginx-ldap-auth.conf).
- Unlike the upstream project, this image encodes the cookie information with fernet, using a randomly generated key during container creation (or optionally user defined).
- Also unlike the upstream project, this image serves the login page at `/ldaplogin` (as well as `/login`) to prevent clashes with reverse proxied apps that may also use `/login` for their internal auth.
