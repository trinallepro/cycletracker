function getRidesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('rides')) || [];
}
