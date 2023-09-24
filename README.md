# Core Backend

## DEV environment
- NVM 
- Install extensions vs-code in project
- Docker
- Hasura CLI (v2 required)
- Node ^16.13.0

## How to Run
- Add new line at hosts file: `127.0.0.1       data.thchemical.api`
- Copy `dotenv` file to `.env` and edit configuration if necessary
- Commands:

```
nvm use
```
```
make package
```
```
make dev
```
```
make bootstrap
```

- Go with address http://data.thchemical.api