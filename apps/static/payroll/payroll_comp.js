$(document).ready(function () {
    // Initialize autocomplete for the "name" field
    $("#name").autocomplete({
      source: async function (request, response) {
        try {
          const result = await $.ajax({
            url: "/graphql", // Replace with your actual GraphQL endpoint
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              query: `
                query($searchTerm: String!) {
                  employeeAutocomplete(searchTerm: $searchTerm) {
                    Id
                    Company
                    EmployeeID
                    LastName
                    FirstName
                    Position
                    Salaryrate
                    Allowance
                    TaxCode
                  }
                }
              `,
              variables: { searchTerm: request.term }
            }),
          });

          // Process the result to format the data for jQuery UI Autocomplete
          const employees = result.data.employeeAutocomplete.map((employee) => ({
            label: `${employee.FirstName} ${employee.LastName}`,
            value: employee.FirstName + " " + employee.LastName,
            data: employee
          }));

          response(employees);
        } catch (error) {
          console.error("Error fetching autocomplete data:", error);
        }
      },
      select: function (event, ui) {
        // Fill other form fields with the selected employee's data
        const employee = ui.item.data;
        $("#company").val(employee.Company);
        $("#employee_id").val(employee.EmployeeID);
        $("#last_name").val(employee.LastName);
        $("#first_name").val(employee.FirstName);
        $("#position").val(employee.Position);
        $("#salary_rate").val(employee.Salaryrate);
        $("#allowance").val(employee.Allowance);
        $("#tax_code").val(employee.TaxCode);
        $("#basic_pay").val(employee.Salaryrate);
       
        calculatetotalGross()
       
        calculateOtherForms13th()
        
        


        // Trigger the contribution fetch logic
          const basicPay = parseFloat(employee.Salaryrate);
          if (!isNaN(basicPay) && basicPay > 0) {
            // Make an AJAX request to the GraphQL endpoint
            $.ajax({
              url: '/graphql', // Replace with your GraphQL endpoint
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                query: `
                  query {
                    getContributionByRange(value: ${basicPay}) {
                      employeeShare
                      ssProvidentEmp
                    }
                  }
                `
              }),
              success: function (response) {
                // Handle the response
                if (response.data && response.data.getContributionByRange) {
                  const contribution = response.data.getContributionByRange;
                  console.log('Contribution data:', contribution);
                  
                  // Ensure the value is numeric before updating the input
                  if (!isNaN(contribution.employeeShare)) {
                    $("#sss").val(contribution.employeeShare + contribution.ssProvidentEmp);
                    calculateTotalGovt()

                  } else {
                    alert('Invalid contribution data received.');
                  }
                } else {
                  alert('No contribution data found for the given salary range.');
                }
              },
              error: function (error) {
                // Handle errors
                console.error('Error fetching contribution:', error);
                alert('An error occurred while fetching contribution data.');
              }
            });
          } else {
            alert('Please enter a valid salary amount.');
          }

          // this is for auto MWE for every company

          // Make an AJAX request to the GraphQL endpoint

        
      $.ajax({
        url: '/graphql', // Replace with your GraphQL endpoint
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            query: `
                query {
                   minimumwagesPerComp(searchTerm: "${employee.Company}") {
                      Id
                      CompanyName
                      minimumWage
                    }
                }
            `
        }),
        success: function (response) {
            // Handle the response
            if (response.data && response.data.minimumwagesPerComp) {
                const minimum_wage_data = response.data.minimumwagesPerComp;
                console.log('Contribution data:', minimum_wage_data);
                // Check if data is not empty
                if (minimum_wage_data.length > 0) {
                  // Access the first item in the array
                  const firstEntry = minimum_wage_data[0];

                  // Update the input field
                  $("#minimum_wage").val(firstEntry.minimumWage);
                  calculatetoTotalBasic()
                  calculateDeminimis()
                  
                  calculateOtherForms()
                  calculateTotalNonTaxable()
                  
                  calculateTaxableAmount()
                  calculateWitheldTax()
                 
                } else {
                    alert('Invalid  data received.');
                }
            } else {
                alert('No compony is selected.');
            }
        },
        error: function (error) {
            // Handle errors
            console.error('Error fetching contribution:', error);
            alert('An error occurred while fetching Company');
        }
    });


         

          // this is for computation of PHIC
          // let phic;

          // switch (true) {
          //     case basicPay <= 10000:
          //         phic = 500; // Example rate for basic pay ≤ 10,000
          //         break;

          //     case basicPay > 10000:
          //         phic = basicPay * 0.05; // Example rate for basic pay > 10,000
          //         break;

          //     default:
          //         phic = 0; // Handle invalid input
          //         break;
          // }

          // // Update the UI with the computed PHIC value
          // $('#phic').val(phic.toFixed(2));
            

        // this is for computation of HDMF

        // let hdmf;

        // switch (true) {
        //     case basicPay >= 1:
        //         hdmf = 200; // Example rate for basic pay ≤ 10,000
        //         break;

        //     case basicPay <= 0:
        //       hdmf = 0; 
        //       break;
    
        //     default:
        //       hdmf = 0; // Handle invalid input
        //       break;
          
        // }

        //   // Update the UI with the computed PHIC value
        //  $('#hdmf').val(hdmf.toFixed(2));
         
        calculatePhic()
        calculateHDMF()

        
    
         
      },
      minLength: 0 // Minimum characters to start search
    });
    
  });



