# Update e2e screenshots

## Overview

GitHub Action for updating e2e screenshots.

## Task options

See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example

```yaml
- name: Create release
  if: github.event_name != 'pull_request'
  uses:  AmadeusITGroup/otter/tools/github-actions/update-e2e-screenshots
  with:
    version: ${{ nextVersionTag }}
    target: ${{ github.ref_name }}
```
