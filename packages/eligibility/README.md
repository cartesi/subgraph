## Docker build instructions

In order to build the image for the eligibility package, we need to be working from the root folder of the monorepo.
Then, we can execute a command as such:

```
docker build . -t cartesi/eligibility:1.1.1 -f ./packages/eligibility/Dockerfile
```