// =================================This is for computation for Gross Salary======================
$(document).ready(function() {
    $('#basic_pay,#allowance_basic,#absent,#late,#overtime ,\
      #holiday,#night_diff,#incentives,#adjustme_gross').on('input', function() {
        calculatetotalGross();
        // calculateTaxableAmount();
    });
    });

    function calculatetotalGross() {
    
    let basic_pay;
    let allowance_basic;
    let late;
    let overtime;
    let holiday;
    let night_diff;
    let incentives;
    let adjustme_gross;
    


    basic_pay = $('#basic_pay').val() || 0;
    allowance_basic = $('#allowance_basic').val() || 0;
    absent = $('#absent').val() || 0;
    late = $('#late').val() || 0;
    overtime = $('#overtime').val() || 0;
    holiday = $('#holiday').val() || 0;
    night_diff = $('#night_diff').val() || 0;
    incentives = $('#incentives').val() || 0;
    adjustme_gross = $('#adjustme_gross').val() || 0;
  
    
    let product;
    let product2
    product = (parseFloat(basic_pay) + parseFloat(allowance_basic)
                    + parseFloat(late) + parseFloat(absent) + parseFloat(overtime)
                    + parseFloat(holiday) + parseFloat(night_diff)
                    + parseFloat(incentives) + parseFloat(adjustme_gross)
                   );

    product2 = product.toFixed(2);
    const stringNumber = product.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    $('#gross_pay').val(stringNumber);
    $('#gross_pay2').val(product2);
    calculatetoTotalBasic()
    calculateTotalNonTaxable()
    
    calculateNetPay()
    }


// this is for computation of SSS contri

// $(document).ready(function () {
//   // Attach an event listener to the input field
//   $('#basic_pay').on('change', function () {
    
//       // Get the value from the input field
//       const value = parseFloat($(this).val());
//       console.log(value)
//       // Validate the input value
//       if (isNaN(value) || value <= 0) {
//           alert('Please enter a valid salary amount.');
//           return;
//       }

//       // Make an AJAX request to the GraphQL endpoint
//       $.ajax({
//           url: '/graphql', // Replace with your GraphQL endpoint
//           method: 'POST',
//           contentType: 'application/json',
//           data: JSON.stringify({
//               query: `
//                   query {
//                       getContributionByRange(value: ${value}) {
//                           employeeShare
//                           ssProvidentEmp
//                       }
//                   }
//               `
//           }),
//           success: function (response) {
//               // Handle the response
//               if (response.data && response.data.getContributionByRange) {
//                   const contribution = response.data.getContributionByRange;
//                   console.log('Contribution data:', contribution);
                  
