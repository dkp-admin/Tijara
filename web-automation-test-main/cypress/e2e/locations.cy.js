describe('Admin Panel Signup', () => {
  
  it(' should Login user ', () => {
    
    // 1. Visit the Admin Panel Login Page
    cy.visit('https://tijarah-qa.vercel.app/'); 
    cy.wait(2000);

    // 2. Enter the phone number
    cy.xpath("//input[@id='phone']").clear().type('7007446621');
    cy.wait(2000);

    //  Enter the password
    cy.xpath("//input[@id=':r2:']").type('00004444');
    cy.wait(2000);
    //  Log in
    cy.xpath("//button[normalize-space()='Log In']").click();
  //click on locations 
  cy.xpath("//span[normalize-space()='Locations']").click();



  });

});
