---
sidebar_position: 5
sidebar_label: Update Bigbytes
---

# Updating Bigbytes to the latest version

## Local deployments

If you're running Bigbytes on your own laptop using Docker, you just need to instruct Docker to pull
the latest version of Bigbytes:

```shell
docker pull getbigbytes/bigbytes
```

Now restart Bigbytes and you'll be upgraded to the latest version.

## Kubernetes/helm deployments

If you install Bigbytes into kubernetes using our [community helm charts](https://github.com/bigbytes/helm-charts)
you need to update your helm chart repository and upgrade your deployment.

```shell
helm repo update bigbytes
helm upgrade -f values.yml bigbytes getbigbytes/bigbytes
```