//                   // Ensure the value is numeric before updating the input
//                   if (!isNaN(contribution.employeeShare)) {
//                      let sssContri = parseFloat(contribution.employeeShare + contribution.ssProvidentEmp);
                      
//                       $("#sss").val(sssContri);
                     
//                       calculateTotalGovt()

                     
//                   } else {
//                       alert('Invalid contribution data received.');
//                   }
//               } else {
//                   alert('No contribution data found for the given salary range.');
//               }
//           },
//           error: function (error) {
//               // Handle errors
//               console.error('Error fetching contribution:', error);
//               alert('An error occurred while fetching contribution data.');
//           }
//       });
//   });
// });


// this is for computation for PHIC

$(document).ready(function() {

   $('#basic_pay').on('input', function() {
        calculatePhic();
    });

}
);


 function calculatePhic() {

  let basicPay = parseFloat($('#basic_pay').val());
    let phic;

    switch (true) {
        case basicPay <= 10000:
            phic = 500; // Example rate for basic pay ≤ 10,000
            break;

        case basicPay > 10000:
            phic = (basicPay * 0.05) / 2; // Example rate for basic pay > 10,000
            break;

        default:
            phic = 0; // Handle invalid input
            break;
    }

    // Update the UI with the computed PHIC value
    $('#phic').val(phic.toFixed(2));


 }


 function calculateHDMF() {

  let basicPay = parseFloat($('#basic_pay').val());
    let hdmf;

    switch (true) {
        case basicPay >= 1:
            hdmf = 200; // Example rate for basic pay ≤ 10,000
            break;

        case basicPay <= 0:
          hdmf = 0; 
          break;

        default:
          hdmf = 0; // Handle invalid input
          break;    
    }

    // Update the UI with the computed PHIC value
    $('#hdmf').val(hdmf.toFixed(2));


 }


 $(document).ready(function() {

  $('#sss,#phic,#hdmf').on('input', function() {
    calculateTotalGovt();
   });

}
);


function calculateTotalGovt() {

  let sss_total;
  let phic_total;
  let hdmf_total;

  


  sss_total = $('#sss').val() || 0;
  phic_total = $('#phic').val() || 0;
  hdmf_total = $('#hdmf').val() || 0;
 
  
  
  let product;
  let product2
  product = (parseFloat(sss_total) + parseFloat(phic_total)
                  + parseFloat(hdmf_total) 
                 );

  product2 = product.toFixed(2);
  const stringNumber = product.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  $('#total_gvot').val(stringNumber);
  $('#total_mandatory').val(product2);
  calculateTaxableAmount()

  }




  


 
//   $(document).ready(function() {
//     $('#fetchData').on('click', function() {
//         const searchTerm = 'desiredSearchTerm'; // Replace with actual search term
        
//         // GraphQL query
//         const query = `
//             query {
//                  minimumwagesPerComp(searchTerm: "${searchTerm}") {
//                     Id
//                     CompanyName
//                     minimumWage
//                   }
//             }
//         `;

//         $.ajax({
//             url: '/graphql', // Replace with your GraphQL endpoint
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ query }),
//             success: function(response) {
//                 // Extract data from GraphQL response
//                 const data = response.data.minimumwagesPerComp;

//                 // Loop through data and populate fields
//                 data.forEach(item => {
//                     if (item._id !== 'other_than') {
//                         $('#companyName').val(item.CompanyName);
//                         $('#minimumWage').val(item.minimum_wage);
//                     }
//                 });
//             },
//             error: function(xhr, status, error) {
//                 console.error('Error fetching data:', error);
//             }
//         });
//     });
// });



// this is for computation of SSS contri

