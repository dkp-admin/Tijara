describe('Admin Panel Signup', () => {
  
  it(' should Login user ', () => {
    
    //  Visit the Admin Panel Login Page
    cy.visit('https://tijarah-qa.vercel.app/'); 
    cy.wait(2000);

    //  Enter the phone number
    cy.xpath("//input[@id='phone']").clear().type('7007446621');
    cy.wait(2000);

    //  Enter the password
    cy.xpath("//input[@id=':r2:']").type('00004444');
    cy.wait(2000);

    // Log in
    cy.xpath("//button[normalize-space()='Log In']").click();

   //visit orders 
   cy.visit('https://tijarah-qa.vercel.app/orders');

   // click orders 
    cy.xpath("//span[@class='MuiBox-root css-lj3ywm']").click();


  });

});
