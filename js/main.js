// Fonction pour calculer la distance entre deux points en kilomètres (formule Haversine)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en kilomètres
}

let rideData = {
    path: [],
    totalDistance: 0,
    startTime: null,
    endTime: null,
    duration: 0,
    intervalId: null,
    elapsedTime: 0
};

let map;
let marker;
let isRiding = false;
let watchId;

// Configuration de la géolocalisation avec haute précision
const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,  // Temps d'attente pour récupérer la position
    maximumAge: 0    // Toujours obtenir la position la plus récente
};

// Démarrer ou terminer la sortie en fonction de l'état
document.getElementById('startStopButton').addEventListener('click', function() {
    if (isRiding) {
        endRide();
    } else {
        startRide();
    }
});

// Démarrer la sortie
function startRide() {
    isRiding = true;
    rideData.path = [];
    rideData.totalDistance = 0;
    rideData.startTime = new Date();
    rideData.elapsedTime = 0;

    // Mettre à jour le bouton
    document.getElementById('startStopButton').textContent = "Terminer la sortie";

    // Initialiser la carte
    map = L.map('map').setView([48.8566, 2.3522], 13);  // Position initiale sur Paris (lat, lon)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Utilisation de la géolocalisation pour collecter la position GPS avec options haute précision
    watchId = navigator.geolocation.watchPosition(updatePosition, handleError, geoOptions);

    // Démarrer le chronomètre
    rideData.intervalId = setInterval(updateTimer, 1000);
}

// Arrêter la sortie
function endRide() {
    isRiding = false;
    rideData.endTime = new Date();
    rideData.duration = (rideData.endTime - rideData.startTime) / 1000 / 60; // En minutes

    // Calcul de la vitesse moyenne
    let speed = rideData.totalDistance / (rideData.duration / 60); // km/h

    // Sauvegarder la sortie dans le localStorage
    let rides = JSON.parse(localStorage.getItem('rides')) || [];
    rides.push({
        date: new Date().toISOString(),
        distance: rideData.totalDistance,
        duration: rideData.duration,
        speed: speed,
        path: rideData.path
    });
    localStorage.setItem('rides', JSON.stringify(rides));

    alert(`Sortie terminée! Vitesse Moyenne: ${speed.toFixed(2)} km/h`);

    // Réinitialiser l'interface
    document.getElementById('startStopButton').textContent = "Démarrer la sortie";
    document.getElementById('distance').textContent = "Distance: 0 km";
    document.getElementById('speed').textContent = "Vitesse Moyenne: 0 km/h";
    document.getElementById('time').textContent = "Temps: 00:00";

    // Arrêter le chronomètre et la géolocalisation
    clearInterval(rideData.intervalId);
    navigator.geolocation.clearWatch(watchId);
}

// Mettre à jour le chronomètre
function updateTimer() {
    rideData.elapsedTime++;
    let minutes = Math.floor(rideData.elapsedTime / 60);
    let seconds = rideData.elapsedTime % 60;
    document.getElementById('time').textContent = `Temps: ${formatTime(minutes)}:${formatTime(seconds)}`;
}

// Formater le temps
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Mettre à jour la position et calculer la distance
function updatePosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // Ajouter la position au parcours
    rideData.path.push([lat, lon]);

    // Si c'est la première position, placer un marqueur initial
    if (!marker) {
        marker = L.marker([lat, lon]).addTo(map);
        map.setView([lat, lon], 14);
    } else {
        marker.setLatLng([lat, lon]);
    }

    // Calcul de la distance parcourue
    if (rideData.path.length > 1) {
        let lastPoint = rideData.path[rideData.path.length - 2];
        let distance = haversine(lastPoint[0], lastPoint[1], lat, lon);
        rideData.totalDistance += distance;
    }

    // Afficher la distance et la vitesse moyenne
    document.getElementById('distance').textContent = `Distance: ${rideData.totalDistance.toFixed(2)} km`;
    document.getElementById('speed').textContent = `Vitesse Moyenne: ${(rideData.totalDistance / (rideData.elapsedTime / 60)).toFixed(2)} km/h`;

    // Tracer le parcours sur la carte
    if (rideData.path.length > 1) {
        L.polyline(rideData.path, { color: 'blue' }).addTo(map);
    }
}

// Gérer les erreurs de géolocalisation
function handleError(error) {
    alert("Erreur de géolocalisation: " + error.message);
}
