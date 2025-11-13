import faker from "https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js";

export const generateCategory = ({ companyRef, company }) => {
  const name = faker.commerce.department();
  return {
    name: { en: name, ar: `${name}.Ar` },
    image: faker.image.food(),
    companyRef,
    company: { name: company.name.en },
    description: faker.commerce.product(),
    status: "active",
  };
};
