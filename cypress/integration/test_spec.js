describe('Test membership creation', () => {
    Cypress.config('baseUrl', 'https://app.officernd.com/api/v1/organizations/sherif-qa-assignment');


    const createBaseMembership = (planId, teamId, officeId) => [{
        "name": "Hotest_desk",
        "price": 1000,
        "plan": planId,
        "team": teamId,
        "office": officeId,
        "startDate": "2021-02-25T00:00:00.000Z"
    }];

    let token;
    before(() => {
        const sherifAuth =
        {
            "client_id": "GagqXDJnhN4uZ1J0",
            "client_secret": "W3g9QcOVcQhaNnPUxBVGswQzjPsbvrH8",
            "grant_type": "client_credentials",
            "scope": "officernd.api.read officernd.api.write"
        };
        cy.request({
            method: 'POST',
            url: 'https://identity.officernd.com/oauth/token',
            form: true,
            body: sherifAuth
        })
            .then(response => response.body)
            .then(body => {
                token = body.access_token;
            });
    });

    it('checks the status', function () {
        cy.request({
            method: 'GET',
            url: '/plans',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(x => expect(x.status).equal(200));
    });

    it('should retrieve only plans with name "Private Office"', function () {
        const filterKey = 'Private office';
        cy.request({
            method: 'GET',
            url: `/plans?name=${filterKey}`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.body)
            .then(plans => {
                const allFieldsComplyType = plans.every(x => x.name === filterKey);
                expect(allFieldsComplyType).equal(true);
            });
    });

    it('should create membership', function () {
        cy.request({
            method: 'GET',
            url: '/teams',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.body).as('getTeams');

        cy.request({
            method: 'GET',
            url: '/offices',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.body).as('getOffices');

        cy.request({
            method: 'GET',
            url: '/plans?name=Private office',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.body).as('getPlans');


        cy.get('@getPlans')
            .then(plans => cy.get('@getOffices')
                .then(offices => cy.get('@getTeams')
                    .then(teams => {
                        cy.request({
                            method: 'POST',
                            url: '/memberships',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: createBaseMembership(plans[0]._id, teams[0]._id, offices[0]._id)
                        }).then(x => {
                            expect(x.status).equal(200);
                        });

                    })));
    });

    it('should create membership with hard coded values from the mail', function () {

        cy.request({
            method: 'GET',
            url: '/plans?name=Private office',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.body).as('getPlans');


        cy.get('@getPlans')
            .then(plans => {
                cy.request({
                    method: 'POST',
                    url: '/memberships',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: createBaseMembership(plans[0]._id, '6017be52335c53c48d186e8f', '5c5860778b912600106ad371')
                }).then(x => {
                    expect(x.status).equal(200);
                });
            });
    });
});



