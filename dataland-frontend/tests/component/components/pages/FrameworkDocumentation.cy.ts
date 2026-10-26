import { defineComponent, h } from 'vue';
import { createMemoryHistory, createRouter, RouterView, type Router } from 'vue-router';
import { routes } from '@/router';
import { minimalKeycloakMock } from '@ct/testUtils/Keycloak';
import { parseSpecificationStructure } from '@/utils/SpecificationDocumentation';
import AuthenticationWrapper from '@/components/wrapper/AuthenticationWrapper.vue';
import type {
  FrameworkSpecification,
  SimpleFrameworkSpecification,
  DataPointTypeSpecification,
  DataPointBaseTypeSpecification,
} from '@clients/specificationservice';

const catalog: SimpleFrameworkSpecification[] = [
  { framework: { id: 'sfdr', ref: '/specifications/frameworks/sfdr' }, name: 'SFDR' },
  { framework: { id: 'pcaf', ref: '/specifications/frameworks/pcaf' }, name: 'PCAF' },
];
const schema = {
  environmental: {
    greenhouseGasEmissions: {
      scope1: {
        id: 'scope1-emissions',
        ref: '/specifications/data-point-types/scope1-emissions',
        aliasExport: 'ScopeOneExport',
      },
      scope2: { id: 'scope2-emissions', ref: '/specifications/data-point-types/scope2-emissions' },
    },
  },
};
const framework: FrameworkSpecification = {
  framework: catalog[0].framework,
  name: 'SFDR',
  businessDefinition: 'A **framework** for sustainability disclosures.',
  schema: JSON.stringify(schema),
  referencedReportJsonPath: 'general.referencedReports',
};
const dataPoint: DataPointTypeSpecification = {
  dataPointType: { id: 'scope1-emissions', ref: '/specifications/data-point-types/scope1-emissions' },
  name: 'Scope 1 GHG emissions',
  businessDefinition: 'Direct greenhouse gas emissions.',
  dataPointBaseType: { id: 'decimal', ref: '/specifications/data-point-base-types/decimal' },
  usedBy: [catalog[0].framework],
  constraints: ['Must be non-negative'],
  calculationRules: [{ inputs: ['scope2-emissions'], calculationMethod: 'Sum' }],
};
const baseType: DataPointBaseTypeSpecification = {
  dataPointBaseType: dataPoint.dataPointBaseType,
  name: 'Decimal',
  businessDefinition: 'A decimal value with source information.',
  validatedBy: 'org.dataland.Decimal',
  example: { value: 0 },
  usedBy: [dataPoint.dataPointType],
};

/** Mounts real documentation routes with the standard query and authentication providers. */
function mountDocumentation(path: string): Router {
  const router = createRouter({ history: createMemoryHistory(), routes });
  const root = defineComponent({ render: () => h(RouterView) });
  cy.wrap(router.push(path)).then(() => {
    cy.mountWithPlugins(root, { router, keycloak: minimalKeycloakMock() });
  });
  return router;
}

