// TODO : enables/disables .stripeBtn
// Steps logic
const stepMultiplier = 50;
let currentStep = 0;
document.addEventListener('DOMContentLoaded', function () {
    const main = document.querySelector('main');
    const indicators = document.querySelectorAll('.indicator');
    const steps = document.querySelectorAll('section[class^="step"]');
    const totalSteps = steps.length;

    const prevArrow = document.querySelector('#prev-arrow');
    const nextArrow = document.querySelector('#next-arrow');

    // Updates slider with x-transform onclick of a button
    function updateStep(step) {
        currentStep = step;
        main.style.transform = `translateX(-${step * stepMultiplier}%)`;

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === step);
            indicator.classList.toggle('visited', index <= step);
        });

        prevArrow.disabled = currentStep === 0;
        nextArrow.disabled = currentStep === totalSteps - 1;
    }

    // Validate steps input to see if can updateStep()
    function validateStep(stepIndex) {
        const stepForm = steps[stepIndex]?.querySelector('form');
        if (stepForm) {

            const paymentButtons = stepForm.querySelectorAll('.square'); // .square class buttons
            const isPaymentSelected = Array.from(paymentButtons).some(button => button.classList.contains('active'));

            // Validates form
            if (stepForm.id === 'payment-form' && !isPaymentSelected) {    return false;   }

            return stepForm.checkValidity();
        }
        return true;
    }

    // Onclick buttons to change steps
    window.step = function (targetStep = null) {
        if (targetStep === null) return;
    
        if (targetStep > currentStep) {
            if (!validateStep(currentStep)) return;
            

            // transferDataToStep2();
            
        }
    
        updateStep(targetStep);
    };
});

// Get parameters from url and fill </form>
document.addEventListener("DOMContentLoaded", () => {
    // URL params
    const params = new URLSearchParams(window.location.search);

    const autofillForm = () => {       
        // Get inputs
        const adultsInput = document.getElementById("adults");
        const childrenInput = document.getElementById("children");
        const babiesInput = document.getElementById("babies");
        const checkinInput = document.getElementById("checkIn");
        const checkoutInput = document.getElementById("checkOut");

        // Inputs minimum values
        const adultsMin = parseInt(adultsInput.getAttribute("min"), 10);
        const childrenMin = parseInt(childrenInput.getAttribute("min"), 10);
        const babiesMin = parseInt(babiesInput.getAttribute("min"), 10);
        const checkinMin = checkinInput.getAttribute("min");
        const checkinMax = checkinInput.getAttribute("max");

        // inputs maximum values
        const adultsMax = parseInt(adultsInput.getAttribute("max"), 10);
        const childrenMax = parseInt(childrenInput.getAttribute("max"), 10);
        const babiesMax = parseInt(babiesInput.getAttribute("max"), 10);
        const checkoutMin = checkoutInput.getAttribute("min");
        const checkoutMax = checkoutInput.getAttribute("max");

        // Inputs minimum & maximum calculations + params
        const adults = Math.min(adultsMax, Math.max(adultsMin, parseInt(params.get("adults") || "1", 10)));
        const children = Math.min(childrenMax, Math.max(childrenMin, parseInt(params.get("children") || "0", 10)));
        const babies = Math.min(babiesMax, Math.max(babiesMin, parseInt(params.get("babies") || "0", 10)));

        // checkIn & checkOut params
        let checkInValue = params.get("checkIn") || "";
        let checkOutValue = params.get("checkOut") || "";

        // checkIn & checkOut validation min and max values
        if (checkinMin && new Date(checkInValue) < new Date(checkinMin)) {
            checkInValue = checkinMin; // Set to min if it's before the allowed range
        }
        if (checkinMax && new Date(checkInValue) > new Date(checkinMax)) {
            checkInValue = checkinMax; // Set to max if it's after the allowed range
        }
        if (checkoutMin && new Date(checkOutValue) < new Date(checkoutMin)) {
            checkOutValue = checkoutMin; // Set to min if it's before the allowed range
        }
        if (checkoutMax && new Date(checkOutValue) > new Date(checkoutMax)) {
            checkOutValue = checkoutMax; // Set to max if it's after the allowed range
        }
        // Ensure checkOut is at least one day after checkIn
        const checkInDate = new Date(checkInValue);
        const checkOutDate = new Date(checkOutValue);

        if (checkOutDate <= checkInDate) {
            checkInDate.setDate(checkInDate.getDate() + 1); // Add one day to checkIn
            checkOutValue = checkInDate.toISOString().split("T")[0];
        }

        // Insert inputs values
        adultsInput.value = adults;
        childrenInput.value = children;
        babiesInput.value = babies;
        checkinInput.value = checkInValue;
        checkoutInput.value = checkOutValue;
    };

    autofillForm(); // Fills .booking-form inputs
    checkRequiredFields(); // Verify the values are valid, if is : enable button

});

