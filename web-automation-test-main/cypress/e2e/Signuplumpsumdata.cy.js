describe('User Registration Form - Multiple Data Sets', () => {
  // Create an array of user objects with test data
  const testUsers = [
    {
      name: 'QATest1',
      email: 'user1@example.com',
      phone: '1011111111',
      password: 'PassTest1!',
    },
    {
      name: 'QATest2',
      email: 'user2@example.com',
      phone: '2022222222',
      password: 'PassTest2!',
    },
    {
      name: 'QATest3',
      email: 'user3@example.com',
      phone: '3033333333',
      password: 'PassTest3!',
    },
    {
      name: 'QATest4',
      email: 'user4@example.com',
      phone: '4044444444',
      password: 'PassTest4!',
    },
    {
      name: 'QATest5',
      email: 'user5@example.com',
      phone: '5055555555',
      password: 'PassTest5!',
    },
    {
      name: 'QATest6',
      email: 'user6@example.com',
      phone: '6066666666',
      password: 'PassTest6!',
    },
    {
      name: 'QATest7',
      email: 'user7@example.com',
      phone: '7077777777',
      password: 'PassTest7!',
    },
    {
      name: 'QATest8',
      email: 'user8@example.com',
      phone: '8088888888',
      password: 'PassTest8!',
    },
    {
      name: 'QATest9',
      email: 'user9@example.com',
      phone: '9099999999',
      password: 'PassTest9!',
    },
    {
      name: 'QATest10',
      email: 'user10@example.com',
      phone: '1000000000',
      password: 'PassTest10!',
    }
  ];

  // Loop through each user and run the registration. 
  testUsers.forEach((user) => {
    it(`should register user ${user.name} with email ${user.email}`, () => {
      cy.visit('https://tijarah-qa.vercel.app/authentication/register');
      cy.wait(2000);

      // Fill in Name
      cy.xpath("//input[@id=':r1:']").type(user.name);
      cy.wait(1000);

      // Fill in Email
      cy.xpath("//input[@id=':r2:']").type(user.email);
      cy.wait(1000);

      // Fill in Phone
      cy.xpath("//input[@id='phone']").clear().type(user.phone);
      cy.wait(1000);

      // Fill in Password
      cy.xpath("//input[@id=':r4:']").type(user.password);
      cy.wait(1000);

      // Confirm Password
      cy.xpath("//input[@id=':r5:']").type(user.password);
      cy.wait(1000);

      // Agree to Terms and Conditions
      cy.xpath("//input[@name='policy']").check();
      cy.wait(1000);

      // Submit the form
      cy.xpath("//button[normalize-space()='Register']").click();
      cy.wait(3000);
    });
  });
});