$(document).ready(function () {
  // Attach an event listener to the input field
  $('#company').on('change', function () {
    
    const searchTerm = $(this).val();
      // Make an AJAX request to the GraphQL endpoint
      $.ajax({
          url: '/graphql', // Replace with your GraphQL endpoint
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              query: `
                  query {
                     minimumwagesPerComp(searchTerm: "${searchTerm}") {
                        Id
                        CompanyName
                        minimumWage
                      }
                  }
              `
          }),
          success: function (response) {
              // Handle the response
              if (response.data && response.data.minimumwagesPerComp) {
                  const minimum_wage_data = response.data.minimumwagesPerComp;
                  console.log('Contribution data:', minimum_wage_data);
                  // Check if data is not empty
                  if (minimum_wage_data.length > 0) {
                    // Access the first item in the array
                    const firstEntry = minimum_wage_data[0];

                    // Update the input field
                    $("#minimum_wage").val(firstEntry.minimumWage);
                  } else {
                      alert('Invalid  data received.');
                  }
              } else {
                  alert('No compony is selected.');
              }
          },
          error: function (error) {
              // Handle errors
              console.error('Error fetching contribution:', error);
              alert('An error occurred while fetching Company');
          }
      });
  });
});


// this is for computation for otherThanForms
$(document).ready(function () {
  $('#basic_pay').on('input', function () {
    calculateOtherForms13th();
  });
});

function calculateOtherForms13th() {
  let basic13th = parseFloat($('#basic_pay').val()) || 0; // Convert input to a number and default to 0 if invalid
  let amountBasic13th;

  
  if (basic13th <= 30000) {
    amountBasic13th = (90000 - basic13th) / 12;
  } else {
    amountBasic13th = (90000 - 30000) / 12; // Default case if basic13th > 30000
  }

 
  $('#other_than_13th').val(amountBasic13th.toFixed(2)); // Set the calculated value to the input field
}


// this is for computation for Excess Amount Basic Pay
$(document).ready(function () {
  $('#basic_pay,#minimum_wage,#gross_pay2,#adjustme_gross').on('input', function () {
    calculatetoTotalBasic();
   // calculatetotalNonTaxable()
    calculateTaxableAmount()
  });
});

function calculatetoTotalBasic() {
  let totalGrossPay = parseFloat($('#gross_pay2').val()) || 0; 
  let totalMinimum = parseFloat($('#minimum_wage').val()) || 0; 
  let amounttotalBasic;
  
  console.log(totalMinimum)
  
  amounttotalBasic = totalGrossPay - totalMinimum

  if (amounttotalBasic < 0) {
    amounttotalBasic = 0
  }else {
    amounttotalBasic = amounttotalBasic
  }
  
  
  
  $('#total_basic').val(amounttotalBasic.toFixed(2)); // Set the calculated value to the input field
  // calculateDeminimis()
}


$(document).ready(function () {
  $('#gross_pay2,#adjustme_gross,#incentives,#night_diff, \
    #holiday,#overtime,#late,#absent,#allowance_basic').on('input', function () {
    // console.log("testing")
    calculateDeminimis();
  });
});

// this is to calculate Total Deminimis
$('#uniform, #rice, #laundry, #medical1, #medical2').on('input', function () {
  
  calculateTotalDeminimis();
  
});

function calculateTotalDeminimis() {
  // Retrieve values and ensure they're numbers
  const uniform = parseFloat($('#uniform').val()) || 0;
  const rice = parseFloat($('#rice').val()) || 0;
  const laundry = parseFloat($('#laundry').val()) || 0;
  const medical1 = parseFloat($('#medical1').val()) || 0;
  const medical2 = parseFloat($('#medical2').val()) || 0;

  // Compute total deminimis
  const totalDem = uniform + rice + laundry + medical1 + medical2;

  // Update total_deminimis field
  $('#total_deminimis').val(totalDem.toFixed(2));
 // calculateTotalNonTaxable()
 
}


