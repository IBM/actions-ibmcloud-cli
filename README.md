# IBM Cloud CLI action

This action installs the IBM Cloud CLI and authenticates with IBM Cloud so you can run commands against it.

## Inputs

### `APIKEY`

**Required** Your API key to talk to the IBM Cloud

### `CLOUD_REGION`

**Required** The region you would like to interface with the IBM Cloud Default: `us-south`

## Example usage

```yaml
uses: actions/ibmcloud-action@v1
with:
    APIKEY: ${{ secrets.IBM_CLOUD_API_KEY }}
    CLOUD_REGION: us-south
```
