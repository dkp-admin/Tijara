describe('Tijarah360 - Full User Flow: Registration, OTP Verification, Payment', () => {
  it('Completes registration, verifies OTP, and submits payment', () => {
    // Step 1: Register a new user
    cy.visit('https://tijarah-qa.vercel.app/signup');
    cy.wait(2000);

    const timestamp = Date.now();
    const testEmail = `qatest${timestamp}@mail.com`;

    cy.get('input[name="name"]', { timeout: 10000 }).should('be.visible').type('QATest');
    cy.wait(1000);

    cy.get('input[name="email"]').type(testEmail);
    cy.wait(1000);

    cy.get('input[id="phone"]').clear().type('8074415419');
    cy.wait(1000);

    cy.get('input[name="password"]').type('JagathQACypress');
    cy.wait(1000);

    cy.get('input[name="confirmPassword"]').type('JagathQACypress');
    cy.wait(1000);

    cy.get('input[name="policy"]').check({ force: true });
    cy.wait(1000);

    cy.contains('button', 'Register').should('be.visible').click();
    cy.wait(3000);

    // Step 2: OTP Verification
    cy.url().should('include', '/otp-verify');
    const otpCode = ['8', '0', '0', '0'];
    otpCode.forEach((digit, index) => {
      cy.get('input').eq(index).should('be.visible').type(digit);
      cy.wait(800);
    });

    cy.contains('button', 'Verify').should('be.visible').click();
    cy.wait(3000);

    // Step 3: Payment
    cy.url().should('include', '/payment-gateway');
    cy.wait(2000);

    cy.contains('label', 'Offline').should('be.visible').click();
    cy.wait(1500);

    cy.get('div[role="button"]').first().click();
    cy.wait(1000);
    cy.contains('li', 'Cash').should('be.visible').click();
    cy.wait(1500);

    cy.get('input[name="transactionId"]').should('be.visible').clear().type('1234');
    cy.wait(1000);

    cy.get('input[name="salesPerson"]').should('be.visible').clear().type('Jagath');
    cy.wait(1000);

    cy.get('textarea[name="note"]').should('be.visible').clear().type('this is for testing T360');
    cy.wait(1000);

    cy.contains('button', 'Submit').should('be.visible').click();
    cy.wait(3000);
  });
});