function calculateDeminimis() {
  // const userUniform = $('#uniform').data('user-input');
  // if (userUniform) {
  //   return; // Skip if user edited the value
  // }

  // Constants for calculation
  const BasicDeminimis = 3883.34;
  const basic_uniform = 0.13;
  const basic_rice = 0.52;
  const basic_laundry = 0.08;
  const basic_medical1 = 0.21;
  const basic_medical2 = 0.06;

  // Retrieve tax code and total basic input
  const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty
  const totalBasic = parseFloat($('#total_basic').val()) || 0;

  let uniform = 0, rice = 0, laundry = 0, medical1 = 0, medical2 = 0;

  if (taxCode.toLowerCase().includes('tax')) {
    if (totalBasic >= BasicDeminimis) {
      uniform = 500;
      rice = 2000;
      laundry = 300;
      medical1 = 833.34;
      medical2 = 250;
    } else {
      uniform = totalBasic * basic_uniform;
      rice = totalBasic * basic_rice;
      laundry = totalBasic * basic_laundry;
      medical1 = totalBasic * basic_medical1;
      medical2 = totalBasic * basic_medical2;
    }
  }

  // Update input fields
  $('#uniform').val(uniform.toFixed(2));
  $('#rice').val(rice.toFixed(2));
  $('#laundry').val(laundry.toFixed(2));
  $('#medical1').val(medical1.toFixed(2));
  $('#medical2').val(medical2.toFixed(2));

  // Recalculate total
  calculateTotalDeminimis();
 
}





// // this is for Deminimis
// $(document).ready(function () {
//   $('#basic_pay, #uniform, #rice, #laundry, \
//     #medical1, #medical2,#tax_code').on('input', function () {
//     calculateDeminimis();
//     // calculateTaxableAmount()
//   });
// });


// function calculateDeminimis() {
//   const userUniform = $('#uniform').data('user-input');
//   if (userUniform) {
//     return; // Skip if user edited the value
//   }

//   // Constants for calculation
//   const BasicDeminimis = 3883.34;
//   const basic_uniform = 0.13;
//   const basic_rice = 0.52;
//   const basic_laundry = 0.08;
//   const basic_medical1 = 0.21;
//   const basic_medical2 = 0.06;

//   // Retrieve tax code and total basic input
//   const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty
//   const totalBasic = parseFloat($('#total_basic').val()) || 0;

//   let uniform = 0, rice = 0, laundry = 0, medical1 = 0, medical2 = 0;

//   if (taxCode.toLowerCase().includes('tax')) {
//     if (totalBasic >= BasicDeminimis) {
//       uniform = 500;
//       rice = 2000;
//       laundry = 300;
//       medical1 = 833.34;
//       medical2 = 250;
//     } else {
//       uniform = totalBasic * basic_uniform;
//       rice = totalBasic * basic_rice;
//       laundry = totalBasic * basic_laundry;
//       medical1 = totalBasic * basic_medical1;
//       medical2 = totalBasic * basic_medical2;
//     }
//   }

//   // Update input fields
//   $('#uniform').val(uniform.toFixed(2));
//   $('#rice').val(rice.toFixed(2));
//   $('#laundry').val(laundry.toFixed(2));
//   $('#medical1').val(medical1.toFixed(2));
//   $('#medical2').val(medical2.toFixed(2));

//   // Calculate total and update
//   const totalDem = uniform + rice + laundry + medical1 + medical2;
//   $('#total_deminimis').val(totalDem.toFixed(2));
 
// }

// // Track user edits
// $('#uniform').on('input', function () {
//   $(this).data('user-input', true);
// });


// // this is for Other Forms and Total Non Taxable
// $(document).ready(function () {
//   $('#basic_pay,#other_than_13th,#other_forms').on('input', function () {
//     calculateOtherForms();
//   });
// });


// function calculateOtherForms() {

$(document).ready(function () {
  $('#gross_pay2, #other_than_13th, #other_forms,#total_deminimis,#allowance_basic,#late,#absent,#overtime,#night_diff,#incentives,#holiday,#adjustme_gross').on('input', function () {
    calculateOtherForms();
    
  });
});

