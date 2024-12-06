document.addEventListener('DOMContentLoaded', function () {
    let historyList = document.getElementById('historyList');
    let rides = getRidesFromLocalStorage();

    rides.forEach(function(ride) {
        let li = document.createElement('li');
        li.innerHTML = `
            <p><strong>Date:</strong> ${ride.date}</p>
            <p><strong>Distance:</strong> ${ride.distance} km</p>
            <p><strong>Durée:</strong> ${ride.duration} s</p>
            <div id="map-${ride.date}" style="height: 300px;"></div>
        `;

        historyList.appendChild(li);

        // Créer une carte pour chaque sortie
        let map = L.map(`map-${ride.date}`).setView([ride.route[0].lat, ride.route[0].lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        let latLngs = ride.route.map(p => [p.lat, p.lon]);
        L.polyline(latLngs, { color: 'blue' }).addTo(map);
    });
});

function getRidesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('rides')) || [];
}
