---
sidebar_position: 5
sidebar_label: Update Clairdash
---

# Updating Clairdash to the latest version

## Local deployments

If you're running Clairdash on your own laptop using Docker, you just need to instruct Docker to pull
the latest version of Clairdash:

```shell
docker pull clairview/clairdash
```

Now restart Clairdash and you'll be upgraded to the latest version.

## Kubernetes/helm deployments

If you install Clairdash into kubernetes using our [community helm charts](https://github.com/clairdash/helm-charts)
you need to update your helm chart repository and upgrade your deployment.

```shell
helm repo update clairdash
helm upgrade -f values.yml clairdash clairview/clairdash
```