function calculateOtherForms() {
 
  const totalBasic = parseFloat($('#total_basic').val()) || 0;
  const totalDem = parseFloat($('#total_deminimis').val()) || 0;
  const otherThan13th = parseFloat($('#other_than_13th').val()) || 0;

  console.log('otherthan13',otherThan13th)
  
  let otherFormsComp = 0;
  let totalNonTaxable = 0;

  // Calculate excess amount of basic pay
  const excessAmountBasicPay = totalBasic - totalDem;

      // Retrieve tax code and total basic input
    const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty

    otherFormsComp = 0;

    if (taxCode.toLowerCase().includes('tax')) {

      // Determine the value of other forms compensation
      if (excessAmountBasicPay >= otherThan13th) {
        otherFormsComp = otherThan13th;
      } else {
        otherFormsComp = excessAmountBasicPay;
      }

      // Calculate total non-taxable amount
      // totalNonTaxable = totalDem + otherFormsComp;

    
    }
    // Update the input fields with calculated values
    $('#other_forms').val(otherFormsComp.toFixed(2));
    // $('#total_non_tax').val(totalNonTaxable.toFixed(2));
   // calculateTotalNonTaxable()
    // calculateTaxableAmount()


  
}


// this function for calculating total non taxable
$(document).ready(function () {
  $('#gross_pay2, #total_deminimis,#other_forms,#allowance_basic,#late,#absent,#overtime,#holiday,#night_diff,#incentives,#adjustme_gross').on('input', function () {
    
    calculateTotalNonTaxable()
    
  });
});


function calculateTotalNonTaxable() {

  

  let totalDem = parseFloat($('#total_deminimis').val()) || 0;
  let totalOtherForm = parseFloat($('#other_forms').val()) || 0;

  let totalNonTaxable = 0;

 

  // Retrieve tax code and total basic input
  const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty
  totalNonTaxable = 0;

  if (taxCode.toLowerCase().includes('tax')){
    totalNonTaxable = totalDem + totalOtherForm;
  }



  $('#total_non_tax').val(totalNonTaxable.toFixed(2));
  //calculateOtherForms()
  //calculateTaxableAmount()

}




// this function id for computation of Taxable amount
$(document).ready(function () {
  $('#gross_pay2,#total_mandatory,#other_forms,#allowance_basic,#late,#late,#overtime,#holiday,#night_diff,#incentives,#adjustme_gross,#total_non_tax').on('input', function () {
    console.log("testing")
    calculateTaxableAmount();
    
  });
});

function calculateTaxableAmount() {

  console.log("If Ok for 2nd Call")
  

let grossPay = parseFloat($('#gross_pay2').val()) || 0;
let totalNonTaxable = parseFloat($('#total_non_tax').val()) || 0;
let totalgovtManda = parseFloat($('#total_mandatory').val()) || 0;
let taxableAmount;
let taxableAmountComp;

console.log('Grosspay',grossPay)
console.log('NonTaxable',totalNonTaxable)
console.log('GovMandatory',totalgovtManda)
taxableAmount = (grossPay - totalNonTaxable) - totalgovtManda



// Retrieve tax code and total basic input
const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty

taxableAmountComp = 0;

if (taxCode.toLowerCase().includes('tax')) {
    // console.log("if pumasok",taxableAmount)
  if (taxableAmount >= 0) {

    taxableAmountComp = taxableAmount
  };
   
}

$('#taxable_amount').val(taxableAmountComp.toFixed(2))

calculateWitheldTax();

};



// // this function id for computation of Taxable amount
// $(document).ready(function () {
//   $('#basic_pay,#gross_pay2,#total_non_tax,#total_mandatory,#taxable_amount').on('input', function () {
//     calculateWitheldTax();
//   });
// });

// function calculateWitheldTax() {

// const taxableAmount = parseFloat($('#taxable_amount').val()) || 0;


// let tax;

// // Retrieve tax code and total basic input
// const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty

// tax = 0;

// if (taxCode.toLowerCase().includes('tax')) {

//   const bracket_1 = [0, 20833];
//   const bracket_2 = [20833.01, 33333];
//   const bracket_3 = [33333.01, 66666];
//   const bracket_4 = [66667, 166666];
//   const bracket_5 = [166667, 666666];
//   // ... Add more rates corresponding to the brackets

//   // Apply tax rates based on the income brackets
//   const tax = [];

