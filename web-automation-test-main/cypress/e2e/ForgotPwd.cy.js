describe('Forgot Pwd', () => {

  it(' allows user with a mail for forgot pwd', () => {

    // Step 1: Visit the Forgot Password page
    cy.visit('https://tijarah-qa.vercel.app/authentication/forgot-password');

    // Step 2: Type a valid phone number into the phone number input field
    cy.xpath("//input[@id='phone']").clear().type('807441541');
    cy.wait(1000);

    // Step 3: Click the "Continue" button to proceed with password recovery
    cy.contains('button', 'Continue').click();

    // Step 4: - Verify that user is redirected or sees success message
   // cy.contains('OTP sent to your number').should('be.visible');

describe('Password Reset ', () => {

      it('should allow the user to reset password with OTP', () => {
    
        // Step 1: Visit the password reset page
        cy.visit('https://tijarah-qa.vercel.app/authentication/password-reset?phone=%2B966-807441541');
    
        // Step 2: Enter 4-digit OTP - replace with valid OTP number as per testing setup
        cy.get('input').eq(0).type('1'); // First OTP number
        cy.get('input').eq(1).type('2'); // Second OTP number
        cy.get('input').eq(2).type('3'); // Third OTP number
        cy.get('input').eq(3).type('4'); // Fourth OTP number
    
        // Step 3: Enter new password
        cy.xpath("//input[@id=':r5:']").click().type('JagathQACypress123');
    
        // Step 4: Repeat new password
        cy.xpath("//input[@id=':r6:']").type('JagathQACypress123');
    
        // Step 5: Click on "Reset Password" button
        cy.contains('button', 'Reset Password').click();
    
        // Optional: Step 6 -  success message 
        // cy.contains('Password has been reset successfully').should('be.visible');
      });
    
    });
  
  });

});
