// *Validates the user input + redirects user to /reserva with parameters
function validateInput() {
    const checkIn = document.getElementById("check-in").value;
    const checkOut = document.getElementById("check-out").value;
    const adults = document.getElementById("adults").value;
    const children = document.getElementById("children-select").value;
    const babies = document.getElementById("baby-select").value;

    // Check if check-in and check-out dates are filled
    if (!checkIn || !checkOut) {
        alert("Check-in e Check-out precisam de um valor");
        return false;
    }

    // Validate that check-in date is in the future
    const today = new Date().toISOString().split("T")[0];
    if (checkIn < today) {
        alert("Data de Check-in precisa estar no futuro.");
        return false;
    }

    // Validate that check-out date is after check-in date
    if (checkOut <= checkIn) {
        alert("Data de Check-out precisa estar depois do Check-in");
        return false;
    }

    // Validate that at least one adult is present
    if (parseInt(adults, 10) <= 0) {
        alert("Precisa de pelo menos um adulto");
        return false;
    }

    // Max guests
    const maxGuests = 10; // Max guests (10 for now)
    const totalGuests = parseInt(adults, 10) + parseInt(children, 10) + parseInt(babies, 10);
    if (totalGuests > maxGuests) {
        alert(`Máximo de pessoas não pode passar de ${maxGuests}.`);
        return false;
    }

    return true; // Validation successful
}

function submitForm() {
    // Call validateInput to check all inputs before submission
    if (!validateInput()) {
        return; // Stop submission if validation fails
    }

    // If validation passes, proceed with redirect
    const checkIn = document.getElementById("check-in").value;
    const checkOut = document.getElementById("check-out").value;
    const adults = document.getElementById("adults").value;
    const children = document.getElementById("children-select").value;
    const babies = document.getElementById("baby-select").value;

    const url = `/reserva?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${encodeURIComponent(adults)}&children=${encodeURIComponent(children)}&babies=${encodeURIComponent(babies)}`;

    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', () => {
    // Função para formatar a data no formato yyyy-mm-dd
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Função para ajustar o checkout caso seja no mesmo dia do check-in
    function adjustCheckOut() {
        const checkInDate = new Date(document.getElementById("check-in").value);
        const checkOutDate = new Date(document.getElementById("check-out").value);
    
        // Se o check-out for igual ou anterior ao check-in, ajusta o check-out para o dia seguinte
        if (checkOutDate <= checkInDate) {
            checkOutDate.setDate(checkInDate.getDate() + 1);
            document.getElementById("check-out").value = formatDate(checkOutDate);
        }
    }
    
    // Definindo a data de hoje e amanhã para a validação mínima
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todayFormatted = formatDate(today);
    const tomorrowFormatted = formatDate(tomorrow);
    
    // Definindo as datas mínimas para os inputs
    document.getElementById("check-in").setAttribute("min", todayFormatted);
    document.getElementById("check-out").setAttribute("min", tomorrowFormatted);
    
    // Adicionando evento para garantir que o checkout seja sempre após o check-in
    document.getElementById("check-in").addEventListener("change", adjustCheckOut);
    document.getElementById("check-out").addEventListener("change", adjustCheckOut);
})