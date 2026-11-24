---
image: "yq"
section: "usage"
title: "Usage"
order: 1
---
### Docker cli

```text
docker run --rm \
  -v "$PWD:$PWD" \
  -w="$PWD" \
  --entrypoint yq \
  linuxserver/yq \
  .foo.bar input.yml
```

You can replace the last line with any yq command and argument, which will be passed to yq inside the image.

```text
docker run --rm \
  -v "$PWD:$PWD" \
  -w="$PWD" \
  --entrypoint jq \
  linuxserver/yq \
  .foo.bar input.json
```

You can replace the last line with any jq command and argument, which will be passed to jq inside the image.

```text
docker run --rm \
  -v "$PWD:$PWD" \
  -w="$PWD" \
  --entrypoint xq \
  linuxserver/yq \
  .foo.bar input.xml
```

You can replace the last line with any xq command and argument, which will be passed to xq inside the image.

### Recommended method

We provide a very convenient script that allows the yq container to run as if it was installed natively:

```bash
sudo curl -L --fail https://raw.githubusercontent.com/linuxserver/docker-yq/master/run-yq.sh -o /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

Running these two commands on your docker host once will let you issue commands such as `yq .foo.bar input.yml` and the yq container will do its job behind the scenes.

```bash
sudo curl -L --fail https://raw.githubusercontent.com/linuxserver/docker-yq/master/run-jq.sh -o /usr/local/bin/jq
sudo chmod +x /usr/local/bin/jq
```

Running these two commands on your docker host once will let you issue commands such as `jq .foo.bar input.json` and the jq container will do its job behind the scenes.

```bash
sudo curl -L --fail https://raw.githubusercontent.com/linuxserver/docker-yq/master/run-xq.sh -o /usr/local/bin/xq
sudo chmod +x /usr/local/bin/xq
```

Running these two commands on your docker host once will let you issue commands such as `xq .foo.bar input.xml` and the xq container will do its job behind the scenes.
