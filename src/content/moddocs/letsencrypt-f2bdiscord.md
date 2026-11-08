---
branch: "letsencrypt-f2bdiscord"
---
## Configuration

### Enable

### Mod configuration

**Environment variables used by this mod:**

[Discord webhook](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks), it just need the last parts. `-e DISC_HOOK=40832456738934/7DcEpWr5V24OIEIELjg-KkHky86SrOgTqA`
[Your discord ID](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-). `-e DISC_ME=120970603556503552`
[Map API Key](https://developer.mapquest.com/), get a key from mapquest. `-e DISC_API=YourKey`

#### Jail configuration example

```ini
[bitwarden]

filter  = bitwarden
enabled = true
logpath = /fail2ban/bw/bitwarden.log
action  = discordEmbed[bantime=24]
          iptables-allports[name=Bitwarden]

```

Action arguments:

`bantime`(hour) is optional, but defaults to 24 when not set. Just reflects in the message, does not change the ban time

## Example

![Example picture](https://raw.githubusercontent.com/linuxserver-playground/docker-mods/letsencrypt-f2bdiscord/.assets/Example.png)