//   for (let income of [taxableAmount]) {
//       let incomeTax = 0;
//               if (income > bracket_1[0] && income <= bracket_1[1]) {
//                   incomeTax = parseFloat((income * 0).toFixed(2));
//               } else if (income > bracket_2[0] && income <= bracket_2[1]) {
//                   incomeTax = parseFloat(((income - 20833) * 0.15).toFixed(2));
//               } else if (income > bracket_3[0] && income <= bracket_3[1]) {
//                   incomeTax = parseFloat(((income - 33333) * 0.20 + 1875).toFixed(2));
//               } else if (income > bracket_4[0] && income <= bracket_4[1]) {
//                 incomeTax = parseFloat(((income - 66666) * 0.25 + 8541.80).toFixed(2));
//             } else if (income > bracket_5[0] && income <= bracket_5[1]) {
//               incomeTax = parseFloat(((income - 166667) * 0.30 + 33541.80).toFixed(2));
//           } 

//               tax.push(incomeTax);
//           }

//           let stringNumber = tax[0].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          
         
//           $('#with_holding_tax').val(tax.toFixed(2))
//         }
        
   
// };






// This function is for the computation of Withheld Tax
// $(document).ready(function () {
//   $('#basic_pay, #gross_pay2, #total_non_tax, #total_mandatory, #taxable_amount').on('input', function () {
//     calculateWitheldTax();
//   });
// });



$(document).ready(function () {
 // Attach event listeners to all relevant inputs
 $('#basic_pay, #gross_pay2, #total_non_tax, #total_mandatory, #taxable_amount,#other_forms').on('input', function () {

  calculateWitheldTax();
});


});





function calculateWitheldTax() {
  const taxableAmount = parseFloat($('#taxable_amount').val()) || 0;
  const taxCode = $('#tax_code').val() || 'MWE'; // Default to 'MWE' if empty
  let tax = 0;

  // Debug: Log the taxable amount and tax code
  // console.log('Taxable Amount:', taxableAmount, 'Tax Code:', taxCode);

  // Only calculate tax if the tax code includes "tax"
  if (taxCode.toLowerCase().includes('tax')) {
    // calculateTaxableAmount()
    // Tax brackets
    const brackets = [
      { min: 0, max: 20833, rate: 0, baseTax: 0 },
      { min: 20833.01, max: 33333, rate: 0.15, baseTax: 0 },
      { min: 33333.01, max: 66666, rate: 0.20, baseTax: 1875 },
      { min: 66667, max: 166666, rate: 0.25, baseTax: 8541.80 },
      { min: 166667, max: 666666, rate: 0.30, baseTax: 33541.80 },
    ];

    // Calculate tax based on brackets
    for (const bracket of brackets) {
      // console.log(`Checking bracket: ${bracket.min} to ${bracket.max}`);
      if (taxableAmount > bracket.min && taxableAmount <= bracket.max) {
        tax = parseFloat(
          ((taxableAmount - bracket.min) * bracket.rate + bracket.baseTax).toFixed(2)
        );
        // console.log(`Tax calculated: ${tax}`);
        break; // Stop checking once the applicable bracket is found
      }
    }
  }

  // Format the tax value with commas and two decimal places
  const formattedTax = tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Debug: Log the calculated tax
  // console.log('Formatted Tax:', formattedTax);

  // Set the value of the withheld tax input
  $('#with_holding_tax').val(tax.toFixed(2));
  calculateNetPay()
}



// this function id for computation of Taxable amount
$(document).ready(function () {
  $('#basic_pay,#gross_pay2,#total_non_tax,#total_mandatory,\
    #cash_advance,#other_deduction,#adjustment_other,#with_holding_tax').on('input', function () {
    calculateNetPay();
    // calculateWitheldTax()
  });
});

function calculateNetPay() {

const grossPay = parseFloat($('#gross_pay2').val()) || 0;
const totalMandatory = parseFloat($('#total_mandatory').val()) || 0;
const cashAdvance = parseFloat($('#cash_advance').val()) || 0;
const otherDeduction = parseFloat($('#other_deduction').val()) || 0;
const AdjustmentOther = parseFloat($('#adjustment_other').val()) || 0;
const withHoldingTax = parseFloat($('#with_holding_tax').val()) || 0;


let netPay;



netPay = grossPay - totalMandatory - cashAdvance - otherDeduction - AdjustmentOther - withHoldingTax




$('#net_pay').val(netPay.toFixed(2))


};


