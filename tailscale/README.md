# Tailscale Mullvad Proxies

To supply fresh proxies to the Android clients, we use a docker compose file running Tailscale containers that connect through to Mullvad.

To set up a cluster of these proxies, do the following.

1. [Create a Tailscale account.](https://tailscale.com/)
2. [Sign up for Mullvad via Tailscale.](https://tailscale.com/kb/1258/mullvad-exit-nodes/)
3. Modify your Tailscale ACL to match the policy.hujson file in this directory so that nodes can pickup access to the Mullvad exit nodes.
4. Create an API key with the following settings. (the `tag:mullvad` is very important) ![Screenshot 2024-07-21 at 4.42.37 PM.png](Screenshot%202024-07-21%20at%204.42.37%E2%80%AFPM.png)
5. Copy the `.env.example` file to `.env` and fill in `TAILSCALE_AUTH_KEY` with the API key you created.
6. `docker compose up -d`
7. Connect to the containers with the ports specified in `docker-compose.yml`.