// * BOOKING-FORM LIVEVALUES

// Price per person in BRL (R$)
const adultPrice = 150; // BRL
const childPrice = 75; // BRL

// Function to update the values in #adults & #children HTML elements
function updateLiveValues(inputElement) {
    const inputId = inputElement.id; // ID of the input that was changed
  
    // Identifies the corresponding live value element
    let liveValueElement;
    let pricePerPerson;
  
    if (inputId === "adults") {
        // Adults element
      liveValueElement = document.getElementById("adultsLive");
      pricePerPerson = adultPrice;
    } else if (inputId === "children") {
        // Children element
      liveValueElement = document.getElementById("childrenLive");
      pricePerPerson = childPrice;
    }
  
    if (liveValueElement && pricePerPerson) {
      const quantity = parseInt(inputElement.value) || 0;
  
      // If the quantity is greater than 0, calculate the total; otherwise, leave it empty
      if (quantity > 0) {
        const total = quantity * pricePerPerson;
        liveValueElement.innerHTML = `${total},00<small>/noite</small>`;
        liveValueElement.style.opacity = '1'
      } else {
        liveValueElement.style.opacity = '0'
        // setTimeout() here because of opacity css animation
        setTimeout(() => {
            liveValueElement.textContent = ""; // Clears the text if the quantity is 0 or invalid
        }, '500')
      }
    }
}  

// Returns the difference between checkIn & checkOut in days
// Used in updateTotalLiveValues()
function calculateDaysBetweenDates() {
  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");

  const checkInDate = new Date(convertToISO(checkInInput.value)); // Converts dates to ISO format
  const checkOutDate = new Date(convertToISO(checkOutInput.value)); // Converts dates to ISO format

  // Validation
  if (!isNaN(checkInDate) && !isNaN(checkOutDate) && checkOutDate > checkInDate) {
    // Difference in miliseconds
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    // Convert to days
    const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return days;
  }

  return 0; // If no dates
}

// Updates #totalValueElement based on .liveValues HTML elements
// TODO : Verify why only works after 1001 miliseconds
function updateTotalLiveValues() {
    const liveValueElements = document.querySelectorAll(".liveValue");
    const totalValueElement = document.getElementById("totalValue");
  
    const days = calculateDaysBetweenDates(); // returns the days difference between checkIn & checkOut
    let total = 0;
  
    liveValueElements.forEach((element) => {
      const valueText = element.textContent.replace("R$", "").replace(",", ".").trim();
      const value = parseFloat(valueText) || 0;
      total += value;
    });
  
    total *= days; // Multioplies per day difference (good to reserva logic)
  
    // total value in #totalValueElement
    totalValueElement.textContent = total > 0 ? `Total: R$${total.toFixed(2)}` : "";
}

// Initial functions calls
document.addEventListener("DOMContentLoaded", () => {
    const adultsInput = document.getElementById("adults");
    const childrenInput = document.getElementById("children");

    updateLiveValues(adultsInput);
    updateLiveValues(childrenInput);

    /* 
        * updateTotalLiveValues(); Does not work for some reason...
        * Need to simulate user click the buttom in #adults...
    */
    setTimeout(() => {
        document.querySelector('.quantity #adults + button').click();
        document.querySelector('.quantity-down').click();
    }, '1001');
});