// this function is to insert data to salary_computation mongdb
$(document).ready(function () {
  // Function to handle form submission or data sending
  $('#btn_save_payroll_computation').on('click', function (e) {
      e.preventDefault();
      insertPayrollData();
  });
});

function insertPayrollData() {
  // Prepare the data object (ensure the fields match the API schema)
  const cashAdvance = parseFloat($('#cash_advance').val()) || 0;
  const otherDeduction = parseFloat($('#other_deduction').val()) || 0
  const dateInput = $('#date').val();
  const isoDate = new Date(dateInput).toISOString();
  
  let totalAdjustment = 0;
  let afterDeminis = 0;
  
  const salaryData = {
      
      // date: dateInput,
      date: isoDate,
      company: $('#company').val(),
      employee_id: $('#employee_id').val(),
      last_name: $('#last_name').val(),
      first_name: $('#first_name').val(),
      position: $('#position').val() || 'NA',
      salary_rate: parseFloat($('#salary_rate').val()) || 0,
      allowance: parseFloat($('#allowance').val()) || 0,
      tax_code: $('#tax_code').val(),
      basic_pay: parseFloat($('#basic_pay').val()) || 0,
      allowance_basic: parseFloat($('#allowance_basic').val()) || 0,
      late: parseFloat($('#late').val()) || 0,
      absent: parseFloat($('#absent').val()) || 0,
      overtime: parseFloat($('#overtime').val()) || 0,
      holiday: parseFloat($('#holiday').val()) || 0,
      night_diff: parseFloat($('#night_diff').val()) || 0,
      incentives: parseFloat($('#incentives').val()) || 0,
      adjustme_gross: parseFloat($('#adjustme_gross').val()) || 0,
      gross_pay: parseFloat($('#gross_pay2').val()) || 0,
      sss: parseFloat($('#sss').val()) || 0,
      phic: parseFloat($('#phic').val()) || 0,
      hdmf: parseFloat($('#hdmf').val()) || 0,
      total_mandatory: parseFloat($('#total_mandatory').val()) || 0,
      minimum_wage: parseFloat($('#minimum_wage').val()) || 0,
      total_basic: parseFloat($('#total_basic').val()) || 0,
      uniform: parseFloat($('#uniform').val()) || 0,
      rice: parseFloat($('#rice').val()) || 0,
      laundry: parseFloat($('#laundry').val()) || 0,
      medical1: parseFloat($('#medical1').val()) || 0,
      medical2: parseFloat($('#medical2').val()) || 0,
      total_deminis: parseFloat($('#total_deminis').val()) || 0,
      after_deminimis: afterDeminis,
      otherforms: parseFloat($('#other_forms').val()) || 0,
      taxable_amount: parseFloat($('#taxable_amount').val()) || 0,
      with_holding_tax: parseFloat($('#with_holding_tax').val()) || 0,
      cash_advance: parseFloat($('#cash_advance').val()) || 0,
      other_deduction: parseFloat($('#other_deduction').val()) || 0,
      total_deduction: cashAdvance + otherDeduction,
      adjustment_other: parseFloat($('#adjustment_other').val()) || 0,
      net_pay: parseFloat($('#net_pay').val()) || 0,
      gross_pay_MWE: parseFloat(0),
      ot_minimum: parseFloat(0),
      holiday_MWE: parseFloat(0),
      mandatory_MWE: parseFloat(0),
      mandatory_Taxable: parseFloat(0),
      not_subject: parseFloat(0),
      late_taxable: parseFloat(0),
     
  };
  console.log(salaryData)
  // Make an AJAX POST request
  $.ajax({
      url: "/api-insert-payroll-data/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(salaryData),
      success: function(response) {
          alert(response.message); // Display success message
          window.location.href = "/api-payroll-computation/"
      },
      error: function(xhr, status, error) {
          alert(`Error: ${xhr.responseJSON.detail}`); // Display error message
      }
  });
}

