import axios from "axios";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import * as fs from 'fs';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const companyOptions = {
  method: 'GET',
  url: 'https://backend.simfin.com/api/v3/companies/list',
  headers: {
    Authorization: 'api-key ' + process.env.API_KEY,
    accept: 'application/json'
  }
};

const companies = await axios.request(companyOptions).then(function (response) {
  let data = {}
  data = response.data
  // data = data.filter((company) => {
  //   const match = String(company.sector).match(/^[104]{3}/);
  //   if (match) {
  //       return false
  //   } else {
  //       return true
  //   }
  // })
  console.log("Found " + data.length + " companies");
  console.log(data.filter((c) => c.sector==null).length + " companies have a null sector")
  // fs.writeFile("companies.json", JSON.stringify(data), 'utf-8', function(err) {
  //   if (err) {
  //       console.log(err);
  //   }
  //   });

  // fs.writeFile("nulls.json", JSON.stringify(data.filter((c) => c.sector==null)), 'utf-8', function(err) {
  //   if (err) {
  //       console.log(err);
  //   }
  //   }); 
  return data
}).catch(function (error) {
  console.error(error);
});

for (const company of companies) {
  console.log("Gathering info for " + company.name)
  // general company info
  const generalOptions = {
    method: 'GET',
    url: 'https://backend.simfin.com/api/v3/companies/general/verbose',
    headers: {
      Authorization: 'api-key ' + process.env.API_KEY,
      accept: 'application/json'
    },
    params: {
      id: company.id
    }
  };
  const generalData = await axios.request(generalOptions).then(function (response) {
    //console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.error(error);
  });

  fs.writeFile("companyData/general/" + company.id + ".json", JSON.stringify(generalData, null, 2), 'utf-8', function(err) {
    if (err) {
        console.log(err);
    }
    });

  // price data

  const priceOptions = {
    method: 'GET',
    url: 'https://backend.simfin.com/api/v3/companies/prices/verbose',
    headers: {
      Authorization: 'api-key ' + process.env.API_KEY,
      accept: 'application/json'
    },
    params: {
      ratios: true,
      id: company.id
    }
  };
  const priceData = await axios.request(priceOptions).then(function (response) {
    //console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.error(error);
  });

  fs.writeFile("companyData/price/" + company.id + ".json", JSON.stringify(priceData, null, 2), 'utf-8', function(err) {
    if (err) {
        console.log(err);
    }
    });

  // company fundamentals

  const fundamentalOptions = {
    method: 'GET',
    url: 'https://backend.simfin.com/api/v3/companies/statements/verbose',
    headers: {
      Authorization: 'api-key ' + process.env.API_KEY,
      accept: 'application/json'
    },
    params: {
      id: company.id,
      statements: "PL,BS,CF,DERIVED",
      columnDetails: true,
      period: "q1,q2,q3,q4",
      ttm: true
    }
  };

  const fundamentalData = await axios.request(fundamentalOptions).then(function (response) {
    //console.log(response.data)
    return response.data
  }).catch(function (error) {
    console.error(error);
  });

  fs.writeFile("companyData/fundamental/" + company.id + ".json", JSON.stringify(fundamentalData, null, 2), 'utf-8', function(err) {
    if (err) {
        console.log(err);
    }
    });

  // assemble and save

  // let finalCoJson = {
  //   company: [
  //     generalData,
  //     priceData,
  //     fundamentalData
  //   ]
  // }
  // console.log(finalCoJson)
  //   fs.writeFile("companyData/" + company.id + ".json", JSON.stringify(finalCoJson, null, 2), 'utf-8', function(err) {
  //   if (err) {
  //       console.log(err);
  //   }
  //   });

  break
  await sleep(5000)
}

