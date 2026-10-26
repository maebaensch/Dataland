# dataland-frontend

## Framework documentation

Signed-in users can open **Frameworks** in the main navigation to browse the specification-service catalog.
Select a framework, then search its structure by field name, path, data-point identifier or export alias.
Selecting a field shows its definition, constraints, calculation rules and links to base types and related frameworks.
Field selections are stored in the URL (`/frameworks/<framework-id>?field=<field-path>`), so they can be bookmarked.
Standalone data-point and base-type documentation also has dedicated routes.

Documentation links are available in dataset viewing, framework selection, upload forms and the data-point editor.
Technical panels expose the original JSON, examples and an on-demand resolved schema.
The documentation routes use the existing login wrapper; this frontend feature does not change the specification
service's API access policy.

The client is generated from the specification service's OpenAPI file:

```sh
./gradlew :dataland-frontend:generateSpecificationServiceClient
```

It is also included in `:dataland-frontend:generateClients`. Backend calls for this feature live in
`src/api-queries/specification-service/`, while rendering and schema parsing stay outside query hooks.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