describe('Framework documentation', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/specifications/frameworks', catalog).as('catalog');
    cy.intercept('GET', '**/specifications/frameworks/sfdr', framework).as('framework');
    cy.intercept('GET', '**/specifications/data-point-types/scope1-emissions', dataPoint).as('dataPoint');
    cy.intercept('GET', '**/specifications/data-point-base-types/decimal', baseType).as('baseType');
  });

  it('searches the service catalog and navigates through fields, base types and related definitions', () => {
    const router = mountDocumentation('/frameworks');
    cy.wait('@catalog');
    cy.get('#framework-search').type('pcaf');
    cy.get('[data-test="framework-catalog"]').should('contain', 'PCAF').and('not.contain', 'SFDR');
    cy.get('#framework-search').clear().type('sfdr');
    cy.contains('a', 'SFDR').click();
    cy.wait('@framework');
    cy.get('input[aria-label="Find a field"]').type('ScopeOneExport');
    cy.contains('.field-label', 'environmental.greenhouseGasEmissions.scope1').click();
    cy.wait('@dataPoint');
    cy.get('[data-test="data-point-specification"]')
      .should('contain', 'Direct greenhouse gas emissions.')
      .and('contain', 'Must be non-negative')
      .and('contain', 'Sum');
    cy.then(() => {
      expect(router.currentRoute.value.query.field).to.equal('environmental.greenhouseGasEmissions.scope1');
    });
    cy.contains('a', 'decimal').click();
    cy.wait('@baseType');
    cy.get('[data-test="base-type-specification"]').should('contain', 'A decimal value with source information.');
    cy.contains('summary', 'View example').click();
    cy.get('pre').should('contain', '"value": 0');
    cy.contains('a', 'scope1-emissions').click();
    cy.get('[data-test="data-point-specification"]').should('contain', 'Scope 1 GHG emissions');
    cy.then(() => router.back());
    cy.get('[data-test="base-type-specification"]').should('be.visible');
  });

  it('opens a bookmarked field, fetches the resolved schema only on request, and retains original JSON', () => {
    cy.intercept('GET', '**/specifications/frameworks/sfdr/resolved-schema', {
      framework: framework.framework,
      name: framework.name,
      businessDefinition: framework.businessDefinition,
      resolvedSchema: { environmental: { scope1: { type: 'number' } } },
    }).as('resolved');
    mountDocumentation('/frameworks/sfdr?field=environmental.greenhouseGasEmissions.scope1');
    cy.wait('@dataPoint');
    cy.contains('strong', 'Field path:').parent().should('contain', 'environmental.greenhouseGasEmissions.scope1');
    cy.get('@resolved.all').should('have.length', 0);
    cy.contains('button', 'Explore resolved schema').click();
    cy.wait('@resolved');
    cy.contains('summary', 'View resolved schema JSON').click();
    cy.get('pre').should('contain', '"type": "number"');
    cy.contains('summary', 'View framework JSON').click();
    cy.get('pre').should('contain', 'ScopeOneExport');
  });

  it('shows recoverable errors for a definition without losing the framework structure', () => {
    cy.intercept('GET', '**/specifications/data-point-types/scope1-emissions', { statusCode: 503 }).as('failed');
    mountDocumentation('/frameworks/sfdr?field=environmental.greenhouseGasEmissions.scope1');
    cy.wait('@failed');
    cy.get('[data-test="specification-error"]').should('contain', 'could not be loaded');
    cy.get('[aria-label="Framework structure"]').should('be.visible');
    cy.intercept('GET', '**/specifications/data-point-types/scope1-emissions', dataPoint).as('recovered');
    cy.contains('button', 'Try again').click();
    cy.wait('@recovered');
    cy.get('[data-test="data-point-specification"]').should('be.visible');
  });

  it('handles missing documents and permission errors explicitly', () => {
    cy.intercept('GET', '**/specifications/frameworks/sfdr', { statusCode: 404 });
    mountDocumentation('/frameworks/sfdr');
    cy.get('[data-test="specification-error"]').should('contain', 'could not be found');
    cy.intercept('GET', '**/specifications/frameworks/sfdr', { statusCode: 403 });
    cy.contains('button', 'Try again').click();
    cy.get('[data-test="specification-error"]').should('contain', 'permission');
  });

  it('does not silently render a malformed schema as an empty framework', () => {
    cy.intercept('GET', '**/specifications/frameworks/sfdr', { ...framework, schema: '{broken' });
    mountDocumentation('/frameworks/sfdr');
    cy.contains('The framework structure could not be displayed').should('be.visible');
    cy.contains('summary', 'View framework JSON').click();
    cy.get('pre').should('contain', '{broken');
  });

  it('provides catalog empty and no-search-results states', () => {
    mountDocumentation('/frameworks');
    cy.get('#framework-search').type('does-not-exist');
    cy.contains('No frameworks match your search.').should('be.visible');
  });

  it('handles an empty catalog', () => {
    cy.intercept('GET', '**/specifications/frameworks', []);
    mountDocumentation('/frameworks');
    cy.contains('No framework documentation is available.').should('be.visible');
  });

  it('handles an unknown bookmarked field without fetching an unrelated definition', () => {
    mountDocumentation('/frameworks/sfdr?field=unknown');
    cy.contains('This field does not exist in this framework.').should('be.visible');
    cy.get('@dataPoint.all').should('have.length', 0);
  });

  it('requires login on all documentation routes and keeps protected content unmounted', () => {
    for (const name of [
      'Frameworks',
      'Framework documentation',
      'Data point documentation',
      'Base type documentation',
    ]) {
      expect(routes.find((route) => route.name === name)?.meta.requiresAuthentication).to.equal(true);
    }
    const keycloak = minimalKeycloakMock({ authenticated: false });
    const login = cy.stub().as('login');
    login.resolves();
    keycloak.login = login;
    const protectedPage = defineComponent({
      render: () =>
        h(
          AuthenticationWrapper,
          {},
          {
            default: () => h('div', { 'data-test': 'protected-documentation' }, 'Documentation'),
          }
        ),
    });
    cy.mountWithPlugins(protectedPage, {
      keycloak,
    });
    cy.get('@login').should('have.been.calledOnce');
    cy.get('[data-test="protected-documentation"]').should('not.exist');
  });
});

describe('Framework specification parsing', () => {
  it('preserves hierarchy, repeated type references, identifiers and aliases', () => {
    const parsed = parseSpecificationStructure(
      JSON.stringify({
        ...schema,
        other: { sameType: schema.environmental.greenhouseGasEmissions.scope1 },
      })
    );
    expect(parsed.fields).to.have.length(3);
    expect(parsed.fields[0]).to.deep.equal({
      path: 'environmental.greenhouseGasEmissions.scope1',
      id: 'scope1-emissions',
      alias: 'ScopeOneExport',
    });
    expect(parsed.fields[2].path).to.equal('other.sameType');
    expect(parsed.nodes[0].children?.[0].children?.[0].leaf).to.equal(true);
  });

  it('rejects unsupported schema shapes and invalid references', () => {
    for (const invalid of ['[]', 'null', '{"section":12}', '{"section":{"field":{"id":12,"ref":"x"}}}']) {
      expect(() => parseSpecificationStructure(invalid)).to.throw();
    }
  });
});
